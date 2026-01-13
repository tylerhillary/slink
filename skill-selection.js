// Skill selection functionality

// Variable to store the selected skill
let selectedSkill = null;

let firestoreContextPromise = null;

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
          registrationsCollection: collection(db, 'registrations'),
          skillsCollection: collection(db, 'skills'),
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
      const skillForSubmission = selectedSkill || document.getElementById('selectedSkillField')?.value?.trim();
      const teachSkillsInput = document.getElementById('teachSkillsInput');
      const teachSkills = teachSkillsInput?.value
        ?.split(',')
        .map(skill => normalizeSkillName(skill))
        .filter(Boolean) ?? [];

      if (!fullName || !email || Number.isNaN(age) || !gender || !location || !skillForSubmission || !teachSkills.length) {
        showError('Please fill in all required fields.');
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

        await addDoc(registrationsCollection, {
          fullName,
          email,
          age,
          gender,
          location,
          selectedSkill: skillForSubmission,
          teachSkills,
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
          selectedSkill: skillForSubmission,
          teachSkills,
        };
        localStorage.setItem('registrationData', JSON.stringify(registrationData));

        // Ensure each teachable skill exists as a selectable card
        await Promise.all(teachSkills.map(async (skill) => {
          const existingOption = Array.from(document.querySelectorAll('.skill-card[data-skill]'))
            .some(card => card.getAttribute('data-skill') === skill);

          if (!existingOption) {
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
          }
        }));

        showSuccess(`Thank you, ${fullName}! Our admin team will review your registration for "${skillForSubmission}" and reach out with next steps.`);
        form.reset();

        if (selectedSkillField) {
          selectedSkillField.value = skillForSubmission;
        }

        if (teachSkillsInput) {
          teachSkillsInput.value = '';
        }
      } catch (error) {
        showError('A network error occurred while submitting your registration. Please check your connection and try again.');
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