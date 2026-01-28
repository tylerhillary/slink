// Skill selection functionality

// Variable to store the selected skill
let selectedSkill = null;
let skillSearchQuery = '';

const SUGGESTED_TUTOR_LIMIT = 5;

const suggestedMatchesState = {
  learner: {
    fullName: '',
    email: '',
    location: '',
    skill: '',
  },
  requestId: 0,
  cache: new Map(),
};

const suggestedMatchesElements = {
  section: null,
  studentName: null,
  studentSkill: null,
  studentLocation: null,
  studentEmail: null,
  loadingMessage: null,
  emptyMessage: null,
  list: null,
};

let firestoreContextPromise = null;
let skipNextLearnerRefresh = false;

const teachSkillsState = {
  options: new Map(),
  selected: [],
  filteredOptions: [],
  activeOptionIndex: -1,
  elements: {
    combobox: null,
    input: null,
    options: null,
    selected: null,
    hidden: null,
  },
  closeOptionsTimeout: null,
};

function getTeachSkillsElements() {
  return teachSkillsState.elements;
}

async function getFirestoreContext() {
  if (!firestoreContextPromise) {
    firestoreContextPromise = (async () => {
      try {
        const [firestoreModule, firebaseInit] = await Promise.all([
          import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js'),
          import('./firebase-init.js'),
        ]);

        const {
          addDoc,
          collection,
          serverTimestamp,
          getDocs,
          onSnapshot,
          query,
          where,
          orderBy,
          limit,
        } = firestoreModule;
        const { db } = firebaseInit;

        return {
          addDoc,
          serverTimestamp,
          getDocs,
          onSnapshot,
          query,
          where,
          orderBy,
          limit,
          registrationsCollection: collection(db, 'registrations'),
          skillsCollection: collection(db, 'skills'),
          teachersCollection: collection(db, 'teachers'),
        };
      } catch (error) {
        console.error('Failed to load Firestore dependencies for skill registration.', error);
        firestoreContextPromise = null;
        throw error;
      }
    })();
  }

  return firestoreContextPromise;
}

