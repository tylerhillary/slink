// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error('Firebase is not available. Make sure Firebase scripts are loaded.');
        showError('Error: Firebase is not properly initialized. Please refresh the page.');
        return;
    }
    
    // Get Firestore instance
    const db = firebase.firestore();
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form elements
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('contact-phone');
            const topicSelect = document.getElementById('topic');
            const subjectInput = document.getElementById('subject');
            const messageInput = document.getElementById('message');
            const submitButton = contactForm.querySelector('button[type="submit"]');
            
            // Get form data
            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(),
                topic: topicSelect.value,
                subject: subjectInput.value.trim(),
                message: messageInput.value.trim(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Basic validation
            if (!formData.name || !formData.email || !formData.topic || !formData.subject || !formData.message) {
                showError('Please fill in all required fields.');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                showError('Please enter a valid email address.');
                return;
            }
            
            // Disable submit button to prevent multiple submissions
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            try {
                // Save to Firestore
                await db.collection('contactSubmissions').add(formData);
                
                // Show success message
                showSuccess(`Thank you, ${formData.name}! Your message has been sent successfully. We'll get back to you soon.`);
                
                // Reset form
                contactForm.reset();
                
            } catch (error) {
                console.error('Error saving contact form:', error);
                showError('There was an error sending your message. Please try again later.');
            } finally {
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }
});

// Show success message
function showSuccess(message) {
    // Check if showSuccess is defined in app.js, otherwise create a simple alert
    if (typeof window.showSuccess === 'function') {
        window.showSuccess(message);
    } else if (typeof window.showAlert === 'function') {
        window.showAlert(message, 'success');
    } else {
        alert('Success: ' + message);
    }
}

// Show error message
function showError(message) {
    // Check if showError is defined in app.js, otherwise create a simple alert
    if (typeof window.showError === 'function') {
        window.showError(message);
    } else if (typeof window.showAlert === 'function') {
        window.showAlert(message, 'error');
    } else {
        alert('Error: ' + message);
    }
}
