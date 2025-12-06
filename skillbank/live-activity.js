/**
 * Skill Bank - Live Activity System
 * Makes the site feel alive with real-time indicators and animations
 */

class LiveActivity {
    constructor() {
        this.users = ['Sarah M.', 'John D.', 'Emma K.', 'Michael R.', 'Lisa W.', 'David P.', 'Anna S.', 'James T.', 'Maria G.', 'Robert L.'];
        this.skills = ['Web Development', 'Python', 'Graphic Design', 'UI/UX Design', 'Digital Marketing', 'Spanish', 'Photography', 'Public Speaking'];
        this.actions = ['just registered', 'completed an exchange', 'is learning', 'is teaching', 'joined a session'];
        this.cities = ['Lagos', 'London', 'New York', 'Toronto', 'Sydney', 'Berlin', 'Tokyo', 'Paris'];
        
        this.onlineUsers = this.getRandomNumber(15, 35);
        this.activeToday = this.getRandomNumber(80, 150);
    }

    init() {
        this.addLiveIndicators();
        this.startOnlineUserCounter();
        this.showRecentActivity();
        this.addActivityBadges();
        this.startActivityStream();
        this.addPulseAnimations();
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Add live user counter to hero section
    addLiveIndicators() {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;

        const liveIndicator = document.createElement('div');
        liveIndicator.className = 'live-indicator';
        liveIndicator.innerHTML = `
            <div class="live-pulse"></div>
            <span class="live-count">${this.onlineUsers} professionals online now</span>
        `;
        
        const heroFeatures = heroSection.querySelector('.hero-features');
        if (heroFeatures) {
            heroSection.insertBefore(liveIndicator, heroFeatures);
        }

        // Add CSS
        this.addLiveIndicatorStyles();
    }

    addLiveIndicatorStyles() {
        if (document.getElementById('live-activity-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'live-activity-styles';
        styles.textContent = `
            .live-indicator {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                margin: 32px 0;
                padding: 16px 28px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 50px;
                box-shadow: 0 4px 16px rgba(0, 102, 255, 0.15);
                max-width: fit-content;
                margin-left: auto;
                margin-right: auto;
                animation: slideInUp 0.6s ease;
            }

            .live-pulse {
                width: 12px;
                height: 12px;
                background: #22C55E;
                border-radius: 50%;
                position: relative;
                animation: pulse 2s infinite;
            }

            .live-pulse::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                background: #22C55E;
                border-radius: 50%;
                animation: ripple 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }

            @keyframes ripple {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                100% {
                    transform: scale(2.5);
                    opacity: 0;
                }
            }

            .live-count {
                font-size: 0.95rem;
                font-weight: 600;
                color: #0a0a0a;
            }

            .activity-toast {
                position: fixed;
                bottom: 24px;
                right: 24px;
                background: white;
                padding: 16px 20px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 9999;
                animation: slideInRight 0.4s ease, fadeOut 0.4s ease 4.6s;
                max-width: 320px;
                border-left: 4px solid #0066FF;
            }

            .activity-toast-icon {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #0066FF, #00D9FF);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .activity-toast-icon svg {
                width: 20px;
                height: 20px;
                color: white;
            }

            .activity-toast-content {
                flex: 1;
            }

            .activity-toast-user {
                font-weight: 600;
                font-size: 0.9rem;
                color: #0a0a0a;
                margin-bottom: 4px;
            }

            .activity-toast-action {
                font-size: 0.85rem;
                color: #666;
            }

            .activity-toast-time {
                font-size: 0.75rem;
                color: #999;
                margin-top: 4px;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideInUp {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            @keyframes fadeOut {
                to {
                    opacity: 0;
                    transform: translateX(400px);
                }
            }

            .activity-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: #FEF3C7;
                color: #92400E;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .activity-badge.trending {
                background: #DBEAFE;
                color: #1E40AF;
            }

            .activity-badge.new {
                background: #D1FAE5;
                color: #065F46;
            }

            .activity-badge-pulse {
                width: 6px;
                height: 6px;
                background: currentColor;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            .skill-card .activity-badge {
                position: absolute;
                top: 12px;
                right: 12px;
            }

            .animated-counter {
                display: inline-block;
                font-variant-numeric: tabular-nums;
            }

            @media (max-width: 640px) {
                .activity-toast {
                    bottom: 16px;
                    right: 16px;
                    left: 16px;
                    max-width: none;
                }

                .live-indicator {
                    padding: 14px 24px;
                    font-size: 0.9rem;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Update online user count periodically
    startOnlineUserCounter() {
        setInterval(() => {
            const change = Math.random() > 0.5 ? 1 : -1;
            this.onlineUsers = Math.max(15, Math.min(40, this.onlineUsers + change));
            
            const liveCount = document.querySelector('.live-count');
            if (liveCount) {
                liveCount.textContent = `${this.onlineUsers} professionals online now`;
            }
        }, 15000); // Update every 15 seconds
    }

    // Show recent activity notifications
    showRecentActivity() {
        // Show first notification after 3 seconds
        setTimeout(() => {
            this.showActivityToast();
        }, 3000);

        // Then show notifications randomly between 15-30 seconds
        setInterval(() => {
            if (Math.random() > 0.3) { // 70% chance
                this.showActivityToast();
            }
        }, this.getRandomNumber(15000, 30000));
    }

    showActivityToast() {
        const user = this.getRandomItem(this.users);
        const action = this.getRandomItem(this.actions);
        const skill = this.getRandomItem(this.skills);
        const location = this.getRandomItem(this.cities);
        const timeAgo = ['just now', '1 min ago', '2 mins ago', '3 mins ago'];

        const toast = document.createElement('div');
        toast.className = 'activity-toast';
        toast.innerHTML = `
            <div class="activity-toast-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            </div>
            <div class="activity-toast-content">
                <div class="activity-toast-user">${user}</div>
                <div class="activity-toast-action">${action} • ${skill}</div>
                <div class="activity-toast-time">${this.getRandomItem(timeAgo)} • ${location}</div>
            </div>
        `;

        document.body.appendChild(toast);

        // Remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    // Add activity badges to skill cards
    addActivityBadges() {
        const skillCards = document.querySelectorAll('.marketplace-card, .skill-card');
        const badgeTypes = [
            { text: '🔥 Trending', class: 'trending' },
            { text: '✨ New', class: 'new' },
            { text: '⚡ Hot', class: 'hot' }
        ];

        skillCards.forEach((card, index) => {
            if (Math.random() > 0.5) { // 50% of cards get a badge
                const badge = badgeTypes[index % badgeTypes.length];
                const badgeEl = document.createElement('div');
                badgeEl.className = `activity-badge ${badge.class}`;
                badgeEl.innerHTML = `
                    <span class="activity-badge-pulse"></span>
                    <span>${badge.text}</span>
                `;
                card.style.position = 'relative';
                card.appendChild(badgeEl);
            }
        });
    }

    // Animate counters when they come into view
    startActivityStream() {
        const counters = document.querySelectorAll('.about-stat-number, .feature-count, .stat-number');
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    animateCounter(element) {
        const text = element.textContent;
        const match = text.match(/(\d+)/);
        if (!match) return;

        const target = parseInt(match[1]);
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        element.classList.add('animated-counter');

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = text;
                clearInterval(timer);
            } else {
                element.textContent = text.replace(/\d+/, Math.floor(current).toString());
            }
        }, duration / steps);
    }

    // Add subtle pulse animations to active elements
    addPulseAnimations() {
        // Add to CTA buttons
        const ctaButtons = document.querySelectorAll('.cta-section .btn-primary');
        ctaButtons.forEach(btn => {
            setInterval(() => {
                btn.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 200);
            }, 5000);
        });

        // Add shimmer effect to skill cards periodically
        const cards = document.querySelectorAll('.marketplace-card, .skill-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                setInterval(() => {
                    card.style.transform = 'translateY(-2px)';
                    card.style.boxShadow = '0 12px 32px rgba(0,102,255,0.15)';
                    setTimeout(() => {
                        card.style.transform = '';
                        card.style.boxShadow = '';
                    }, 300);
                }, 15000 + (index * 1000));
            }, index * 2000);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const liveActivity = new LiveActivity();
    liveActivity.init();
    
    // Make it globally accessible
    window.liveActivity = liveActivity;
});