// Function to select a skill
function normalizeSkillName(name) {
  if (!name) {
    return '';
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function addTeachSkillOption(skillName) {
  const normalized = normalizeSkillName(skillName);
  if (!normalized) {
    return;
  }

  const key = normalized.toLowerCase();
  if (!teachSkillsState.options.has(key)) {
    teachSkillsState.options.set(key, {
      value: normalized,
      key,
      labelLower: key,
    });
  }
}

function removeTeachSkillOption(skillName) {
  const key = normalizeSkillName(skillName).toLowerCase();
  if (!key) {
    return;
  }
  teachSkillsState.options.delete(key);
}

function getSelectedTeachSkills() {
  return [...teachSkillsState.selected];
}

function updateTeachSkillsHiddenField() {
  const { hidden } = getTeachSkillsElements();
  if (hidden) {
    hidden.value = teachSkillsState.selected.join(', ');
    hidden.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function renderTeachSkillsSelected() {
  const { selected, combobox, input } = getTeachSkillsElements();
  if (!selected) {
    return;
  }

  selected.innerHTML = '';

  teachSkillsState.selected.forEach((skill) => {
    const item = document.createElement('li');
    item.className = 'teach-skills-chip';
    item.innerHTML = `
      <span class="teach-skills-chip__label">${escapeHtml(skill)}</span>
      <button type="button" class="teach-skills-chip__remove" data-skill="${escapeHtml(skill)}" aria-label="Remove ${escapeHtml(skill)}">×</button>
    `;
    selected.appendChild(item);
  });

  selected.classList.toggle('is-empty', teachSkillsState.selected.length === 0);
  combobox?.classList.toggle('has-selection', teachSkillsState.selected.length > 0);
  if (input && !input.value && teachSkillsState.selected.length === 0) {
    input.placeholder = 'Start typing to add a skill';
  }

  updateTeachSkillsHiddenField();
}

function addTeachSkillToSelected(skillName) {
  const normalized = normalizeSkillName(skillName);
  if (!normalized) {
    return false;
  }

  const key = normalized.toLowerCase();
  if (teachSkillsState.selected.some((skill) => skill.toLowerCase() === key)) {
    return false;
  }

  teachSkillsState.selected.push(normalized);
  teachSkillsState.selected.sort((a, b) => a.localeCompare(b));
  renderTeachSkillsSelected();
  return true;
}

function removeTeachSkillFromSelected(skillName) {
  const key = skillName.toLowerCase();
  const next = teachSkillsState.selected.filter((skill) => skill.toLowerCase() !== key);
  if (next.length !== teachSkillsState.selected.length) {
    teachSkillsState.selected = next;
    renderTeachSkillsSelected();
    filterTeachSkillOptions(getTeachSkillsElements().input?.value || '');
  }
}

function clearTeachSkillsSelection() {
  teachSkillsState.selected = [];
  renderTeachSkillsSelected();
  filterTeachSkillOptions('');
}

function setTeachSkillsComboboxExpanded(isExpanded) {
  const { combobox } = getTeachSkillsElements();
  if (!combobox) {
    return;
  }

  combobox.setAttribute('aria-expanded', String(isExpanded));
  combobox.classList.toggle('is-open', Boolean(isExpanded));
}

function updateTeachSkillsActiveDescendant() {
  const { input } = getTeachSkillsElements();
  if (!input) {
    return;
  }

  if (teachSkillsState.activeOptionIndex >= 0) {
    input.setAttribute('aria-activedescendant', `teachSkillsOption-${teachSkillsState.activeOptionIndex}`);
  } else {
    input.removeAttribute('aria-activedescendant');
  }
}

function highlightTeachSkillOption(index) {
  const { options } = getTeachSkillsElements();
  if (!options || teachSkillsState.filteredOptions.length === 0) {
    teachSkillsState.activeOptionIndex = -1;
    updateTeachSkillsActiveDescendant();
    return;
  }

  const boundedIndex = ((index % teachSkillsState.filteredOptions.length) + teachSkillsState.filteredOptions.length) % teachSkillsState.filteredOptions.length;
  teachSkillsState.activeOptionIndex = boundedIndex;

  Array.from(options.children).forEach((optionEl) => {
    optionEl.classList.remove('is-active');
  });

  const activeOption = options.children[boundedIndex];
  if (activeOption) {
    activeOption.classList.add('is-active');
    activeOption.scrollIntoView({ block: 'nearest' });
  }

  updateTeachSkillsActiveDescendant();
}

function renderTeachSkillsOptions() {
  const { options } = getTeachSkillsElements();
  if (!options) {
    return;
  }

  options.innerHTML = '';

  teachSkillsState.filteredOptions.forEach((option, index) => {
    const optionEl = document.createElement('div');
    optionEl.id = `teachSkillsOption-${index}`;
    optionEl.className = 'teach-skills-option';
    optionEl.setAttribute('role', 'option');
    optionEl.dataset.index = String(index);
    optionEl.dataset.value = option.actualValue;
    optionEl.innerHTML = option.isCustom
      ? `<span class="teach-skills-option__label">Add <strong>${escapeHtml(option.actualValue)}</strong></span>`
      : `<span class="teach-skills-option__label">${escapeHtml(option.actualValue)}</span>`;
    options.appendChild(optionEl);
  });

  if (teachSkillsState.filteredOptions.length === 0) {
    setTeachSkillsComboboxExpanded(false);
    teachSkillsState.activeOptionIndex = -1;
    updateTeachSkillsActiveDescendant();
    return;
  }

  setTeachSkillsComboboxExpanded(true);
  teachSkillsState.activeOptionIndex = 0;
  highlightTeachSkillOption(0);
}

function filterTeachSkillOptions(query) {
  const normalizedQuery = (query || '').trim().toLowerCase();
  const selectedSet = new Set(teachSkillsState.selected.map((skill) => skill.toLowerCase()));
  let filtered = Array.from(teachSkillsState.options.values())
    .filter((option) => !selectedSet.has(option.key));

  if (normalizedQuery) {
    filtered = filtered.filter((option) => option.labelLower.includes(normalizedQuery));
  }

  filtered.sort((a, b) => a.value.localeCompare(b.value));

  const normalizedName = normalizeSkillName(query);
  const normalizedKey = normalizedName.toLowerCase();
  const shouldShowCreateOption = Boolean(normalizedName)
    && !teachSkillsState.options.has(normalizedKey)
    && !selectedSet.has(normalizedKey);

  const results = filtered.map((option) => ({
    actualValue: option.value,
    key: option.key,
    isCustom: false,
  }));

  if (shouldShowCreateOption) {
    results.unshift({
      actualValue: normalizedName,
      key: `custom-${normalizedKey}`,
      isCustom: true,
    });
  }

  teachSkillsState.filteredOptions = results.slice(0, 8);
  renderTeachSkillsOptions();
}

function commitTeachSkillSelection() {
  const { input } = getTeachSkillsElements();
  if (!input) {
    return;
  }

  let value = '';
  if (teachSkillsState.activeOptionIndex >= 0) {
    const activeOption = teachSkillsState.filteredOptions[teachSkillsState.activeOptionIndex];
    value = activeOption?.actualValue || '';
  } else {
    value = normalizeSkillName(input.value);
  }

  if (!value) {
    return;
  }

  addTeachSkillOption(value);
  const added = addTeachSkillToSelected(value);
  if (added) {
    filterTeachSkillOptions('');
  }

  input.value = '';
  setTeachSkillsComboboxExpanded(false);
}

function showTeachSkillsOptions() {
  const { input } = getTeachSkillsElements();
  if (teachSkillsState.closeOptionsTimeout) {
    clearTimeout(teachSkillsState.closeOptionsTimeout);
    teachSkillsState.closeOptionsTimeout = null;
  }

  filterTeachSkillOptions(input?.value || '');
}

function hideTeachSkillsOptions() {
  setTeachSkillsComboboxExpanded(false);
  teachSkillsState.activeOptionIndex = -1;
  updateTeachSkillsActiveDescendant();
}

function scheduleHideTeachSkillsOptions() {
  if (teachSkillsState.closeOptionsTimeout) {
    clearTimeout(teachSkillsState.closeOptionsTimeout);
  }
  teachSkillsState.closeOptionsTimeout = setTimeout(() => {
    hideTeachSkillsOptions();
    teachSkillsState.closeOptionsTimeout = null;
  }, 120);
}

function handleTeachSkillInput(event) {
  showTeachSkillsOptions();
  filterTeachSkillOptions(event.target.value || '');
}

function handleTeachSkillKeyDown(event) {
  const { key } = event;

  if (key === 'ArrowDown') {
    event.preventDefault();
    if (!teachSkillsState.filteredOptions.length) {
      filterTeachSkillOptions(event.target.value || '');
    } else {
      highlightTeachSkillOption(teachSkillsState.activeOptionIndex + 1);
    }
    return;
  }

  if (key === 'ArrowUp') {
    event.preventDefault();
    if (!teachSkillsState.filteredOptions.length) {
      filterTeachSkillOptions(event.target.value || '');
    } else {
      highlightTeachSkillOption(teachSkillsState.activeOptionIndex - 1);
    }
    return;
  }

  if (key === 'Enter' || key === 'Tab' || key === ',') {
    const currentValue = event.target.value.trim();
    if (!currentValue && key === 'Tab') {
      return;
    }

    event.preventDefault();
    commitTeachSkillSelection();
    return;
  }

  if (key === 'Backspace') {
    const { input } = getTeachSkillsElements();
    if (input && !input.value && teachSkillsState.selected.length > 0) {
      event.preventDefault();
      removeTeachSkillFromSelected(teachSkillsState.selected[teachSkillsState.selected.length - 1]);
      filterTeachSkillOptions('');
    }
  }
}

function handleTeachSkillsOptionClick(event) {
  const optionEl = event.target.closest('.teach-skills-option');
  if (!optionEl) {
    return;
  }

  const value = optionEl.dataset.value;
  if (!value) {
    return;
  }

  addTeachSkillOption(value);
  if (addTeachSkillToSelected(value)) {
    filterTeachSkillOptions('');
  }

  const { input } = getTeachSkillsElements();
  if (input) {
    input.value = '';
    input.focus({ preventScroll: true });
  }

  hideTeachSkillsOptions();
}

function handleTeachSkillsSelectedClick(event) {
  const removeButton = event.target.closest('.teach-skills-chip__remove');
  if (!removeButton) {
    return;
  }

  const { skill } = removeButton.dataset;
  if (!skill) {
    return;
  }

  removeTeachSkillFromSelected(skill);

  const { input } = getTeachSkillsElements();
  input?.focus({ preventScroll: true });
}

function collectInitialTeachSkillOptions() {
  const skillCards = document.querySelectorAll('.skill-card[data-skill]');
  skillCards.forEach((card) => {
    const skillName = card.getAttribute('data-skill');
    addTeachSkillOption(skillName);
  });

  const selectedSkillField = document.getElementById('selectedSkillField');
  selectedSkillField?.querySelectorAll('option').forEach((option) => {
    addTeachSkillOption(option.value);
  });
}

function prefillTeachSkillsFromExistingValues() {
  const { hidden } = getTeachSkillsElements();
  const stored = localStorage.getItem('registrationData');
  let skills = [];

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed.teachSkills)) {
        skills = skills.concat(parsed.teachSkills);
      }
    } catch (error) {
      console.warn('Unable to parse stored registration data.', error);
    }
  }

  if (hidden && hidden.value) {
    skills = skills.concat(hidden.value.split(',').map((skill) => skill.trim()).filter(Boolean));
  }

  const uniqueSkills = Array.from(new Set(skills.map((skill) => normalizeSkillName(skill)).filter(Boolean)));
  uniqueSkills.forEach((skill) => {
    addTeachSkillOption(skill);
    addTeachSkillToSelected(skill);
  });
}

