/**
 * Skill Bank - Authentication Handler
 * Handles login and signup with email notifications
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get elements
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const closeModalBtn = document.querySelector('.auth-modal-close');
    const authLink = document.querySelector('.auth-link');

    // Email handler instance
    const emailHandler = new EmailHandler();

    // Open login modal
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Signup button - scroll to registration and notify
    if (signupBtn) {
        signupBtn.addEventListener('click', async () => {
            const registrationSection = document.getElementById('register');
            if (registrationSection) {
                // Scroll to registration
                const navbar = document.getElementById('navbar');
                const navHeight = navbar ? navbar.offsetHeight : 0;
                window.scrollTo({
                    top: registrationSection.offsetTop - navHeight - 20,
                    behavior: 'smooth'
                });

                // Send notification email about signup attempt
                await sendSignupNotification();
            }
        });
    }

    // Close modal
    function closeLoginModal() {
        loginModal.classList.remove('active');
        document.body.style.overflow = '';
        if (loginForm) loginForm.reset();
        if (loginMessage) loginMessage.textContent = '';
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeLoginModal);
    }

    // Close on backdrop click
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                closeLoginModal();
            }
        });
    }

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && loginModal.classList.contains('active')) {
            closeLoginModal();
        }
    });

    // Handle auth link (sign up from login modal)
    if (authLink) {
        authLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeLoginModal();
            const registrationSection = document.getElementById('register');
            if (registrationSection) {
                const navbar = document.getElementById('navbar');
                const navHeight = navbar ? navbar.offsetHeight : 0;
                window.scrollTo({
                    top: registrationSection.offsetTop - navHeight - 20,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = document.getElementById('submit-login');
            const originalButtonText = submitButton.textContent;

            try {
                // Show loading state
                submitButton.disabled = true;
                submitButton.textContent = 'Logging in...';
                loginMessage.className = 'form-message';
                loginMessage.textContent = '';

                // Get form data
                const formData = new FormData(loginForm);
                const loginData = {
                    email: formData.get('email'),
                    password: formData.get('password'),
                    rememberMe: document.getElementById('remember-me').checked,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                };

                // Send login notification email to admin
                await sendLoginNotification(loginData);

                // Store login attempt locally
                storeLoginAttempt(loginData);

                // Show success message
                loginMessage.className = 'form-message success';
                loginMessage.innerHTML = `
                    <h4>✅ Login Request Received!</h4>
                    <p>We've received your login attempt for <strong>${loginData.email}</strong></p>
                    <p>Our team will verify your credentials and grant access shortly.</p>
                    <p>You'll receive an email at <strong>${loginData.email}</strong> once approved.</p>
                    <p class="note">For immediate access, contact us at <strong>skillbank0@gmail.com</strong></p>
                `;

                // Reset form after 3 seconds
                setTimeout(() => {
                    loginForm.reset();
                    setTimeout(closeLoginModal, 2000);
                }, 3000);

            } catch (error) {
                console.error('Login error:', error);
                loginMessage.className = 'form-message error';
                loginMessage.innerHTML = `
                    <h4>❌ Login Request Error</h4>
                    <p>We couldn't process your login request: ${error.message}</p>
                    <p>Your information has been saved locally. Please contact us at <strong>skillbank0@gmail.com</strong></p>
                `;
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    /**
     * Send login notification email to admin
     */
    async function sendLoginNotification(loginData) {
        const emailData = {
            to: 'skillbank0@gmail.com',
            from: loginData.email,
            subject: `🔐 Login Attempt - ${loginData.email}`,
            html: generateLoginEmailHTML(loginData)
        };

        // Try to send email (will work if email service is configured)
        try {
            await emailHandler.sendEmail(emailData);
            console.log('Login notification sent to admin');
        } catch (error) {
            console.log('Email service not configured, storing locally');
            // Store locally if email fails
        }
    }

    /**
     * Send signup notification to admin
     */
    async function sendSignupNotification() {
        const signupData = {
            timestamp: new Date().toISOString(),
            action: 'signup_button_clicked',
            userAgent: navigator.userAgent
        };

        const emailData = {
            to: 'skillbank0@gmail.com',
            from: 'notifications@skillbank.com',
            subject: '📝 New Signup Button Clicked',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #0066FF; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
                        .info { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #0066FF; }
                        .label { font-weight: bold; color: #0066FF; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📝 Signup Button Clicked</h1>
                        </div>
                        <div class="content">
                            <p>Someone just clicked the <strong>Sign Up</strong> button on your Skill Bank platform!</p>
                            <div class="info">
                                <p><span class="label">Time:</span> ${new Date(signupData.timestamp).toLocaleString()}</p>
                                <p><span class="label">Action:</span> User navigated to registration form</p>
                                <p><span class="label">Status:</span> Awaiting registration completion</p>
                            </div>
                            <p><strong>Next Steps:</strong></p>
                            <ul>
                                <li>User will fill out the registration form</li>
                                <li>You'll receive another email when they complete registration</li>
                                <li>Monitor skillbank0@gmail.com for the registration details</li>
                            </ul>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await emailHandler.sendEmail(emailData);
            console.log('Signup notification sent to admin');
        } catch (error) {
            console.log('Signup notification stored locally');
        }

        // Store locally
        storeSignupAttempt(signupData);
    }

    /**
     * Generate login email HTML
     */
    function generateLoginEmailHTML(loginData) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #0066FF; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
                    .info { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #0066FF; }
                    .label { font-weight: bold; color: #0066FF; }
                    .warning { background: #fff3cd; border-left-color: #ffc107; padding: 15px; margin: 15px 0; border-radius: 8px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 New Login Attempt</h1>
                    </div>
                    <div class="content">
                        <p>Someone just attempted to log in to your Skill Bank platform.</p>
                        <div class="info">
                            <p><span class="label">Email:</span> ${loginData.email}</p>
                            <p><span class="label">Time:</span> ${new Date(loginData.timestamp).toLocaleString()}</p>
                            <p><span class="label">Remember Me:</span> ${loginData.rememberMe ? 'Yes' : 'No'}</p>
                            <p><span class="label">Browser:</span> ${loginData.userAgent}</p>
                        </div>
                        <div class="warning">
                            <p><strong>⚠️ Action Required:</strong></p>
                            <p>Since user authentication is not yet fully implemented, you need to:</p>
                            <ol>
                                <li>Verify this email address is registered</li>
                                <li>Confirm the user's identity</li>
                                <li>Send them access credentials manually</li>
                            </ol>
                        </div>
                        <p><strong>Respond to:</strong> ${loginData.email}</p>
                        <p>Let them know their account status or provide login credentials.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Store login attempt locally
     */
    function storeLoginAttempt(loginData) {
        const attempts = JSON.parse(localStorage.getItem('skillbank_login_attempts') || '[]');
        attempts.push({
            email: loginData.email,
            timestamp: loginData.timestamp,
            rememberMe: loginData.rememberMe,
            userAgent: loginData.userAgent
        });
        localStorage.setItem('skillbank_login_attempts', JSON.stringify(attempts));
        console.log('Login attempt stored locally');
    }

    /**
     * Store signup attempt locally
     */
    function storeSignupAttempt(signupData) {
        const attempts = JSON.parse(localStorage.getItem('skillbank_signup_clicks') || '[]');
        attempts.push(signupData);
        localStorage.setItem('skillbank_signup_clicks', JSON.stringify(attempts));
        console.log('Signup click stored locally');
    }
});

// Export for debugging
window.AuthDebug = {
    viewLoginAttempts: () => {
        const attempts = JSON.parse(localStorage.getItem('skillbank_login_attempts') || '[]');
        console.table(attempts);
        return attempts;
    },
    viewSignupClicks: () => {
        const clicks = JSON.parse(localStorage.getItem('skillbank_signup_clicks') || '[]');
        console.table(clicks);
        return clicks;
    },
    clearAll: () => {
        localStorage.removeItem('skillbank_login_attempts');
        localStorage.removeItem('skillbank_signup_clicks');
        console.log('All auth data cleared');
    }
};
