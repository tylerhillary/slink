'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const firestore = admin.firestore();

const DEFAULT_ADMIN_PHONE = process.env.SKILLBANK_ADMIN_PHONE || functions.config().skillbank?.admin_phone || '+234-812-820-4201';
const MAX_TEACHER_RESULTS = parseInt(process.env.SKILLBANK_MAX_TEACHER_RESULTS || functions.config().skillbank?.max_teacher_results || '3', 10);
const SUGGESTION_FETCH_LIMIT = Math.max(MAX_TEACHER_RESULTS * 3, MAX_TEACHER_RESULTS + 5);

functions.logger.info('Email notifications disabled; using logging-only admin alerts.');

exports.onRegistrationCreated = functions.firestore
  .document('registrations/{registrationId}')
  .onCreate(async (snap, context) => {
    const registrationId = context.params.registrationId;
    const data = snap.data() || {};

    try {
      await notifyAdminOfRegistration({ registrationId, data });
    } catch (error) {
      functions.logger.error('Registration admin notification failed', { registrationId, error });
    }

    return null;
  });

exports.onContactSubmissionCreated = functions.firestore
  .document('contactSubmissions/{submissionId}')
  .onCreate(async (snap, context) => {
    const submissionId = context.params.submissionId;
    const data = snap.data() || {};

    try {
      await notifyAdminOfContactSubmission({ submissionId, data });
    } catch (error) {
      functions.logger.error('Contact admin notification failed', { submissionId, error });
    }

    return null;
  });

async function notifyAdminOfRegistration({ registrationId, data }) {
  const learnerName = data.fullName || 'Unnamed learner';
  const learnerEmail = data.email || data.contactEmail || '';
  const learnerPhone = data.phone || data.contactPhone || '';
  const skill = data.selectedSkill || 'Not specified';
  const location = data.location || 'Not provided';
  const intent = data.intent || 'learn';
  const timestamp = data.createdAt?.toDate?.() || new Date();

  const suggestedTeachers = skill
    ? await findMatchingTeachers(skill, { excludeRegistrationId: registrationId })
    : [];

  const consoleLink = buildFirestoreConsoleLink('registrations', registrationId);
  const submittedAt = timestamp instanceof Date ? timestamp.toISOString() : new Date(timestamp).toISOString();

  functions.logger.info('Registration captured (email notifications disabled)', {
    registrationId,
    learner: {
      name: learnerName,
      email: learnerEmail,
      phone: learnerPhone,
      location,
      intent,
      skillRequested: skill,
      submittedAt,
    },
    suggestedTeachers: suggestedTeachers.map(mapSuggestionForLog),
    consoleLink,
    adminHelpline: DEFAULT_ADMIN_PHONE,
  });
}

async function notifyAdminOfContactSubmission({ submissionId, data }) {
  const name = data.name || 'No name provided';
  const email = data.email || data.contactEmail || '';
  const phone = data.phone || data.contactPhone || '';
  const topic = data.topic || 'No topic provided';
  const subjectLine = data.subject || 'No subject provided';
  const message = data.message || 'No message provided';
  const timestamp = data.timestamp?.toDate?.() || new Date();

  const consoleLink = buildFirestoreConsoleLink('contactSubmissions', submissionId);
  const submittedAt = timestamp instanceof Date ? timestamp.toISOString() : new Date(timestamp).toISOString();

  functions.logger.info('Contact submission captured (email notifications disabled)', {
    submissionId,
    contact: {
      name,
      email,
      phone,
      topic,
      subject: subjectLine,
      message,
      submittedAt,
    },
    consoleLink,
    adminHelpline: DEFAULT_ADMIN_PHONE,
  });
}

async function findMatchingTeachers(skillInput, options = {}) {
  const normalizedLower = normalizeSkill(skillInput);
  if (!normalizedLower) {
    return [];
  }

  const { excludeRegistrationId } = options;
  const normalizedTitle = toTitleCase(skillInput);
  const suggestions = [];
  const seen = new Set();

  const queryPlans = [
    () => queryRegistrationsBySkill({
      field: 'teachSkillsIndex',
      value: normalizedLower,
      excludeId: excludeRegistrationId,
    }),
    normalizedTitle
      ? () => queryRegistrationsBySkill({
        field: 'teachSkills',
        value: normalizedTitle,
        excludeId: excludeRegistrationId,
      })
      : null,
    () => queryTeachersBySkill({
      field: 'skillsIndex',
      value: normalizedLower,
    }),
    normalizedTitle
      ? () => queryTeachersBySkill({
        field: 'skillsOffered',
        value: normalizedTitle,
      })
      : null,
  ].filter(Boolean);

  for (const executeQuery of queryPlans) {
    if (suggestions.length >= MAX_TEACHER_RESULTS) {
      break;
    }

    try {
      const candidates = await executeQuery();
      for (const candidate of candidates) {
        const dedupeKey = getSuggestionDedupeKey(candidate);
        if (!dedupeKey || seen.has(dedupeKey)) {
          continue;
        }
        seen.add(dedupeKey);
        suggestions.push(candidate);
        if (suggestions.length >= MAX_TEACHER_RESULTS) {
          break;
        }
      }
    } catch (error) {
      functions.logger.error('Failed to collect tutor suggestions', { skill: normalizedLower, error });
    }
  }

  return suggestions.slice(0, MAX_TEACHER_RESULTS);
}

