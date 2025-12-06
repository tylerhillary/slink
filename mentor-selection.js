// Registration flow

let selectedSkill = localStorage.getItem('selectedSkill') || 'Not selected';

document.addEventListener('DOMContentLoaded', function() {
  const selectedSkillDisplay = document.getElementById('selectedSkillDisplay');
  if (selectedSkillDisplay) {
    selectedSkillDisplay.textContent = selectedSkill;
  }

  const selectedSkillField = document.getElementById('selectedSkillField');
  if (selectedSkillField) {
    selectedSkillField.value = selectedSkill;
  }

  const registrationForm = document.getElementById('registrationForm');
  if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitRegistration(e.target);
    });
  }
});

// Submit registration form
async function submitRegistration(form) {
  const fullNameInput = form.querySelector('#fullName');
  const emailInput = form.querySelector('#email');
  const ageInput = form.querySelector('#age');
  const genderInput = form.querySelector('#gender');
  const locationInput = form.querySelector('#location');
  const selectedSkillInput = form.querySelector('#selectedSkillField');

  const fullName = fullNameInput ? fullNameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const ageValue = ageInput ? parseInt(ageInput.value, 10) : NaN;
  const gender = genderInput ? genderInput.value : '';
  const location = locationInput ? locationInput.value : '';

  if (!fullName || !email || Number.isNaN(ageValue) || !gender || !location) {
    showError('Please fill in all required fields.');
    return;
  }

  if (ageValue < 13 || ageValue > 100) {
    showError('Please enter a valid age between 13 and 100.');
    return;
  }

  // Automatically assign a mentor
  const users = (typeof sampleUsers !== 'undefined' && Array.isArray(sampleUsers))
    ? sampleUsers
    : (Array.isArray(window.sampleUsers) ? window.sampleUsers : []);
  
  // Find a mentor who offers the selected skill
  let assignedMentor = null;
  const skillQuery = (selectedSkill || '').toLowerCase();
  
  if (skillQuery && skillQuery !== 'not selected' && users.length > 0) {
    const mentorsWithSkill = users.filter(mentor =>
      Array.isArray(mentor.skillsOffered) && mentor.skillsOffered.some(s =>
        (s.name || '').toLowerCase() === skillQuery
      )
    );
    
    // If we found mentors with the skill, pick the first one
    if (mentorsWithSkill.length > 0) {
      assignedMentor = mentorsWithSkill[0];
    } else {
      // Otherwise pick the first mentor
      assignedMentor = users[0];
    }
  } else if (users.length > 0) {
    // If no skill selected or no mentors found, pick the first mentor
    assignedMentor = users[0];
  }
  
  if (selectedSkillInput) {
    selectedSkillInput.value = selectedSkill;
  }

  const registrationData = {
    fullName,
    email,
    age: ageValue,
    gender,
    location,
    selectedSkill,
    assignedMentor
  };

  localStorage.setItem('registrationData', JSON.stringify(registrationData));

  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton ? submitButton.textContent : '';

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting…';
  }

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    });

    if (response.ok) {
      showSuccess('Form submitted successfully! Our team will assign you a suitable mentor and reach out soon.');
      form.reset();

      const userInfoForm = document.getElementById('userInfoForm');
      if (userInfoForm) {
        userInfoForm.style.display = 'none';
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
}