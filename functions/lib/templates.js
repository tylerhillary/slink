'use strict';

const config = require('./config');

const NAVY = '#1e2a78';
const NAVY_DEEP = '#151f5c';
const INK = '#0b0d14';
const MUTED = '#5b6172';
const LINE = '#e4e7ee';
const TINT = '#eef0fb';
const PAPER_ALT = '#f7f8fa';

function escapeHtml(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatList(values) {
  const items = (Array.isArray(values) ? values : [values]).filter(Boolean);
  if (!items.length) return 'Not specified';
  if (items.length === 1) return String(items[0]);
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function firstName(fullName) {
  const name = String(fullName || '').trim();
  if (!name) return 'there';
  return name.split(/\s+/)[0];
}

function hasName(value) {
  return Boolean(String(value || '').trim());
}

/** Capitalises a name used at the start of a sentence ("your tutor" fallback). */
function opensSentence(value) {
  const text = String(value || '');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Wraps body HTML in the branded email shell. */
function shell({ preheader, heading, eyebrow, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER_ALT};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader || '')}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER_ALT};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid ${LINE};border-radius:12px;overflow:hidden;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">

  <tr><td style="background:${NAVY};padding:22px 32px;">
    <span style="color:#ffffff;font-size:19px;font-weight:700;letter-spacing:-0.02em;">Slink<span style="color:#aab4f0;">360</span></span>
    <span style="color:rgba(255,255,255,0.6);font-size:11px;float:right;padding-top:7px;">A ${escapeHtml(config.parentBrand)} platform</span>
  </td></tr>

  <tr><td style="padding:34px 32px 8px 32px;">
    ${eyebrow ? `<p style="margin:0 0 10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${NAVY};font-weight:700;">${escapeHtml(eyebrow)}</p>` : ''}
    <h1 style="margin:0;font-size:25px;line-height:1.25;color:${INK};font-weight:700;letter-spacing:-0.02em;">${escapeHtml(heading)}</h1>
  </td></tr>

  <tr><td style="padding:14px 32px 30px 32px;color:${INK};font-size:15px;line-height:1.65;">
    ${body}
  </td></tr>

  <tr><td style="background:${PAPER_ALT};border-top:1px solid ${LINE};padding:22px 32px;color:${MUTED};font-size:12px;line-height:1.65;">
    <p style="margin:0 0 8px;color:${INK};font-weight:600;font-size:13px;">Slink360 &middot; ${escapeHtml(config.parentBrand)}</p>
    <p style="margin:0 0 10px;">Everyone here has something to learn and something worth teaching.</p>
    <p style="margin:0;">
      <a href="mailto:${escapeHtml(config.supportEmail)}" style="color:${NAVY};text-decoration:none;">${escapeHtml(config.supportEmail)}</a>
      &nbsp;&middot;&nbsp; ${escapeHtml(config.adminPhone)}
      &nbsp;&middot;&nbsp; Port Harcourt, Nigeria
    </p>
    <p style="margin:12px 0 0;color:#8b91a1;">You are receiving this because you registered at
      <a href="${escapeHtml(config.siteUrl)}" style="color:${MUTED};">slink-beta.vercel.app</a>.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function button(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 6px;">
    <tr><td style="background:${NAVY};border-radius:8px;">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">${escapeHtml(label)}</a>
    </td></tr></table>`;
}

function detailRow(label, value) {
  if (!value) return '';
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid ${LINE};color:${MUTED};font-size:13px;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:9px 0;border-bottom:1px solid ${LINE};color:${INK};font-size:14px;font-weight:600;vertical-align:top;">${value}</td>
  </tr>`;
}

function detailTable(rows) {
  const body = rows.filter(Boolean).join('');
  if (!body) return '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 4px;">${body}</table>`;
}

function calloutCard(title, rows) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="margin:22px 0;background:${TINT};border:1px solid #d5dbf5;border-radius:10px;">
    <tr><td style="padding:20px 22px;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${NAVY_DEEP};font-weight:700;">${escapeHtml(title)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows.filter(Boolean).join('')}</table>
    </td></tr>
  </table>`;
}

function steps(items) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 6px;">
    ${items.map((item, index) => `<tr>
      <td width="30" style="padding:7px 0;vertical-align:top;color:${NAVY};font-size:13px;font-weight:700;">${String(index + 1).padStart(2, '0')}</td>
      <td style="padding:7px 0;vertical-align:top;color:${INK};font-size:14px;line-height:1.6;">${item}</td>
    </tr>`).join('')}
  </table>`;
}

