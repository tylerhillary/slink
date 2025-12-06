/**
 * Skill Bank - Form Handler
 * Handles registration form submissions and user matching
 */

// Initialize services
const skillMatcher = new SkillMatcher();
const emailHandler = new EmailHandler();

// Handle registration form submission with Formspree
document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');
    const formMessage = document.getElementById('form-message');

    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = document.getElementById('submit-registration');
            const originalButtonText = submitButton.textContent;

            try {
                // Show loading state
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';
                formMessage.className = 'form-message';
                formMessage.textContent = '';

                // Collect form data
                const formData = new FormData(registrationForm);
                const userData = {
                    name: formData.get('name'),
                    email: formData.get('_replyto'),
                    phone: formData.get('phone'),
                    skillsToTeach: formData.get('skillsToTeach').split(',').map(s => s.trim()),
                    skillsToLearn: formData.get('skillsToLearn').split(',').map(s => s.trim()),
                    experience: formData.get('experience'),
                    availability: formData.get('availability'),
                    message: formData.get('message')
                };

                // Basic validation
                if (userData.phone && !/^[\d\s()+-]+$/.test(userData.phone)) {
                    formMessage.className = 'form-message error';
                    formMessage.innerHTML = '<p>Please enter a valid phone number.</p>';
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                    return;
                }

                // Submit to Formspree
                const formAction = registrationForm.getAttribute('action');
                const response = await fetch(formAction, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Add user to matching system
                    const newUser = skillMatcher.addUser(userData);

                    // Find potential matches
                    const matches = skillMatcher.getTopMatches(newUser.id, 5);
                    
                    // Send additional notification emails (optional backup)
                    try {
                        await emailHandler.sendRegistrationEmail(userData);
                        await emailHandler.sendConfirmationEmail(userData);
                    } catch (emailError) {
                        console.log('Additional email notification failed:', emailError);
                    }

                    // Show success message with match information
                    formMessage.className = 'form-message success';
                    formMessage.innerHTML = `
                        <h4>✅ Registration Successful!</h4>
                        <p>Thank you for joining Skill Bank, ${userData.name}!</p>
                        <p>We've sent a confirmation email to <strong>${userData.email}</strong></p>
                        ${matches.length > 0 ? `
                            <div class="match-preview">
                                <p><strong>Great news!</strong> We found ${matches.length} potential matches for you:</p>
                                <ul>
                                    ${matches.slice(0, 3).map(match => `
                                        <li>
                                            <strong>${match.user.name}</strong> 
                                            (${Math.round(match.compatibility.score)}% match)
                                            - ${match.compatibility.reasons[0] || 'Compatible skills'}
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        <p>Our team will review your profile and send you personalized match recommendations soon!</p>
                    `;

                    // Reset form
                    registrationForm.reset();

                    // Log match statistics (for demo)
                    console.log('User registered:', newUser);
                    console.log('Top matches:', matches);
                    
                    // Scroll to message
                    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    throw new Error('Form submission failed');
                }

            } catch (error) {
                console.error('Registration error:', error);
                formMessage.className = 'form-message error';
                formMessage.innerHTML = `
                    <h4>❌ Registration Error</h4>
                    <p>We couldn't complete your registration. Please try again.</p>
                    <p>If the problem persists, contact support at skillbank0@gmail.com</p>
                `;
            } finally {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    // Update CTA buttons to scroll to registration
    document.querySelectorAll('.cta-section .btn-primary, .hero-cta .btn-primary').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
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
    });

    // Demo: Add some sample users for matching demonstration
    addSampleUsers();

    // Phone number input masking
    const phoneInput = document.getElementById('reg-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let input = e.target.value.replace(/\D/g, '');
            if (input.length > 10) {
                input = input.substring(0, 10);
            }

            let formattedInput = '';
            if (input.length > 0) {
                formattedInput = '(' + input.substring(0, 3);
            }
            if (input.length >= 4) {
                formattedInput += ') ' + input.substring(3, 6);
            }
            if (input.length >= 7) {
                formattedInput += '-' + input.substring(6, 10);
            }
            e.target.value = formattedInput;
        });
    }
});

/**
 * Add sample users to demonstrate matching algorithm
 */
function addSampleUsers() {
    const sampleUsers = [
        {
            name: 'Sarah Chen',
            email: 'sarah@example.com',
            skillsToTeach: ['Graphic Design', 'Adobe Photoshop', 'UI Design'],
            skillsToLearn: ['Web Development', 'JavaScript', 'React'],
            experience: 'advanced',
            rating: 4.8,
            completedExchanges: 12
        },
        {
            name: 'Michael Johnson',
            email: 'michael@example.com',
            skillsToTeach: ['Python', 'Data Science', 'Machine Learning'],
            skillsToLearn: ['Public Speaking', 'Marketing'],
            experience: 'expert',
            rating: 4.9,
            completedExchanges: 25
        },
        {
            name: 'Emma Rodriguez',
            email: 'emma@example.com',
            skillsToTeach: ['Spanish', 'French', 'Language Teaching'],
            skillsToLearn: ['Photography', 'Video Editing'],
            experience: 'intermediate',
            rating: 4.7,
            completedExchanges: 8
        },
        {
            name: 'David Kim',
            email: 'david@example.com',
            skillsToTeach: ['Web Development', 'React', 'Node.js'],
            skillsToLearn: ['UI Design', 'Figma', 'User Research'],
            experience: 'advanced',
            rating: 4.9,
            completedExchanges: 18
        },
        {
            name: 'Lisa Wang',
            email: 'lisa@example.com',
            skillsToTeach: ['Digital Marketing', 'SEO', 'Content Strategy'],
            skillsToLearn: ['Data Analytics', 'Python'],
            experience: 'intermediate',
            rating: 4.6,
            completedExchanges: 6
        }
    ];

    sampleUsers.forEach(user => skillMatcher.addUser(user));
    console.log('Sample users added to matching system');
}

/**
 * Demo function: Search for users by skill
 */
function searchUsersBySkill(skill) {
    const results = skillMatcher.searchBySkill(skill);
    console.log(`Users who teach "${skill}":`, results);
    return results;
}

/**
 * Demo function: Get matches for a user
 */
function getMatchesForUser(userId) {
    const matches = skillMatcher.findMatches(userId);
    console.log(`Matches for user ${userId}:`, matches);
    return matches;
}

// Make demo functions available globally
window.skillMatcher = skillMatcher;
window.searchUsersBySkill = searchUsersBySkill;
window.getMatchesForUser = getMatchesForUser;
