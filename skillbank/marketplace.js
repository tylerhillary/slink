/**
 * Skill Bank - Marketplace Handler
 * Handles skill marketplace filtering and payment modal
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get elements
    const filterButtons = document.querySelectorAll('.filter-btn');
    const marketplaceCards = document.querySelectorAll('.marketplace-card');
    const connectButtons = document.querySelectorAll('.marketplace-connect');
    const paymentModal = document.getElementById('payment-modal');
    const modalSkillName = document.getElementById('modal-skill-name');
    const closeModalBtn = document.querySelector('.payment-modal-close');
    const cancelPaymentBtn = document.getElementById('cancel-payment');
    const proceedPaymentBtn = document.getElementById('proceed-payment');

    let selectedSkill = '';
    let selectedPrice = 0;

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            const filter = button.getAttribute('data-filter');
            
            // Filter cards
            marketplaceCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    // Add fade-in animation
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Connect button functionality
    connectButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            selectedSkill = button.getAttribute('data-skill');
            selectedPrice = button.getAttribute('data-price');
            
            // Update modal content
            modalSkillName.textContent = selectedSkill;
            
            // Format price with commas
            const formattedPrice = parseInt(selectedPrice).toLocaleString('en-NG');
            document.querySelector('.payment-amount .amount').textContent = formattedPrice;
            
            // Show modal
            paymentModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        });
    });

    // Close modal function
    function closeModal() {
        paymentModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }

    // Close modal on X button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close modal on Cancel button
    if (cancelPaymentBtn) {
        cancelPaymentBtn.addEventListener('click', closeModal);
    }

    // Close modal on backdrop click
    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            closeModal();
        }
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && paymentModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Proceed to payment
    if (proceedPaymentBtn) {
        proceedPaymentBtn.addEventListener('click', () => {
            // Show custom alert/confirmation
            showPaymentAlert(selectedSkill, selectedPrice);
            closeModal();
        });
    }

    // Custom alert function
    function showPaymentAlert(skill, price) {
        const formattedPrice = parseInt(price).toLocaleString('en-NG');
        
        // Create custom alert overlay
        const alertOverlay = document.createElement('div');
        alertOverlay.className = 'custom-alert-overlay';
        alertOverlay.innerHTML = `
            <div class="custom-alert-box">
                <div class="alert-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
                <h2>Payment Required</h2>
                <p class="alert-message">To connect with <strong>${skill}</strong> professionals, you need to pay:</p>
                <div class="alert-price">
                    <span class="currency">$</span>
                    <span class="amount">${formattedPrice}</span>
                </div>
                <p class="alert-note">Please contact our support team to complete this payment and unlock access to verified professionals.</p>
                <div class="alert-contact">
                    <div class="contact-item">
                        <strong>Email:</strong> skillbank0@gmail.com
                    </div>
                    <div class="contact-item">
                        <strong>Phone:</strong> +234 XXX XXX XXXX
                    </div>
                    <div class="contact-item">
                        <strong>WhatsApp:</strong> +234 XXX XXX XXXX
                    </div>
                </div>
                <button class="btn btn-primary btn-large close-alert">Got It</button>
            </div>
        `;
        
        document.body.appendChild(alertOverlay);
        document.body.style.overflow = 'hidden';
        
        // Add styles dynamically if not in CSS
        if (!document.getElementById('custom-alert-styles')) {
            const styles = document.createElement('style');
            styles.id = 'custom-alert-styles';
            styles.textContent = `
                .custom-alert-overlay {
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
                    z-index: 10001;
                    animation: fadeIn 0.3s ease;
                }
                
                .custom-alert-box {
                    background: white;
                    border-radius: 24px;
                    padding: 48px 40px;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                    animation: slideUp 0.4s ease;
                    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
                }
                
                .alert-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #FFB800, #FF6B00);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                }
                
                .alert-icon svg {
                    width: 40px;
                    height: 40px;
                    color: white;
                }
                
                .custom-alert-box h2 {
                    font-size: 28px;
                    font-weight: 800;
                    color: #0A0A0A;
                    margin-bottom: 16px;
                    letter-spacing: -0.5px;
                }
                
                .alert-message {
                    font-size: 16px;
                    color: #64748B;
                    margin-bottom: 24px;
                    line-height: 1.6;
                }
                
                .alert-message strong {
                    color: #0066FF;
                    font-weight: 700;
                }
                
                .alert-price {
                    background: #F8F9FA;
                    padding: 24px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                
                .alert-price .currency {
                    font-size: 28px;
                    font-weight: 700;
                    color: #0A0A0A;
                }
                
                .alert-price .amount {
                    font-size: 40px;
                    font-weight: 800;
                    color: #0A0A0A;
                    letter-spacing: -1.5px;
                }
                
                .alert-note {
                    font-size: 14px;
                    color: #64748B;
                    margin-bottom: 24px;
                    line-height: 1.6;
                }
                
                .alert-contact {
                    background: #F8F9FA;
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 28px;
                    text-align: left;
                }
                
                .contact-item {
                    padding: 8px 0;
                    font-size: 14px;
                    color: #64748B;
                }
                
                .contact-item strong {
                    color: #0A0A0A;
                    display: inline-block;
                    width: 100px;
                }
                
                .close-alert {
                    width: 100%;
                }
                
                @media (max-width: 640px) {
                    .custom-alert-box {
                        padding: 36px 24px;
                    }
                    
                    .alert-price .amount {
                        font-size: 32px;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Close alert
        const closeBtn = alertOverlay.querySelector('.close-alert');
        closeBtn.addEventListener('click', () => {
            alertOverlay.remove();
            document.body.style.overflow = '';
        });
        
        // Close on backdrop click
        alertOverlay.addEventListener('click', (e) => {
            if (e.target === alertOverlay) {
                alertOverlay.remove();
                document.body.style.overflow = '';
            }
        });
        
        // Log the payment request (for analytics/tracking)
        console.log(`Payment requested: ${skill} - $${formattedPrice}`);
        
        // Store in localStorage (for admin tracking)
        storePaymentRequest(skill, price);
    }

    // Store payment request
    function storePaymentRequest(skill, price) {
        const requests = JSON.parse(localStorage.getItem('skillbank_payment_requests') || '[]');
        requests.push({
            skill: skill,
            price: price,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        localStorage.setItem('skillbank_payment_requests', JSON.stringify(requests));
    }

    // Update navigation to include marketplace link
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        const marketplaceExists = Array.from(navMenu.querySelectorAll('a')).some(
            link => link.getAttribute('href') === '#marketplace'
        );
        
        if (!marketplaceExists) {
            const browseLink = Array.from(navMenu.querySelectorAll('a')).find(
                link => link.textContent.includes('Browse')
            );
            if (browseLink) {
                browseLink.setAttribute('href', '#marketplace');
                browseLink.textContent = 'Marketplace';
            }
        }
    }
});

// Export for potential use in other scripts
window.MarketplaceHandler = {
    showPaymentAlert: (skill, price) => {
        // Can be called from other scripts
        console.log(`External payment alert call: ${skill} - $${price}`);
    }
};
