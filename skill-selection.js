// Skill selection functionality

// Variable to store the selected skill
let selectedSkill = null;

// Function to select a skill
function selectSkill(evt, skillName) {
  selectedSkill = skillName;
  const selectedSkillLabel = document.getElementById('selectedSkill');
  if (selectedSkillLabel) {
    selectedSkillLabel.textContent = skillName;
  }

  const registerButton = document.getElementById('registerSkillBtn');
  if (registerButton) {
    registerButton.disabled = false;
    registerButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  document.querySelectorAll('.skill-card').forEach(card => {
    card.classList.remove('selected');
  });

  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add('selected');
  }
}

function registerSkill(e) {
  if (e) {
    e.preventDefault();
  }

  if (!selectedSkill) {
    showError('Please select a skill first.');
    return;
  }

  localStorage.setItem('selectedSkill', selectedSkill);

  const registrationForm = document.getElementById('registrationFormSection');
  if (registrationForm) {
    registrationForm.style.display = 'block';
    registrationForm.scrollIntoView({ behavior: 'smooth' });
  }

  const selectedSkillField = document.getElementById('selectedSkillField');
  if (selectedSkillField) {
    selectedSkillField.value = selectedSkill;
  }

  showInfo(`Great choice! Complete the form below so our admin team can review your registration for "${selectedSkill}".`);
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
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

      if (!fullName || !email || Number.isNaN(age) || !gender || !location) {
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
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });

        if (response.ok) {
          const registrationData = {
            fullName,
            email,
            age,
            gender,
            location,
            selectedSkill
          };
          localStorage.setItem('registrationData', JSON.stringify(registrationData));

          showSuccess(`Thank you, ${fullName}! Our admin team will review your registration for "${selectedSkill}" and reach out with next steps.`);
          form.reset();

          if (selectedSkillField) {
            selectedSkillField.value = selectedSkill;
          }
        } else {
          showError('We could not submit your registration right now. Please try again shortly.');
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