function initializeTeachSkillsCombobox() {
  const elements = getTeachSkillsElements();
  elements.combobox = document.getElementById('teachSkillsCombobox');
  elements.input = document.getElementById('teachSkillsInput');
  elements.options = document.getElementById('teachSkillsOptionsList');
  elements.selected = document.getElementById('teachSkillsSelected');
  elements.hidden = document.getElementById('teachSkillsHidden');

  if (!elements.combobox || !elements.input || !elements.options || !elements.selected || !elements.hidden) {
    return;
  }

  collectInitialTeachSkillOptions();
  prefillTeachSkillsFromExistingValues();
  renderTeachSkillsSelected();
  filterTeachSkillOptions(elements.input.value || '');

  elements.input.addEventListener('input', handleTeachSkillInput);
  elements.input.addEventListener('keydown', handleTeachSkillKeyDown);
  elements.input.addEventListener('focus', showTeachSkillsOptions);
  elements.input.addEventListener('blur', scheduleHideTeachSkillsOptions);

  elements.options.addEventListener('mousedown', (event) => {
    event.preventDefault();
  });
  elements.options.addEventListener('click', handleTeachSkillsOptionClick);
  elements.selected.addEventListener('click', handleTeachSkillsSelectedClick);

  const registrationForm = document.getElementById('skillRegistrationForm');
  registrationForm?.addEventListener('reset', () => {
    clearTeachSkillsSelection();
    const { input } = getTeachSkillsElements();
    if (input) {
      input.value = '';
    }
  });
}

function initializeSuggestedMatchesUI() {
  suggestedMatchesElements.section = document.getElementById('suggestedMatchesSection');
  if (!suggestedMatchesElements.section) {
    return;
  }

  suggestedMatchesElements.studentName = document.getElementById('suggestedStudentName');
  suggestedMatchesElements.studentSkill = document.getElementById('suggestedStudentSkill');
  suggestedMatchesElements.studentLocation = document.getElementById('suggestedStudentLocation');
  suggestedMatchesElements.studentEmail = document.getElementById('suggestedStudentEmail');
  suggestedMatchesElements.loadingMessage = document.getElementById('suggestedMatchesLoading');
  suggestedMatchesElements.emptyMessage = document.getElementById('suggestedMatchesEmpty');
  suggestedMatchesElements.list = document.getElementById('suggestedMatchesList');

  const syncFromFormHandler = () => {
    refreshLearnerDetailsFromForm();
  };

  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const locationSelect = document.getElementById('location');
  const skillSelect = document.getElementById('selectedSkillField');

  fullNameInput?.addEventListener('input', syncFromFormHandler);
  emailInput?.addEventListener('input', syncFromFormHandler);
  locationSelect?.addEventListener('change', syncFromFormHandler);
  skillSelect?.addEventListener('change', syncFromFormHandler);

  const registrationForm = document.getElementById('skillRegistrationForm');
  registrationForm?.addEventListener('reset', () => {
    window.requestAnimationFrame(() => {
      refreshLearnerDetailsFromForm({ forceFetch: true });
    });
  });

  refreshLearnerDetailsFromForm();
}

function refreshLearnerDetailsFromForm(options = {}) {
  if (skipNextLearnerRefresh) {
    skipNextLearnerRefresh = false;
    return;
  }

  const skillsDropdownValue = document.getElementById('selectedSkillField')?.value || '';
  const newState = {
    fullName: document.getElementById('fullName')?.value?.trim() || '',
    email: document.getElementById('email')?.value?.trim() || '',
    location: document.getElementById('location')?.value || '',
    skill: selectedSkill || normalizeSkillName(skillsDropdownValue),
  };

  updateLearnerMatchState(newState, options);
}

