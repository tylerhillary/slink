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

        const { addDoc, collection, serverTimestamp } = firestoreModule;
        const { db } = firebaseInit;

        return {
          addDoc,
          serverTimestamp,
          registrationsCollection: collection(db, 'registrations'),
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
function selectSkill(evt, skillName) {
  const previousSkill = selectedSkill;
  selectedSkill = skillName;
  const selectedSkillLabel = document.getElementById('selectedSkill');
  if (selectedSkillLabel) {
    selectedSkillLabel.textContent = skillName;
  }

  if (previousSkill !== skillName) {
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
    const title = card.querySelector('.skill-card__title');
    return title?.textContent.trim() === skillName;
  });

  targetCard?.classList.add('selected');

  const selectedSkillField = document.getElementById('selectedSkillField');
  if (selectedSkillField) {
    selectedSkillField.value = selectedSkill;
  }

  const formIsVisible = document.getElementById('registrationFormSection')?.style.display !== 'none';
  registerSkill(null, { autoTriggered: true, skipScroll: formIsVisible && previousSkill === skillName });
}

window.selectSkill = selectSkill;

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

      if (!fullName || !email || Number.isNaN(age) || !gender || !location || !skillForSubmission) {
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
        } = await getFirestoreContext();

        await addDoc(registrationsCollection, {
          fullName,
          email,
          age,
          gender,
          location,
          selectedSkill: skillForSubmission,
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
        };
        localStorage.setItem('registrationData', JSON.stringify(registrationData));

        showSuccess(`Thank you, ${fullName}! Our admin team will review your registration for "${skillForSubmission}" and reach out with next steps.`);
        form.reset();

        if (selectedSkillField) {
          selectedSkillField.value = skillForSubmission;
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