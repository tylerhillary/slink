/**
 * Skill Bank - Button Handler
 * Ensures all buttons have proper functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Hero CTA Buttons
    const startExchangingBtn = document.querySelector('.hero-cta .btn-primary');
    const viewDemoBtn = document.querySelector('.hero-cta .btn-outline');
    
    if (startExchangingBtn) {
        startExchangingBtn.addEventListener('click', () => {
            const registerSection = document.getElementById('register');
            if (registerSection) {
                smoothScrollTo(registerSection);
            }
        });
    }
    
    if (viewDemoBtn) {
        viewDemoBtn.addEventListener('click', () => {
            showDemoModal();
        });
    }
    
    // Search Button
    const searchButton = document.querySelector('.search-button');
    const searchInput = document.getElementById('search-input');
    
    if (searchButton) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            
            if (searchTerm) {
                // Scroll to skills section
                const skillsSection = document.querySelector('.skills-section');
                if (skillsSection) {
                    smoothScrollTo(skillsSection);
                }
                
                // Trigger search
                if (searchInput) {
                    const event = new Event('input', { bubbles: true });
                    searchInput.dispatchEvent(event);
                }
                
                showNotification(`Searching for "${searchTerm}"...`, 'info');
            } else {
                showNotification('Please enter a skill to search', 'warning');
            }
        });
    }
    
    // Popular Search Tags
    document.querySelectorAll('.tag-button').forEach(button => {
        button.addEventListener('click', () => {
            const searchTerm = button.textContent.trim();
            if (searchInput) {
                searchInput.value = searchTerm;
                searchButton.click();
            }
        });
    });
    
    // Category Cards - Make them clickable
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.querySelector('.category-title')?.textContent;
            if (category && searchInput) {
                searchInput.value = category;
                smoothScrollTo(document.querySelector('.skills-section'));
                showNotification(`Showing ${category} skills`, 'success');
            }
        });
        
        // Add pointer cursor
        card.style.cursor = 'pointer';
    });
    
    // Skill Card Connect Buttons
    document.querySelectorAll('.skill-card .btn-small').forEach(button => {
        if (!button.hasAttribute('data-listener')) {
            button.setAttribute('data-listener', 'true');
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const skillCard = button.closest('.skill-card');
                const userName = skillCard.querySelector('.user-name')?.textContent;
                const skillTitle = skillCard.querySelector('.skill-title')?.textContent;
                
                showConnectionModal(userName, skillTitle);
            });
        }
    });
    
    // CTA Section Buttons
    document.querySelectorAll('.cta-section .btn-primary').forEach(button => {
        button.addEventListener('click', () => {
            const registerSection = document.getElementById('register');
            if (registerSection) {
                smoothScrollTo(registerSection);
            }
        });
    });
    
    document.querySelectorAll('.cta-section .btn-outline').forEach(button => {
        button.addEventListener('click', () => {
            showDemoModal();
        });
    });
    
    // Smooth Scroll Helper
    function smoothScrollTo(element) {
        const navbar = document.getElementById('navbar');
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition = element.offsetTop - navHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
    
    // Show Demo Modal
    function showDemoModal() {
        const modal = document.createElement('div');
        modal.className = 'demo-modal';
        modal.innerHTML = `
            <div class="demo-modal-content">
                <button class="demo-modal-close">&times;</button>
                <div class="demo-modal-header">
                    <div class="demo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polygon points="10 8 16 12 10 16 10 8"></polygon>
                        </svg>
                    </div>
                    <h2>Platform Demo</h2>
                </div>
                <div class="demo-modal-body">
                    <p>Welcome to Skill Bank! Here's how our platform works:</p>
                    <div class="demo-steps">
                        <div class="demo-step">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h4>Create Your Profile</h4>
                                <p>Sign up and list skills you can teach and want to learn</p>
                            </div>
                        </div>
                        <div class="demo-step">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h4>Get Matched</h4>
                                <p>Our algorithm finds perfect matches based on complementary skills</p>
                            </div>
                        </div>
                        <div class="demo-step">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h4>Start Exchanging</h4>
                                <p>Connect with professionals and begin your learning journey</p>
                            </div>
                        </div>
                    </div>
                    <div class="demo-cta">
                        <button class="btn btn-primary btn-large demo-register">Get Started Now</button>
                        <p class="demo-note">Join 180 professionals already exchanging skills</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Add styles if not already present
        if (!document.getElementById('demo-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'demo-modal-styles';
            styles.textContent = `
                .demo-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10002;
                    animation: fadeIn 0.3s ease;
                }
                
                .demo-modal-content {
                    background: white;
                    border-radius: 24px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                    animation: slideUp 0.4s ease;
                }
                
                .demo-modal-close {
                    position: absolute;
                    right: 20px;
                    top: 20px;
                    background: #F8F9FA;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748B;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                }
                
                .demo-modal-close:hover {
                    background: #0A0A0A;
                    color: white;
                    transform: rotate(90deg);
                }
                
                .demo-modal-header {
                    padding: 56px 48px 24px;
                    text-align: center;
                    background: #FAFAFA;
                }
                
                .demo-icon {
                    display: none;
                }
                
                .demo-modal-header h2 {
                    font-size: 36px;
                    font-weight: 800;
                    color: #0A0A0A;
                    margin: 0;
                    letter-spacing: -0.5px;
                }
                
                .demo-modal-body {
                    padding: 48px;
                }
                
                .demo-modal-body > p {
                    font-size: 16px;
                    color: #64748B;
                    margin-bottom: 40px;
                    text-align: center;
                    line-height: 1.6;
                }
                
                .demo-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                    margin-bottom: 48px;
                }
                
                .demo-step {
                    display: flex;
                    gap: 24px;
                    align-items: flex-start;
                }
                
                .step-number {
                    width: 56px;
                    height: 56px;
                    background: #0066FF;
                    color: white;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 800;
                    flex-shrink: 0;
                    box-shadow: 0 4px 12px rgba(0, 102, 255, 0.25);
                }
                
                .step-content h4 {
                    font-size: 20px;
                    font-weight: 700;
                    color: #0A0A0A;
                    margin-bottom: 8px;
                    letter-spacing: -0.3px;
                }
                
                .step-content p {
                    font-size: 15px;
                    color: #64748B;
                    margin: 0;
                    line-height: 1.7;
                }
                
                .demo-cta {
                    text-align: center;
                    padding-top: 40px;
                    border-top: 2px solid #F1F5F9;
                }
                
                .demo-cta .btn {
                    width: 100%;
                    margin-bottom: 20px;
                    font-size: 17px;
                    font-weight: 700;
                    padding: 18px 32px;
                    border-radius: 12px;
                    box-shadow: 0 4px 16px rgba(0, 102, 255, 0.3);
                    transition: all 0.3s ease;
                }
                
                .demo-cta .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 102, 255, 0.4);
                }
                
                .demo-note {
                    font-size: 15px;
                    color: #64748B;
                    margin: 0;
                    font-weight: 500;
                }
                
                @media (max-width: 640px) {
                    .demo-modal-content {
                        width: 95%;
                        border-radius: 20px;
                    }
                    
                    .demo-modal-header {
                        padding: 44px 28px 20px;
                    }
                    
                    .demo-modal-header h2 {
                        font-size: 28px;
                    }
                    
                    .demo-modal-body {
                        padding: 32px 28px;
                    }
                    
                    .demo-steps {
                        gap: 28px;
                    }
                    
                    .step-number {
                        width: 52px;
                        height: 52px;
                        font-size: 22px;
                    }
                    
                    .step-content h4 {
                        font-size: 18px;
                    }
                    
                    .demo-cta .btn {
                        font-size: 16px;
                        padding: 16px 28px;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Close modal handlers
        const closeBtn = modal.querySelector('.demo-modal-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = '';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
        
        // Register button in demo modal
        const demoRegisterBtn = modal.querySelector('.demo-register');
        demoRegisterBtn.addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = '';
            const registerSection = document.getElementById('register');
            if (registerSection) {
                smoothScrollTo(registerSection);
            }
        });
    }
    
    // Show Connection Modal
    function showConnectionModal(userName, skillTitle) {
        const modal = document.createElement('div');
        modal.className = 'connection-modal';
        modal.innerHTML = `
            <div class="connection-modal-content">
                <button class="connection-modal-close">&times;</button>
                <div class="connection-modal-header">
                    <div class="connection-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <h2>Connect with ${userName}</h2>
                </div>
                <div class="connection-modal-body">
                    <p class="connection-skill">${skillTitle}</p>
                    <p class="connection-message">To connect with ${userName} for skill exchange, please complete your registration first.</p>
                    <div class="connection-benefits">
                        <h4>Benefits of Connecting:</h4>
                        <ul>
                            <li>Direct messaging with ${userName}</li>
                            <li>Schedule flexible learning sessions</li>
                            <li>Track your progress together</li>
                            <li>Exchange feedback and ratings</li>
                        </ul>
                    </div>
                </div>
                <div class="connection-modal-footer">
                    <button class="btn btn-secondary btn-large connection-cancel">Cancel</button>
                    <button class="btn btn-primary btn-large connection-proceed">Register Now</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Add styles
        if (!document.getElementById('connection-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'connection-modal-styles';
            styles.textContent = `
                .connection-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10002;
                    animation: fadeIn 0.3s ease;
                }
                
                .connection-modal-content {
                    background: white;
                    border-radius: 24px;
                    max-width: 500px;
                    width: 90%;
                    position: relative;
                    animation: slideUp 0.4s ease;
                }
                
                .connection-modal-close {
                    position: absolute;
                    right: 20px;
                    top: 20px;
                    background: #F8F9FA;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748B;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                }
                
                .connection-modal-close:hover {
                    background: #0A0A0A;
                    color: white;
                    transform: rotate(90deg);
                }
                
                .connection-modal-header {
                    padding: 48px 40px 32px;
                    text-align: center;
                    border-bottom: 1px solid #E2E8F0;
                }
                
                .connection-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #0066FF, #00D9FF);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                }
                
                .connection-icon svg {
                    width: 40px;
                    height: 40px;
                    color: white;
                }
                
                .connection-modal-header h2 {
                    font-size: 28px;
                    font-weight: 800;
                    color: #0A0A0A;
                    margin: 0;
                }
                
                .connection-modal-body {
                    padding: 32px 40px;
                }
                
                .connection-skill {
                    font-size: 18px;
                    font-weight: 700;
                    color: #0066FF;
                    margin-bottom: 16px;
                }
                
                .connection-message {
                    font-size: 15px;
                    color: #64748B;
                    line-height: 1.6;
                    margin-bottom: 24px;
                }
                
                .connection-benefits h4 {
                    font-size: 16px;
                    font-weight: 700;
                    color: #0A0A0A;
                    margin-bottom: 12px;
                }
                
                .connection-benefits ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .connection-benefits li {
                    padding: 8px 0 8px 28px;
                    font-size: 14px;
                    color: #64748B;
                    position: relative;
                }
                
                .connection-benefits li:before {
                    content: "✓";
                    position: absolute;
                    left: 0;
                    color: #0066FF;
                    font-weight: bold;
                }
                
                .connection-modal-footer {
                    padding: 24px 40px 40px;
                    display: flex;
                    gap: 12px;
                }
                
                .connection-modal-footer .btn {
                    flex: 1;
                }
                
                @media (max-width: 640px) {
                    .connection-modal-content {
                        width: 95%;
                    }
                    
                    .connection-modal-header,
                    .connection-modal-body {
                        padding: 28px 24px;
                    }
                    
                    .connection-modal-footer {
                        padding: 20px 24px 28px;
                        flex-direction: column;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Close handlers
        const closeBtn = modal.querySelector('.connection-modal-close');
        const cancelBtn = modal.querySelector('.connection-cancel');
        
        closeBtn.addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = '';
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = '';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
        
        // Proceed button
        const proceedBtn = modal.querySelector('.connection-proceed');
        proceedBtn.addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = '';
            const registerSection = document.getElementById('register');
            if (registerSection) {
                smoothScrollTo(registerSection);
            }
        });
    }
    
    // Notification System
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles if not present
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 24px;
                    background: white;
                    padding: 16px 24px;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                    z-index: 10003;
                    font-size: 15px;
                    font-weight: 600;
                    animation: slideInRight 0.3s ease;
                    max-width: 400px;
                    border-left: 4px solid;
                }
                
                .notification-info {
                    border-left-color: #0066FF;
                    color: #0066FF;
                }
                
                .notification-success {
                    border-left-color: #00C853;
                    color: #00C853;
                }
                
                .notification-warning {
                    border-left-color: #FFB800;
                    color: #FFB800;
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                
                @media (max-width: 640px) {
                    .notification {
                        right: 16px;
                        left: 16px;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});