function updateLearnerMatchState(updates, options = {}) {
  const normalizedUpdates = { ...updates };
  Object.keys(normalizedUpdates).forEach((key) => {
    const value = normalizedUpdates[key];
    if (typeof value === 'string') {
      normalizedUpdates[key] = value.trim();
    }
  });

  let changed = false;
  Object.entries(normalizedUpdates).forEach(([key, value]) => {
    if (suggestedMatchesState.learner[key] !== value) {
      suggestedMatchesState.learner[key] = value;
      changed = true;
    }
  });

  syncSuggestedLearnerSummary();
  ensureSuggestedMatchesVisibility();

  if (changed || options.forceFetch) {
    refreshSuggestedMatches({ force: options.forceFetch });
  }
}

function ensureSuggestedMatchesVisibility() {
  const { section } = suggestedMatchesElements;
  if (!section) {
    return;
  }

  const { skill, location, fullName, email } = suggestedMatchesState.learner;
  const hasInputs = Boolean(skill || location || fullName || email);
  const hasRenderedMatches = Boolean(suggestedMatchesElements.list?.childElementCount);
  section.hidden = !hasInputs && !hasRenderedMatches;
}

function syncSuggestedLearnerSummary() {
  const {
    studentName,
    studentSkill,
    studentLocation,
    studentEmail,
  } = suggestedMatchesElements;

  if (!studentName || !studentSkill || !studentLocation || !studentEmail) {
    return;
  }

  const {
    fullName,
    skill,
    location,
    email,
  } = suggestedMatchesState.learner;

  studentName.textContent = fullName || 'Your name';
  studentSkill.textContent = skill || 'Select a skill to begin';
  studentLocation.textContent = location || 'No state selected';
  studentEmail.textContent = email || 'Provide your email to connect';
}

function setSuggestedMatchesLoading(isLoading, message) {
  const { loadingMessage } = suggestedMatchesElements;
  if (!loadingMessage) {
    return;
  }

  if (typeof message === 'string') {
    loadingMessage.textContent = message;
  }

  loadingMessage.hidden = !isLoading;
}

function renderSuggestedMatches(matches) {
  const { list, emptyMessage } = suggestedMatchesElements;
  if (!list || !emptyMessage) {
    return;
  }

  list.innerHTML = '';

  if (!Array.isArray(matches) || matches.length === 0) {
    setSuggestedMatchesLoading(false);
    emptyMessage.hidden = false;
    return;
  }

  emptyMessage.hidden = true;
  setSuggestedMatchesLoading(false);

  const fragment = document.createDocumentFragment();
  matches.forEach((match) => {
    fragment.appendChild(createSuggestedMatchCard(match));
  });

  list.appendChild(fragment);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createSuggestedMatchCard(match) {
  const card = document.createElement('article');
  card.className = 'suggested-match-card';
  card.setAttribute('role', 'listitem');

  const skills = Array.isArray(match.skills) && match.skills.length
    ? match.skills.join(', ')
    : 'Skill details pending';

  const lines = [
    `<p class="suggested-match-card__line"><strong>Skills:</strong> ${escapeHtml(skills)}</p>`,
  ];

  if (match.availability) {
    lines.push(`<p class="suggested-match-card__line"><strong>Availability:</strong> ${escapeHtml(match.availability)}</p>`);
  }
  if (match.email) {
    const safeEmail = escapeHtml(match.email);
    lines.push(`<p class="suggested-match-card__line"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>`);
  }
  if (match.phone) {
    const safePhone = escapeHtml(match.phone);
    lines.push(`<p class="suggested-match-card__line"><strong>Phone:</strong> <a href="tel:${safePhone}">${safePhone}</a></p>`);
  }
  if (match.notes) {
    lines.push(`<p class="suggested-match-card__notes">${escapeHtml(match.notes)}</p>`);
  }

  card.innerHTML = `
    <header class="suggested-match-card__header">
      <h3>${escapeHtml(match.name || 'Tutor')}</h3>
      ${match.location ? `<span class="suggested-match-card__location">${escapeHtml(match.location)}</span>` : ''}
    </header>
    <div class="suggested-match-card__content">
      ${lines.join('')}
    </div>
  `;

  return card;
}

function extractSkillNamesForMatch(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return Array.from(new Set(value.map((entry) => {
      if (typeof entry === 'string') {
        return entry.trim();
      }
      if (entry && typeof entry === 'object') {
        return (entry.name || entry.title || '').trim();
      }
      return '';
    }).filter(Boolean)));
  }

  if (typeof value === 'string') {
    return [value.trim()].filter(Boolean);
  }

  return [];
}

async function refreshSuggestedMatches(options = {}) {
  const { section, emptyMessage, list } = suggestedMatchesElements;
  if (!section || !emptyMessage || !list) {
    return;
  }

  const { skill, location } = suggestedMatchesState.learner;
  ensureSuggestedMatchesVisibility();

  const hasSkill = Boolean(skill);
  const hasLocation = Boolean(location);

  if (!hasSkill || !hasLocation) {
    list.innerHTML = '';
    emptyMessage.hidden = true;
    if (!hasSkill && !hasLocation) {
      setSuggestedMatchesLoading(true, 'Select a skill and state to see tutors near you.');
    } else if (!hasSkill) {
      setSuggestedMatchesLoading(true, 'Select a skill to see tutors in your state.');
    } else {
      setSuggestedMatchesLoading(true, 'Choose your state to find tutors near you.');
    }
    return;
  }

  const cacheKey = `${skill.toLowerCase()}__${location.toLowerCase()}`;
  if (!options.force && suggestedMatchesState.cache.has(cacheKey)) {
    setSuggestedMatchesLoading(false);
    renderSuggestedMatches(suggestedMatchesState.cache.get(cacheKey));
    return;
  }

  const requestId = ++suggestedMatchesState.requestId;
  setSuggestedMatchesLoading(true, `Looking for tutors in ${location}...`);
  emptyMessage.hidden = true;
  list.innerHTML = '';

  try {
    const matches = await fetchTutorMatches(skill, location);
    if (requestId !== suggestedMatchesState.requestId) {
      return;
    }
    suggestedMatchesState.cache.set(cacheKey, matches);
    renderSuggestedMatches(matches);
  } catch (error) {
    if (requestId !== suggestedMatchesState.requestId) {
      return;
    }
    console.error('Failed to load suggested tutor matches.', error);
    setSuggestedMatchesLoading(false, 'We ran into an issue while finding tutors. Please try again.');
    suggestedMatchesElements.emptyMessage.hidden = false;
  }
}