function contactLinks(person, includePhone) {
  const bits = [];
  if (person.email) {
    bits.push(`<a href="mailto:${escapeHtml(person.email)}" style="color:${NAVY};text-decoration:none;">${escapeHtml(person.email)}</a>`);
  }
  if (includePhone && person.phone) {
    const dial = String(person.phone).replace(/[^\d+]/g, '');
    bits.push(`<a href="tel:${escapeHtml(dial)}" style="color:${NAVY};text-decoration:none;">${escapeHtml(person.phone)}</a>`);
  }
  return bits.join('<br>');
}

/* ------------------------------------------------------------------ *
 * 1. Acknowledgement - sent the moment a registration is written.
 * ------------------------------------------------------------------ */
function registrationReceived({ registration, registrationId }) {
  const name = firstName(registration.fullName);
  const learnSkill = registration.selectedSkill || 'your chosen skill';
  const teachSkills = formatList(registration.teachSkills);

  const body = `
    <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;">Your registration is in, and it is already in front of our matching desk. Here is exactly what we have on file for you:</p>
    ${detailTable([
      detailRow('You want to learn', escapeHtml(learnSkill)),
      detailRow('You can teach', escapeHtml(teachSkills)),
      detailRow('Based in', escapeHtml(registration.location || 'Not provided')),
      detailRow('Reference', `<span style="font-family:Consolas,Menlo,monospace;font-size:13px;">${escapeHtml(registrationId)}</span>`),
    ])}
    <p style="margin:20px 0 6px;font-weight:600;">What happens next</p>
    ${steps([
      'We verify your details and the expertise you have listed.',
      'We look for a member who teaches what you want to learn <em>and</em> wants to learn something you teach.',
      'The moment that person exists, we email you both an introduction with contact details.',
      'You agree the shape of the exchange together: how many sessions, how often, and what you will each have to show at the end.',
    ])}
    <p style="margin:18px 0 0;">Most members hear back within 24 hours. If nobody on the exchange fits your trade yet, we hold your registration open and introduce you the day the right person joins &mdash; you do not need to do anything or register again.</p>
    <p style="margin:16px 0 0;">Every match here is reciprocal. You will be teaching as well as learning, and that is what makes it hold together.</p>
    ${button(`${config.siteUrl}/about.html`, 'How the exchange works')}
    <p style="margin:18px 0 0;color:${MUTED};font-size:13px;">Something to add or correct? Just reply to this email &mdash; it reaches the concierge desk directly.</p>
  `;

  return {
    subject: `Your Slink360 registration is in - ${learnSkill}`,
    html: shell({
      preheader: `We have your registration for ${learnSkill}. Here is what happens next.`,
      eyebrow: 'Registration received',
      heading: 'We have your registration.',
      body,
    }),
  };
}

/* ------------------------------------------------------------------ *
 * 2. Introduction - one for each side of the pair.
 * ------------------------------------------------------------------ */
function quoteBlock(text) {
  return `<div style="margin:16px 0 6px;padding:18px 20px;background:${PAPER_ALT};border-left:3px solid ${NAVY};border-radius:0 8px 8px 0;
      white-space:pre-wrap;font-size:14px;line-height:1.7;color:${INK};">${escapeHtml(text)}</div>`;
}

