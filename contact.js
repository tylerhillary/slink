import { db } from './firebase-init.js';
import {
  addDoc,
  collection,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

const contactForm = document.getElementById('contactForm');

document.addEventListener('DOMContentLoaded', () => {
  if (!contactForm) {
    return;
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('contact-phone');
    const topicSelect = document.getElementById('topic');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    const submitButton = contactForm.querySelector('button[type="submit"]');

    const formData = {
      name: nameInput?.value?.trim() ?? '',
      email: emailInput?.value?.trim() ?? '',
      phone: phoneInput?.value?.trim() ?? '',
      topic: topicSelect?.value ?? '',
      subject: subjectInput?.value?.trim() ?? '',
      message: messageInput?.value?.trim() ?? '',
      timestamp: serverTimestamp(),
    };

    if (!formData.name || !formData.email || !formData.topic || !formData.subject || !formData.message) {
      showError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('Please enter a valid email address.');
      return;
    }

    const originalButtonText = submitButton ? submitButton.textContent : '';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending…';
    }

    try {
      await addDoc(collection(db, 'contactSubmissions'), formData);
      showSuccess(`Thank you, ${formData.name}! Your message has been sent successfully. We'll get back to you soon.`);
      contactForm.reset();
    } catch (error) {
      console.error('Error saving contact form:', error);
      showError('There was an error sending your message. Please try again later.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
});

function showSuccess(message) {
  if (typeof window.showSuccess === 'function') {
    window.showSuccess(message);
    return;
  }

  if (typeof window.showAlert === 'function') {
    window.showAlert(message, 'success');
    return;
  }

  alert(`Success: ${message}`);
}

function showError(message) {
  if (typeof window.showError === 'function') {
    window.showError(message);
    return;
  }

  if (typeof window.showAlert === 'function') {
    window.showAlert(message, 'error');
    return;
  }

  alert(`Error: ${message}`);
}