async function fetchTutorMatches(skill, location) {
  const normalizedSkill = normalizeSkillName(skill);
  if (!normalizedSkill) {
    return [];
  }

  try {
    const {
      registrationsCollection,
      teachersCollection,
      getDocs,
      query,
      where,
      limit,
    } = await getFirestoreContext();

    if (!registrationsCollection || !getDocs || !query || !where) {
      return [];
    }

    const seen = new Set();
    const matches = [];

    const addMatch = (match) => {
      if (!match) {
        return;
      }
      const dedupeKey = (match.email || match.phone || match.id || '').toLowerCase();
      if (dedupeKey && seen.has(dedupeKey)) {
        return;
      }
      if (dedupeKey) {
        seen.add(dedupeKey);
      }
      matches.push(match);
    };

    const registrationQuery = limit
      ? query(
          registrationsCollection,
          where('location', '==', location),
          where('teachSkills', 'array-contains', normalizedSkill),
          limit(SUGGESTED_TUTOR_LIMIT * 2),
        )
      : query(
          registrationsCollection,
          where('location', '==', location),
          where('teachSkills', 'array-contains', normalizedSkill),
        );

    let registrationSnapshot;
    try {
      registrationSnapshot = await getDocs(registrationQuery);
    } catch (error) {
      const missingIndex = error?.code === 'failed-precondition' || /index/.test(error?.message || '');
      if (!missingIndex) {
        throw error;
      }

      const fallbackQuery = limit
        ? query(
            registrationsCollection,
            where('location', '==', location),
            limit(SUGGESTED_TUTOR_LIMIT * 3),
          )
        : query(
            registrationsCollection,
            where('location', '==', location),
          );
      registrationSnapshot = await getDocs(fallbackQuery);
    }

    registrationSnapshot.forEach((doc) => {
      if (matches.length >= SUGGESTED_TUTOR_LIMIT) {
        return;
      }
      const data = doc.data() || {};
      if (data.intent && data.intent !== 'teach') {
        return;
      }
      const skillsOffered = Array.isArray(data.teachSkills) ? data.teachSkills : [];
      if (!skillsOffered.includes(normalizedSkill)) {
        return;
      }
      addMatch({
        id: doc.id,
        name: data.fullName || data.name || 'Tutor',
        email: data.email || data.contactEmail || '',
        phone: data.phone || data.contactPhone || '',
        availability: data.availability || data.preferredSchedule || '',
        location: data.location || '',
        skills: skillsOffered,
        notes: data.bio || data.experience || '',
      });
    });

    if (matches.length >= SUGGESTED_TUTOR_LIMIT || !teachersCollection) {
      return matches.slice(0, SUGGESTED_TUTOR_LIMIT);
    }

    const lowercaseSkill = normalizedSkill.toLowerCase();
    const teacherPlans = [
      () => query(
        teachersCollection,
        where('location', '==', location),
        where('skillsIndex', 'array-contains', lowercaseSkill),
        limit ? limit(SUGGESTED_TUTOR_LIMIT * 2) : undefined,
      ),
    ];

    if (!lowercaseSkill) {
      teacherPlans.length = 0;
    }

    for (const buildQuery of teacherPlans) {
      if (matches.length >= SUGGESTED_TUTOR_LIMIT) {
        break;
      }

      let teacherQuery;
      try {
        const result = buildQuery();
        teacherQuery = Array.isArray(result)
          ? result[0]
          : result;
      } catch (error) {
        console.error('Failed to prepare teacher query.', error);
        continue;
      }

      if (!teacherQuery) {
        continue;
      }

      try {
        const snapshot = await getDocs(teacherQuery);
        snapshot.forEach((doc) => {
          if (matches.length >= SUGGESTED_TUTOR_LIMIT) {
            return;
          }
          const data = doc.data() || {};
          const skills = extractSkillNamesForMatch(data.skillsIndex || data.skillsOffered || data.skills || data.skillsLabel);
          if (!skills.some((skillName) => skillName.toLowerCase() === lowercaseSkill)) {
            return;
          }
          addMatch({
            id: doc.id,
            name: data.name || data.fullName || 'Tutor',
            email: data.email || data.contactEmail || '',
            phone: data.phone || data.contactPhone || '',
            availability: data.availability || data.schedule || '',
            location: data.location || data.city || '',
            skills,
            notes: data.bio || data.summary || data.about || '',
          });
        });
      } catch (error) {
        const missingIndex = error?.code === 'failed-precondition' || /index/.test(error?.message || '');
        if (!missingIndex) {
          console.error('Failed to query teacher profiles for suggestions.', error);
        }
      }
    }

    return matches.slice(0, SUGGESTED_TUTOR_LIMIT);
  } catch (error) {
    console.error('Unable to fetch tutor matches.', error);
    return [];
  }
}