function normalizeSkill(skill) {
  if (!skill || typeof skill !== 'string') {
    return '';
  }

  return skill.trim().toLowerCase();
}

function buildFirestoreConsoleLink(collection, docId) {
  const projectId = process.env.GCLOUD_PROJECT || 'slink-website';
  return `https://console.firebase.google.com/project/${projectId}/firestore/data/~2F${collection}~2F${docId}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function queryRegistrationsBySkill({ field, value, excludeId }) {
  if (!value) {
    return [];
  }

  try {
    const snapshot = await firestore
      .collection('registrations')
      .where(field, 'array-contains', value)
      .limit(SUGGESTION_FETCH_LIMIT)
      .get();

    return snapshot.docs
      .filter((doc) => doc.id !== excludeId)
      .map((doc) => mapRegistrationDocToSuggestion(doc));
  } catch (error) {
    functions.logger.error('Failed to query registrations for tutor suggestions', { field, value, error });
    return [];
  }
}

async function queryTeachersBySkill({ field, value }) {
  if (!value) {
    return [];
  }

  try {
    const snapshot = await firestore
      .collection('teachers')
      .where(field, 'array-contains', value)
      .limit(SUGGESTION_FETCH_LIMIT)
      .get();

    return snapshot.docs.map((doc) => mapTeacherDocToSuggestion(doc));
  } catch (error) {
    if (error?.code === 7 || error?.code === 'failed-precondition') {
      functions.logger.warn('Index missing for teachers query', { field, value });
    } else {
      functions.logger.error('Failed to query teacher profiles', { field, value, error });
    }
    return [];
  }
}

function mapRegistrationDocToSuggestion(doc) {
  const data = doc.data() || {};
  const skills = extractSkillNames(data.teachSkills || data.skillsOffered);
  const suggestion = {
    id: doc.id,
    name: data.fullName || data.name || 'Unknown tutor',
    email: data.email || data.contactEmail || '',
    phone: data.phone || data.contactPhone || '',
    availability: data.availability || data.preferredSchedule || '',
    location: data.location || '',
    skillsOffered: skills,
    skillsFormatted: skills.join(', '),
    source: 'registration',
    consoleLink: buildFirestoreConsoleLink('registrations', doc.id),
  };

  if (Array.isArray(data.teachSkillsIndex)) {
    suggestion.skillsIndex = data.teachSkillsIndex;
  }

  return suggestion;
}

function mapTeacherDocToSuggestion(doc) {
  const data = doc.data() || {};
  const skills = extractSkillNames(data.skillsOffered || data.skills || data.skillsLabel);
  return {
    id: doc.id,
    name: data.name || data.fullName || 'Unknown tutor',
    email: data.email || data.contactEmail || '',
    phone: data.phone || data.contactPhone || '',
    availability: data.availability || data.schedule || '',
    location: data.location || data.city || '',
    skillsOffered: skills,
    skillsFormatted: skills.join(', '),
    source: 'teacher profile',
    consoleLink: buildFirestoreConsoleLink('teachers', doc.id),
  };
}

function extractSkillNames(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    const names = value.map((skill) => {
      if (typeof skill === 'string') {
        return skill.trim();
      }
      if (skill && typeof skill === 'object') {
        return (skill.name || skill.title || '').trim();
      }
      return '';
    }).filter(Boolean);
    return Array.from(new Set(names));
  }

  if (typeof value === 'string') {
    return [value.trim()].filter(Boolean);
  }

  return [];
}

function mapSuggestionForLog(teacher) {
  if (!teacher) {
    return {};
  }

  const skills = Array.isArray(teacher.skillsOffered)
    ? teacher.skillsOffered
    : extractSkillNames(teacher.skillsOffered || teacher.skills || teacher.skillsLabel);

  return {
    id: teacher.id || '',
    name: teacher.name || teacher.fullName || 'Unknown tutor',
    email: teacher.email || teacher.contactEmail || '',
    phone: teacher.phone || teacher.contactPhone || '',
    availability: teacher.availability || teacher.schedule || '',
    location: teacher.location || teacher.city || '',
    source: formatTutorSource(teacher.source) || '',
    consoleLink: teacher.consoleLink || '',
    skills,
  };
}

function formatTutorSource(source) {
  if (!source) {
    return '';
  }

  if (source === 'registration') {
    return 'Registration record';
  }

  if (source === 'teacher profile') {
    return 'Teacher profile';
  }

  return source;
}

function toTitleCase(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getSuggestionDedupeKey(suggestion) {
  if (!suggestion) {
    return '';
  }

  if (suggestion.email) {
    return suggestion.email.trim().toLowerCase();
  }

  return suggestion.id ? `id:${suggestion.id}` : '';
}
