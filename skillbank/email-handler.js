/**
 * Skill Bank - Email Handler
 * Handles user registration and contact form submissions
 */

class EmailHandler {
    constructor(apiEndpoint = null) {
        // You'll need to replace this with your actual email service API
        // Options: EmailJS, FormSpree, SendGrid, or your own backend
        this.apiEndpoint = apiEndpoint;
        this.emailService = 'formspree'; // or 'emailjs', 'custom'
    }

    /**
     * Send registration email
     * @param {Object} formData - User registration data
     * @returns {Promise} Response from email service
     */
    async sendRegistrationEmail(formData) {
        const emailData = {
            to: 'skillbank0@gmail.com', // Your admin email
            from: formData.email,
            subject: `New User Registration - ${formData.name}`,
            html: this.generateRegistrationEmailHTML(formData)
        };

        return this.sendEmail(emailData);
    }

    /**
     * Send confirmation email to user
     * @param {Object} userData 
     */
    async sendConfirmationEmail(userData) {
        const emailData = {
            to: userData.email,
            from: 'skillbank0@gmail.com',
            subject: 'Welcome to Skill Bank!',
            html: this.generateConfirmationEmailHTML(userData)
        };

        return this.sendEmail(emailData);
    }

    /**
     * Send contact form email
     * @param {Object} contactData 
     */
    async sendContactEmail(contactData) {
        const emailData = {
            to: 'skillbank0@gmail.com',
            from: contactData.email,
            subject: `Contact Form: ${contactData.subject}`,
            html: this.generateContactEmailHTML(contactData)
        };

        return this.sendEmail(emailData);
    }

    /**
     * Main email sending function
     * @param {Object} emailData 
     */
    async sendEmail(emailData) {
        try {
            // Using FormSpree (free tier available)
            if (this.emailService === 'formspree') {
                return await this.sendViaFormSpree(emailData);
            }
            
            // Using EmailJS (free tier available)
            if (this.emailService === 'emailjs') {
                return await this.sendViaEmailJS(emailData);
            }

            // Custom backend implementation
            return await this.sendViaCustomBackend(emailData);

        } catch (error) {
            console.error('Email send error:', error);
            throw new Error('Failed to send email. Please try again.');
        }
    }

    /**
     * Send email via FormSpree
     * Setup: Create account at https://formspree.io/
     */
    async sendViaFormSpree(emailData) {
        // Replace with your FormSpree form ID
        const formSpreeId = 'YOUR_FORMSPREE_ID'; 
        
        const response = await fetch(`https://formspree.io/f/${formSpreeId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailData.from,
                message: emailData.html,
                subject: emailData.subject
            })
        });

        if (!response.ok) {
            throw new Error('FormSpree request failed');
        }

        return await response.json();
    }

    /**
     * Send email via EmailJS
     * Setup: Create account at https://www.emailjs.com/
     */
    async sendViaEmailJS(emailData) {
        // Replace with your EmailJS credentials
        const serviceID = 'YOUR_SERVICE_ID';
        const templateID = 'YOUR_TEMPLATE_ID';
        const publicKey = 'YOUR_PUBLIC_KEY';

        // EmailJS requires their SDK to be loaded
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS library not loaded');
        }

        return emailjs.send(serviceID, templateID, {
            to_email: emailData.to,
            from_email: emailData.from,
            subject: emailData.subject,
            message: emailData.html
        }, publicKey);
    }

    /**
     * Send via custom backend
     */
    async sendViaCustomBackend(emailData) {
        if (!this.apiEndpoint) {
            // Fallback: Store locally and show success message
            console.log('Email data (would be sent in production):', emailData);
            this.storeLocally(emailData);
            return { success: true, message: 'Registration stored locally' };
        }

        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        return await response.json();
    }

    /**
     * Store data locally (for demo purposes)
     */
    storeLocally(data) {
        const registrations = JSON.parse(localStorage.getItem('skillbank_registrations') || '[]');
        registrations.push({
            ...data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('skillbank_registrations', JSON.stringify(registrations));
    }

    /**
     * Generate registration email HTML
     */
    generateRegistrationEmailHTML(formData) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #0066FF; color: white; padding: 20px; text-align: center; }
                    .content { background: #f8f9fa; padding: 30px; margin: 20px 0; }
                    .field { margin: 15px 0; }
                    .label { font-weight: bold; color: #0066FF; }
                    .value { margin-top: 5px; }
                    .footer { text-align: center; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎓 New User Registration</h1>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="label">Name:</div>
                            <div class="value">${formData.name}</div>
                        </div>
                        <div class="field">
                            <div class="label">Email:</div>
                            <div class="value">${formData.email}</div>
                        </div>
                        <div class="field">
                            <div class="label">Skills to Teach:</div>
                            <div class="value">${formData.skillsToTeach?.join(', ') || 'None specified'}</div>
                        </div>
                        <div class="field">
                            <div class="label">Skills to Learn:</div>
                            <div class="value">${formData.skillsToLearn?.join(', ') || 'None specified'}</div>
                        </div>
                        <div class="field">
                            <div class="label">Experience Level:</div>
                            <div class="value">${formData.experience || 'Not specified'}</div>
                        </div>
                        <div class="field">
                            <div class="label">Message:</div>
                            <div class="value">${formData.message || 'No message provided'}</div>
                        </div>
                    </div>
                    <div class="footer">
                        <p>This registration was submitted on ${new Date().toLocaleString()}</p>
                        <p>Skill Bank - Professional Skill Exchange Platform</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Generate confirmation email HTML
     */
    generateConfirmationEmailHTML(userData) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #0066FF; color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .button { display: inline-block; padding: 12px 30px; background: #0066FF; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Skill Bank!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${userData.name}!</h2>
                        <p>Thank you for joining Skill Bank - the premier platform for professional skill exchange.</p>
                        <p>We've received your registration and our team will review it shortly. You'll receive a confirmation email once your account is activated.</p>
                        <h3>What's Next?</h3>
                        <ul>
                            <li>We'll match you with professionals who want to learn from you</li>
                            <li>You'll discover experts who can teach you new skills</li>
                            <li>Start exchanging knowledge and growing your skill set</li>
                        </ul>
                        <p style="text-align: center;">
                            <a href="https://skillbank.com" class="button">Visit Skill Bank</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>Skill Bank - Master New Skills Through Knowledge Exchange</p>
                        <p>If you have any questions, reply to this email or contact us at skillbank0@gmail.com</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Generate contact email HTML
     */
    generateContactEmailHTML(contactData) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .content { background: #f8f9fa; padding: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Contact Form Submission</h2>
                    <div class="content">
                        <p><strong>From:</strong> ${contactData.name} (${contactData.email})</p>
                        <p><strong>Subject:</strong> ${contactData.subject}</p>
                        <p><strong>Message:</strong></p>
                        <p>${contactData.message}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailHandler;
}