function applySkillSearchFilter(query) {
  const skillsGrid = document.querySelector('.skills-grid');
  if (!skillsGrid) {
    return;
  }

  const normalizedQuery = (query || '').trim().toLowerCase();
  const cards = Array.from(skillsGrid.querySelectorAll('.skill-card[data-skill]'));
  let matchCount = 0;

  cards.forEach((card) => {
    const skillName = card.getAttribute('data-skill') || '';
    const title = card.querySelector('.skill-card__title')?.textContent || '';
    const description = card.querySelector('.skill-card__description')?.textContent || '';
    const searchable = `${skillName} ${title} ${description}`.toLowerCase();
    const isMatch = !normalizedQuery || searchable.includes(normalizedQuery);

    card.style.display = isMatch ? '' : 'none';
    if (isMatch) {
      matchCount += 1;
    }
  });

  let emptyState = skillsGrid.querySelector('.skill-search-empty');
  if (!matchCount && normalizedQuery) {
    if (!emptyState) {
      emptyState = document.createElement('div');
      emptyState.className = 'skill-search-empty';
      emptyState.innerHTML = '<p>No skills match "<span></span>".</p>';
      skillsGrid.appendChild(emptyState);
    }
    const span = emptyState.querySelector('span');
    if (span) {
      span.textContent = query;
    }
    emptyState.style.display = 'flex';
  } else if (emptyState) {
    emptyState.style.display = 'none';
  }

  return matchCount;
}

function refreshSkillSearchResults() {
  const helper = document.getElementById('skillSearchHelper');
  const clearButton = document.getElementById('clearSkillSearch');
  const matches = applySkillSearchFilter(skillSearchQuery);

  if (clearButton) {
    clearButton.hidden = !skillSearchQuery;
  }

  if (!helper) {
    return;
  }

  if (!skillSearchQuery) {
    helper.textContent = 'Showing all skills';
    helper.classList.remove('skill-search__helper--muted');
    return;
  }

  helper.classList.add('skill-search__helper--muted');
  if (matches === 0) {
    helper.textContent = `No skills match "${skillSearchQuery}".`;
  } else if (matches === 1) {
    helper.textContent = 'Showing 1 skill';
  } else {
    helper.textContent = `Showing ${matches} skills`;
  }
}

function setupSkillSearch() {
  const searchInput = document.getElementById('skillSearchInput');
  const clearButton = document.getElementById('clearSkillSearch');

  if (!searchInput) {
    refreshSkillSearchResults();
    return;
  }

  const applySearch = (value) => {
    skillSearchQuery = value.trim();
    refreshSkillSearchResults();
  };

  searchInput.addEventListener('input', (event) => {
    applySearch(event.target.value || '');
  });

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && searchInput.value) {
      searchInput.value = '';
      applySearch('');
      event.preventDefault();
    }
  });

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      if (!searchInput.value) {
        return;
      }
      searchInput.value = '';
      searchInput.focus({ preventScroll: true });
      applySearch('');
    });
  }

  applySearch(searchInput.value || skillSearchQuery || '');
}