function noteCard({ tone, title, lines }) {
  const palette = tone === 'waiting'
    ? { bg: '#fdf3e2', border: '#efd9ab', label: '#9a6400' }
    : { bg: '#e8f5ef', border: '#bfe3d2', label: '#0f7b52' };
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="margin:24px 0 6px;background:${palette.bg};border:1px solid ${palette.border};border-radius:10px;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${palette.label};font-weight:700;">${escapeHtml(title)}</p>
      ${lines.map((l) => `<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:${INK};">${l}</p>`).join('')}
    </td></tr>
  </table>`;
}

/**
 * To the student. The student is the one who opens the conversation, so this
 * email hands them a ready-to-send message rather than telling them to wait.
 */
function studentIntroduction({ student, tutor, learnSkill, teachBack, matchId }) {
  const name = firstName(student.fullName);
  // Sentence positions use the display name so a missing name still reads;
  // the first name is only used where we address the tutor directly.
  const named = hasName(tutor.fullName);
  const tutorName = named ? tutor.fullName : 'your tutor';
  const tutorFirst = named ? firstName(tutor.fullName) : '';
  const includePhone = config.sharePhone;

  const draft = [
    named ? `Hello ${tutorFirst},` : 'Hello,',
    '',
    `Slink360 has matched us on the exchange — I am learning ${learnSkill}, which you teach.${teachBack ? ` I can teach you ${teachBack} in return.` : ''}`,
    '',
    'Would you have time for a short call this week? I would like us to agree how many sessions we will run, how often, and what we should each have to show at the end.',
    '',
    'Looking forward to it.',
    '',
    student.fullName || '',
  ].join('\n');

  const mailto = `mailto:${tutor.email || config.supportEmail}`
    + `?subject=${encodeURIComponent(`Slink360 — starting ${learnSkill} with you`)}`
    + `&body=${encodeURIComponent(draft)}`;

  const body = `
    <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;">We have found someone to teach you <strong>${escapeHtml(learnSkill)}</strong>.
      ${teachBack
        ? `${escapeHtml(opensSentence(tutorName))} is also hoping to learn <strong>${escapeHtml(teachBack)}</strong>, which you teach &mdash; so this is an even trade in both directions.`
        : `${escapeHtml(opensSentence(tutorName))} has not named a skill you already teach, so do open the conversation with what you could offer back.`}</p>

    ${calloutCard('Your tutor', [
      detailRow('Name', escapeHtml(tutorName)),
      detailRow('Based in', escapeHtml(tutor.location || 'Not provided')),
      detailRow('Teaches', escapeHtml(formatList(tutor.teachSkills))),
      detailRow('Wants to learn', escapeHtml(tutor.selectedSkill || 'Not specified')),
      detailRow('Contact', contactLinks(tutor, includePhone) || 'Via our concierge desk'),
    ])}

    <p style="margin:22px 0 6px;font-weight:600;">The next move is yours</p>
    <p style="margin:0 0 4px;">${escapeHtml(opensSentence(tutorName))} knows you are coming &mdash; we have written to them as well &mdash; but on this exchange the student makes first contact. Send them a note this week. If it helps, here is one you can use as it stands:</p>
    ${quoteBlock(draft)}
    ${button(mailto, named ? `Email ${tutorFirst} now` : 'Email your tutor now')}
    <p style="margin:10px 0 0;color:${MUTED};font-size:13px;">That button opens your email app with the message already written. Edit it however you like before sending.</p>

    <p style="margin:24px 0 6px;font-weight:600;">Then settle the shape of it</p>
    ${steps([
      'How many sessions, and how often.',
      'What you will each have to show at the end &mdash; a portfolio piece, a working project, a passed test.',
      `What you are giving back${teachBack ? `, starting with ${escapeHtml(teachBack)}` : ''}.`,
    ])}

    <p style="margin:20px 0 0;">If the fit is not right, tell us early. Re-pairing is free, expected, and never awkward &mdash; a bad match is data, not a failure.</p>
    <p style="margin:18px 0 0;color:${MUTED};font-size:13px;">
      Match reference <span style="font-family:Consolas,Menlo,monospace;">${escapeHtml(matchId)}</span>.
      Questions, or need a re-match? Reply here or call ${escapeHtml(config.adminPhone)}.
    </p>
  `;

  return {
    subject: named ? `Your ${learnSkill} tutor — meet ${tutorName}` : `Your ${learnSkill} tutor`,
    html: shell({
      preheader: `${tutorName} will teach you ${learnSkill}. Send them a note this week.`,
      eyebrow: teachBack ? 'Reciprocal match' : 'Tutor found',
      heading: named ? `Meet your tutor, ${tutorName}.` : 'Meet your tutor.',
      body,
    }),
  };
}

/**
 * To the tutor. Leads with the student, then tells them honestly where their
 * own learning goal stands — matched, still being looked for, or not asked for.
 */
function tutorNotification({ tutor, student, teachSkill, tutorLearns, tutorGoal, matchId }) {
  const name = firstName(tutor.fullName);
  const named = hasName(student.fullName);
  const studentName = named ? student.fullName : 'Your new student';
  const studentFirst = named ? firstName(student.fullName) : 'They';
  const includePhone = config.sharePhone;

  let ownGoalCard = '';
  if (tutorLearns) {
    ownGoalCard = noteCard({
      tone: 'good',
      title: 'Your own goal is covered too',
      lines: [
        `${escapeHtml(studentName)} teaches <strong>${escapeHtml(tutorLearns)}</strong>, the skill you came here to learn. This is a two-way trade: you teach ${escapeHtml(teachSkill)}, they teach ${escapeHtml(tutorLearns)}.`,
        'Agree both directions in the same conversation so neither side quietly becomes the favour.',
      ],
    });
  } else if (tutorGoal) {
    ownGoalCard = noteCard({
      tone: 'waiting',
      title: 'Still looking for your tutor',
      lines: [
        `Nobody on the exchange currently teaches <strong>${escapeHtml(tutorGoal)}</strong>, the skill you asked to learn. We have not matched you on that yet.`,
        'Your registration stays open and we are still looking. The day someone joins who can teach it, we will email you an introduction &mdash; you do not need to do anything, and you should not register again.',
        `In the meantime, teaching ${escapeHtml(teachSkill)} does not use up your place in the queue. You remain first in line for ${escapeHtml(tutorGoal)}.`,
      ],
    });
  }

  const body = `
    <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;">You have a student. We have matched <strong>${escapeHtml(studentName)}</strong> with you for <strong>${escapeHtml(teachSkill)}</strong>.</p>

    ${calloutCard('Your student', [
      detailRow('Name', escapeHtml(studentName)),
      detailRow('Based in', escapeHtml(student.location || 'Not provided')),
      detailRow('Wants to learn', escapeHtml(student.selectedSkill || teachSkill)),
      detailRow('Can teach', escapeHtml(formatList(student.teachSkills))),
      detailRow('Contact', contactLinks(student, includePhone) || 'Via our concierge desk'),
    ])}

    <p style="margin:22px 0 6px;font-weight:600;">What happens next</p>
    <p style="margin:0;">${escapeHtml(studentFirst)} will email you directly over the next few days &mdash; on this exchange the student makes first contact, and we have asked them to. You do not need to do anything until then. If you would rather open the conversation yourself, their address is above.</p>

    <p style="margin:20px 0 6px;font-weight:600;">When they write, agree three things</p>
    ${steps([
      'How many sessions, and how often you will meet.',
      'What they should have to show at the end.',
      'What they are giving back, and when.',
    ])}

    ${ownGoalCard}

    <p style="margin:20px 0 0;">If you cannot take this student right now, or the fit is wrong, just reply and say so. We will re-pair them without fuss and it counts against nobody.</p>
    <p style="margin:18px 0 0;color:${MUTED};font-size:13px;">
      Match reference <span style="font-family:Consolas,Menlo,monospace;">${escapeHtml(matchId)}</span>.
      Questions? Reply here or call ${escapeHtml(config.adminPhone)}.
    </p>
  `;

  return {
    subject: `You have a student — ${studentName} for ${teachSkill}`,
    html: shell({
      preheader: `${studentName} has been matched with you for ${teachSkill}. They will be in touch shortly.`,
      eyebrow: 'New student',
      heading: 'You have a student.',
      body,
    }),
  };
}

/* ------------------------------------------------------------------ *
 * 3. Admin notifications.
 * ------------------------------------------------------------------ */
function adminMatchNotice({ a, b, aLearns, bLearns, reciprocal, score, matchId }) {
  const person = (p, learns) => `${escapeHtml(p.fullName || '-')}<br>
    <span style="font-weight:400;color:${MUTED};">${escapeHtml(p.email || '-')}${p.phone ? ` &middot; ${escapeHtml(p.phone)}` : ''}</span><br>
    <span style="font-weight:400;color:${MUTED};">${learns ? `learns ${escapeHtml(learns)}` : 'learns nothing from this pair'}</span>`;

  const body = `
    <p style="margin:0 0 16px;">An automatic introduction has just gone out. Both sides now have each other's contact details.</p>
    ${detailTable([
      detailRow('Match ID', `<span style="font-family:Consolas,Menlo,monospace;font-size:13px;">${escapeHtml(matchId)}</span>`),
      detailRow('Type', reciprocal ? 'Reciprocal (two-way trade)' : 'One-way introduction'),
      detailRow('Score', String(score)),
      detailRow('Side A', person(a, aLearns)),
      detailRow('Side B', person(b, bLearns)),
      detailRow('B source', escapeHtml(b.source || 'registration')),
    ])}
    ${button(`https://console.firebase.google.com/project/${config.projectId}/firestore/data/~2Fmatches~2F${matchId}`, 'Open in Firestore')}
  `;

  return {
    subject: `[Slink360] Auto-match sent - ${a.fullName || 'member'} + ${b.fullName || 'member'}`,
    html: shell({ preheader: 'An automatic introduction has been sent.', eyebrow: 'Admin', heading: 'Automatic introduction sent.', body }),
  };
}

function adminUnmatchedNotice({ registration, registrationId, reason }) {
  const body = `
    <p style="margin:0 0 16px;">A registration came in but no automatic introduction was sent. It is holding at <strong>pending</strong> and will be picked up by the next sweep, or you can pair it by hand.</p>
    ${detailTable([
      detailRow('Reference', `<span style="font-family:Consolas,Menlo,monospace;font-size:13px;">${escapeHtml(registrationId)}</span>`),
      detailRow('Reason', escapeHtml(reason)),
      detailRow('Name', escapeHtml(registration.fullName || '-')),
      detailRow('Email', escapeHtml(registration.email || '-')),
      detailRow('Phone', escapeHtml(registration.phone || registration.contactPhone || '-')),
      detailRow('Location', escapeHtml(registration.location || '-')),
      detailRow('Wants to learn', escapeHtml(registration.selectedSkill || '-')),
      detailRow('Can teach', escapeHtml(formatList(registration.teachSkills))),
    ])}
    ${button(`https://console.firebase.google.com/project/${config.projectId}/firestore/data/~2Fregistrations~2F${registrationId}`, 'Open in Firestore')}
  `;

  return {
    subject: `[Slink360] No match yet - ${registration.fullName || 'new registration'} (${registration.selectedSkill || 'unspecified'})`,
    html: shell({ preheader: 'A registration is waiting for a match.', eyebrow: 'Admin', heading: 'Registration waiting for a match.', body }),
  };
}

function adminContactNotice({ submission, submissionId }) {
  const body = `
    <p style="margin:0 0 16px;">A new message has arrived from the contact form.</p>
    ${detailTable([
      detailRow('From', escapeHtml(submission.name || '-')),
      detailRow('Email', escapeHtml(submission.email || '-')),
      detailRow('Phone', escapeHtml(submission.phone || '-')),
      detailRow('Topic', escapeHtml(submission.topic || '-')),
      detailRow('Subject', escapeHtml(submission.subject || '-')),
    ])}
    <p style="margin:20px 0 6px;font-weight:600;">Message</p>
    <div style="padding:16px 18px;background:${PAPER_ALT};border-left:3px solid ${NAVY};border-radius:0 8px 8px 0;white-space:pre-wrap;font-size:14px;line-height:1.65;">${escapeHtml(submission.message || '')}</div>
    ${button(`https://console.firebase.google.com/project/${config.projectId}/firestore/data/~2FcontactSubmissions~2F${submissionId}`, 'Open in Firestore')}
  `;

  return {
    subject: `[Slink360] Contact form - ${submission.subject || submission.topic || 'new message'}`,
    html: shell({ preheader: `New message from ${submission.name || 'a visitor'}.`, eyebrow: 'Admin', heading: 'New contact message.', body }),
    replyTo: submission.email || undefined,
  };
}

module.exports = {
  registrationReceived,
  studentIntroduction,
  tutorNotification,
  adminMatchNotice,
  adminUnmatchedNotice,
  adminContactNotice,
  escapeHtml,
  formatList,
  firstName,
};