function selectSkill(evt, skillName) {
  const normalizedSkill = normalizeSkillName(skillName);
  if (!normalizedSkill) {
    return;
  }

  const previousSkill = selectedSkill;
  selectedSkill = normalizedSkill;
  const selectedSkillLabel = document.getElementById('selectedSkill');
  if (selectedSkillLabel) {
    selectedSkillLabel.textContent = normalizedSkill;
  }

  if (previousSkill !== normalizedSkill) {
    const selectedSkillMessage = document.getElementById('selectedSkillMessage');
    if (selectedSkillMessage) {
      selectedSkillMessage.textContent = 'Great choice! Complete the form below to finalize your registration.';
    }
  }

  const registerButton = document.getElementById('registerSkillBtn');
  if (registerButton) {
    registerButton.disabled = false;
    registerButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const allCards = Array.from(document.querySelectorAll('.skill-card'));
  allCards.forEach(card => card.classList.remove('selected'));

  const targetCard = evt?.currentTarget || allCards.find(card => {
    const cardSkill = card.getAttribute('data-skill');
    return cardSkill === normalizedSkill;
  });

  targetCard?.classList.add('selected');

  const selectedSkillField = document.getElementById('selectedSkillField');
  if (selectedSkillField) {
    addSkillToSelects(normalizedSkill);
    selectedSkillField.value = normalizedSkill;
  }

  updateLearnerMatchState({ skill: normalizedSkill });

  const formIsVisible = document.getElementById('registrationFormSection')?.style.display !== 'none';
  registerSkill(null, { autoTriggered: true, skipScroll: formIsVisible && previousSkill === normalizedSkill });
}

window.selectSkill = selectSkill;

function addSkillToSelects(skillName) {
  const normalizedSkill = normalizeSkillName(skillName);
  if (!normalizedSkill) {
    return;
  }

  const selectedSkillField = document.getElementById('selectedSkillField');
  if (selectedSkillField) {
    const exists = Array.from(selectedSkillField.options).some(option => option.value === normalizedSkill);
    if (!exists) {
      const option = document.createElement('option');
      option.value = normalizedSkill;
      option.textContent = normalizedSkill;
      selectedSkillField.appendChild(option);
    }
  }
}

function createOrUpdateSkillCard({ name, icon, description, id }) {
  const normalizedName = normalizeSkillName(name);
  if (!normalizedName) {
    return;
  }

  const skillsGrid = document.querySelector('.skills-grid');
  if (!skillsGrid) {
    return;
  }

  const iconDisplay = (icon && icon.trim()) || '✨';
  const descriptionDisplay = (description && description.trim()) || 'Start learning this skill today.';

  let card = skillsGrid.querySelector(`.skill-card[data-skill="${normalizedName}"]`);

  if (!card) {
    card = document.createElement('div');
    card.className = 'skill-card skill-card--dynamic';
    card.setAttribute('data-skill', normalizedName);
    card.innerHTML = `
      <div class="skill-card__icon" aria-hidden="true"></div>
      <h3 class="skill-card__title"></h3>
      <p class="skill-card__description"></p>
      <div class="skill-card__tutor-count">0 tutors available</div>
      <span class="skill-card__action">Select Skill</span>
    `;

    card.addEventListener('click', (evt) => {
      selectSkill(evt, normalizedName);
    });

    skillsGrid.appendChild(card);
  }

  card.dataset.skillDocId = id ?? '';

  const iconEl = card.querySelector('.skill-card__icon');
  if (iconEl) {
    iconEl.textContent = iconDisplay;
  }

  const titleEl = card.querySelector('.skill-card__title');
  if (titleEl) {
    titleEl.textContent = normalizedName;
  }

  const descriptionEl = card.querySelector('.skill-card__description');
  if (descriptionEl) {
    descriptionEl.textContent = descriptionDisplay;
  }

  const tutorCountEl = card.querySelector('.skill-card__tutor-count');
  if (tutorCountEl) {
    tutorCountEl.setAttribute('data-skill-count', normalizedName);
  }

  addSkillToSelects(normalizedName);
}

function removeSkillCardById(docId) {
  if (!docId) {
    return;
  }

  const skillsGrid = document.querySelector('.skills-grid');
  if (!skillsGrid) {
    return;
  }

  const card = skillsGrid.querySelector(`.skill-card[data-skill-doc-id="${docId}"]`);
  if (card && card.classList.contains('skill-card--dynamic')) {
    card.remove();
  }

  refreshSkillSearchResults();
}

function registerSkill(e, options = {}) {
  const { autoTriggered = false, skipScroll = false } = options;
  if (e) {
    e.preventDefault();
  }

  const selectedSkillField = document.getElementById('selectedSkillField');
  const dropdownValue = selectedSkillField?.value?.trim() || '';
  const skillForSubmission = (selectedSkill || dropdownValue || '').trim();

  if (!skillForSubmission) {
    showError('Please select a skill first.');
    return;
  }

  selectedSkill = skillForSubmission;

  if (selectedSkillField && selectedSkillField.value !== skillForSubmission) {
    selectedSkillField.value = skillForSubmission;
  }

  localStorage.setItem('selectedSkill', skillForSubmission);

  const registrationForm = document.getElementById('registrationFormSection');
  if (registrationForm) {
    const shouldScroll = !skipScroll;
    registrationForm.style.display = 'block';
    if (shouldScroll) {
      registrationForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.requestAnimationFrame(() => {
      const firstField = document.getElementById('fullName');
      if (firstField && document.activeElement !== firstField) {
        firstField.focus({ preventScroll: true });
      }
    });
  }

  if (!autoTriggered) {
    showInfo(`Great choice! Complete the form below so our admin team can review your registration for "${skillForSubmission}".`);
  }
}

window.registerSkill = registerSkill;

// Handle form submission and UI bindings
document.addEventListener('DOMContentLoaded', function() {
  setupSkillSearch();
  initializeSuggestedMatchesUI();
  initializeTeachSkillsCombobox();

  const skillCards = document.querySelectorAll('.skill-card[data-skill]');
  skillCards.forEach(card => {
    card.addEventListener('click', (evt) => {
      const skillName = card.getAttribute('data-skill');
      if (skillName) {
        selectSkill(evt, skillName);
      }
    });
  });

  const registerButton = document.getElementById('registerSkillBtn');
  if (registerButton) {
    registerButton.addEventListener('click', (evt) => registerSkill(evt));
  }

  const skillDropdown = document.getElementById('selectedSkillField');
  if (skillDropdown) {
    skillDropdown.addEventListener('change', (evt) => {
      const skillName = evt.target.value;
      const selectedSkillLabel = document.getElementById('selectedSkill');
      const selectedSkillMessage = document.getElementById('selectedSkillMessage');

      if (!skillName) {
        selectedSkill = null;
        const allCards = document.querySelectorAll('.skill-card');
        allCards.forEach(card => card.classList.remove('selected'));
        if (selectedSkillLabel) {
          selectedSkillLabel.textContent = 'No skill selected';
        }
        if (selectedSkillMessage) {
          selectedSkillMessage.textContent = 'Choose a skill above or from the dropdown to proceed with registration.';
        }
        if (registerButton) {
          registerButton.disabled = true;
        }
        return;
      }

      selectSkill(null, skillName);
    });
  }

  subscribeToSkills();
  const skillRegistrationForm = document.getElementById('skillRegistrationForm');
  if (skillRegistrationForm) {
    skillRegistrationForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const form = e.target;
      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent : '';

      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const age = parseInt(document.getElementById('age').value, 10);
      const gender = document.getElementById('gender').value;
      const location = document.getElementById('location').value;
      const countryCode = document.getElementById('countryCode').value;
      const mobileNumberInput = document.getElementById('mobileNumber').value.trim();
      const sanitizedMobileNumber = mobileNumberInput.replace(/\D/g, '');
      const fullMobileNumber = `${countryCode}${sanitizedMobileNumber}`;
      const skillForSubmission = selectedSkill || document.getElementById('selectedSkillField')?.value?.trim();
      const teachSkills = getSelectedTeachSkills();

      if (!fullName || !email || Number.isNaN(age) || !gender || !location || !sanitizedMobileNumber || !skillForSubmission || !teachSkills.length) {
        showError('Please fill in all required fields.');
        return;
      }

      if (sanitizedMobileNumber.length < 7 || sanitizedMobileNumber.length > 15) {
        showError('Please enter a valid phone number between 7 and 15 digits.');
        return;
      }

      if (age < 13 || age > 100) {
        showError('Please enter a valid age between 13 and 100.');
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting…';
      }

      try {
        const {
          addDoc,
          serverTimestamp,
          registrationsCollection,
          skillsCollection,
          getDocs,
          query,
          where,
        } = await getFirestoreContext();

        const teachSkillsIndex = Array.from(new Set(
          teachSkills
            .map((skill) => (typeof skill === 'string' ? skill.trim().toLowerCase() : ''))
            .filter(Boolean)
        ));

        console.log('Submitting registration payload', {
          fullName,
          email,
          age,
          gender,
          location,
          phone: fullMobileNumber,
          contactPhone: fullMobileNumber,
          phoneDetails: {
            e164: fullMobileNumber,
            countryCode,
            nationalNumber: sanitizedMobileNumber,
            rawInput: mobileNumberInput,
          },
          selectedSkill: skillForSubmission,
          teachSkills,
          teachSkillsIndex,
          intent: 'learn',
          teacherNotification: {
            status: 'pending',
            createdAt: 'serverTimestamp()',
          },
          status: 'pending',
          source: 'skill-selection',
          consent: true,
        });

        await addDoc(registrationsCollection, {
          fullName,
          email,
          age,
          gender,
          location,
          phone: fullMobileNumber,
          contactPhone: fullMobileNumber,
          phoneDetails: {
            e164: fullMobileNumber,
            countryCode,
            nationalNumber: sanitizedMobileNumber,
            rawInput: mobileNumberInput,
          },
          selectedSkill: skillForSubmission,
          teachSkills,
          teachSkillsIndex,
          intent: 'learn',
          teacherNotification: {
            status: 'pending',
            createdAt: serverTimestamp(),
          },
          status: 'pending',
          source: 'skill-selection',
          consent: true,
          createdAt: serverTimestamp(),
        });

        const registrationData = {
          fullName,
          email,
          age,
          gender,
          location,
          mobileNumber: fullMobileNumber,
          phoneDetails: {
            e164: fullMobileNumber,
            countryCode,
            nationalNumber: sanitizedMobileNumber,
            rawInput: mobileNumberInput,
          },
          selectedSkill: skillForSubmission,
          teachSkills,
        };

        localStorage.setItem('registrationData', JSON.stringify(registrationData));

        updateLearnerMatchState({
          fullName,
          email,
          location,
          skill: skillForSubmission,
        }, { forceFetch: true });
        skipNextLearnerRefresh = true;

        // Ensure each teachable skill exists as a selectable card
        await Promise.all(
          teachSkills.map(async (skill) => {
            const existingOption = Array.from(document.querySelectorAll('.skill-card[data-skill]'))
              .some(card => card.getAttribute('data-skill') === skill);

            if (existingOption) {
              return;
            }

            try {
              const snapshot = await getDocs(query(skillsCollection, where('nameLower', '==', skill.toLowerCase())));
              if (snapshot.empty) {
                await addDoc(skillsCollection, {
                  name: skill,
                  icon: null,
                  description: `${skill} was recently offered by our community of tutors. Be among the first to learn it!`,
                  status: 'community-added',
                  nameLower: skill.toLowerCase(),
                  createdAt: serverTimestamp(),
                });
              }

              createOrUpdateSkillCard({ name: skill });
            } catch (skillError) {
              console.error(`Failed to provision skill card for ${skill}`, skillError);
            }
          })
        );

        showSuccess(`Thank you, ${fullName}! Our admin team will review your registration for "${skillForSubmission}" and reach out with next steps.`);
        form.reset();

        if (selectedSkillField) {
          selectedSkillField.value = skillForSubmission;
        }
        clearTeachSkillsSelection();
      } catch (error) {
        console.error('Registration submission failed.', error);

        const errorCode = error?.code || '';
        const errorMessage = error?.message || '';

        if (errorCode === 'permission-denied') {
          showError('Firestore blocked this submission (permission-denied). Redeploy your security rules and confirm the form fields match the rule requirements.');
        } else if (errorCode === 'failed-precondition') {
          showError('Firestore rejected the request (failed-precondition). Complete any required indexes or rule prerequisites and try again.');
        } else if (errorCode === 'unavailable') {
          showError('Firestore is temporarily unavailable. Check your connection and retry shortly.');
        } else if (errorMessage) {
          showError(`Registration failed: ${errorMessage}`);
        } else {
          showError('A network error occurred while submitting your registration. Please check your connection and try again.');
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });
  }
});

// Initialize the skill selection page
document.addEventListener('DOMContentLoaded', () => {
  // Initialization code removed since modal is no longer used
});

async function subscribeToSkills() {
  try {
    const {
      skillsCollection,
      onSnapshot,
      orderBy,
      query,
    } = await getFirestoreContext();

    const skillsQuery = orderBy && query
      ? query(skillsCollection, orderBy('nameLower', 'asc'))
      : skillsCollection;

    onSnapshot(skillsQuery, (snapshot) => {
      let changed = false;

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const data = change.doc.data();
          createOrUpdateSkillCard({
            name: data?.name,
            icon: data?.icon,
            description: data?.description,
            id: change.doc.id,
          });
          changed = true;
        } else if (change.type === 'removed') {
          removeSkillCardById(change.doc.id);
          changed = true;
        }
      });

      if (snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites) {
        return;
      }

      if (changed) {
        loadTutorCounts();
      }
    }, (error) => {
      console.error('Failed to subscribe to skill updates from Firestore.', error);
    });
  } catch (error) {
    console.error('Unable to set up Firestore skill subscription.', error);
  }
}

async function loadTutorCounts() {
  try {
    const {
      registrationsCollection,
      getDocs,
      query,
      where,
    } = await getFirestoreContext();

    const skills = Array.from(new Set(
      Array.from(document.querySelectorAll('[data-skill-count]'))
        .map(el => el.getAttribute('data-skill-count') || '')
        .filter(Boolean)
    ));

    const countsBySkill = await Promise.all(skills.map(async (skill) => {
      const snapshot = await getDocs(query(registrationsCollection, where('teachSkills', 'array-contains', skill)));
      return { skill, count: snapshot.size };
    }));

    countsBySkill.forEach(({ skill, count }) => {
      const elements = document.querySelectorAll(`[data-skill-count="${skill}"]`);
      elements.forEach((el) => {
        el.textContent = count === 1 ? '1 tutor available' : `${count} tutors available`;
      });
    });
  } catch (error) {
    console.error('Failed to load tutor counts from Firestore.', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadTutorCounts();
});