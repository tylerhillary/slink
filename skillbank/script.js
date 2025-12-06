// Professional Skill Bank - Interactive Features

// Sticky Navigation
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Professional Mobile Menu
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navActions = document.querySelector('.nav-actions');

// Create backdrop element
const backdrop = document.createElement('div');
backdrop.className = 'mobile-menu-backdrop';
document.body.appendChild(backdrop);

// Toggle mobile menu
if (hamburger) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });
}

// Close menu when clicking backdrop
backdrop.addEventListener('click', () => {
    closeMobileMenu();
});

// Close menu on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMobileMenu();
    }
});

function toggleMobileMenu() {
    const isActive = navMenu.classList.contains('active');
    
    if (isActive) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    navMenu.classList.add('active');
    navActions.classList.add('active');
    hamburger.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

function closeMobileMenu() {
    navMenu.classList.remove('active');
    navActions.classList.remove('active');
    hamburger.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
}

// Smooth Scroll Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Close mobile menu if open
                if (navMenu.classList.contains('active')) {
                    closeMobileMenu();
                }
            }
        }
    });
});

// Search Functionality
const searchInput = document.getElementById('search-input');
const skillsGrid = document.getElementById('skills-grid');
const skillCards = skillsGrid ? Array.from(skillsGrid.querySelectorAll('.skill-card')) : [];
const matchConnectSection = document.getElementById('match-connect');

const scrollToElement = (element, offset = 20) => {
    if (!element) return;
    const navHeight = navbar ? navbar.offsetHeight : 0;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
        top: elementPosition - navHeight - offset,
        behavior: 'smooth'
    });
};

const getFirstVisibleCard = () => {
    return skillCards.find(card => card.style.display !== 'none' && card.offsetParent !== null) || null;
};

const highlightSkillCard = (card) => {
    if (!card) return;
    skillCards.forEach(c => c.classList.remove('highlighted'));
    card.classList.add('highlighted');
    setTimeout(() => card.classList.remove('highlighted'), 2000);
};

const focusOnMatchingSkill = () => {
    if (!skillCards.length) {
        scrollToElement(matchConnectSection);
        return;
    }

    const targetCard = getFirstVisibleCard();
    if (targetCard) {
        scrollToElement(targetCard);
        highlightSkillCard(targetCard);
    } else {
        scrollToElement(matchConnectSection);
    }
};

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        skillCards.forEach(card => {
            const title = card.querySelector('.skill-title').textContent.toLowerCase();
            const description = card.querySelector('.skill-description').textContent.toLowerCase();
            const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
            const userName = card.querySelector('.user-name').textContent.toLowerCase();
            const searchableText = `${title} ${description} ${tags.join(' ')} ${userName}`;
            
            if (searchTerm === '' || searchableText.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
        
        const visibleCards = skillCards.filter(card => card.style.display !== 'none');
        const existingMessage = skillsGrid.querySelector('.no-results-message');
        
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (visibleCards.length === 0 && searchTerm !== '') {
            const message = document.createElement('div');
            message.className = 'no-results-message';
            message.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 80px 20px; color: var(--text-secondary);';
            message.innerHTML = `
                <h3 style="font-size: 22px; margin-bottom: 12px; font-weight: 600;">No skills found</h3>
                <p style="font-size: 15px;">Try different keywords or browse our categories</p>
            `;
            skillsGrid.appendChild(message);
        }
    });
}

// Search Button
const searchButton = document.querySelector('.search-button');
if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
        const term = searchInput.value.trim();
        if (term) {
            focusOnMatchingSkill();
        } else {
            scrollToElement(matchConnectSection);
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
}

// Category Card Navigation
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
        const categoryTitle = card.querySelector('.category-title').textContent.toLowerCase();
        
        if (searchInput) {
            searchInput.value = categoryTitle;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        focusOnMatchingSkill();
    });
});

// Connect Button Handlers
document.querySelectorAll('.skill-card .btn-primary').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = button.closest('.skill-card');
        const userName = card.querySelector('.user-name').textContent;
        const skillTitle = card.querySelector('.skill-title').textContent;
        
        alert(`Initiate connection with ${userName}\n\nSkill: ${skillTitle}\n\nIn production, this would open a messaging interface.`);
    });
});

// Intersection Observer for Fade-in Animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.category-card, .skill-card, .step-card');
    
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`;
        fadeObserver.observe(el);
    });
});

// CTA Button Handlers
document.querySelectorAll('.cta-section .btn, .hero-cta .btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const text = button.textContent.trim().toLowerCase();
        
        if (text.includes('sign up') || text.includes('get started') || text.includes('create')) {
            e.preventDefault();
            alert('Registration Flow\n\nThis would redirect to the sign-up page in production.');
        } else if (text.includes('learn more')) {
            e.preventDefault();
            const howItWorks = document.querySelector('.how-it-works');
            if (howItWorks) {
                window.scrollTo({
                    top: howItWorks.offsetTop - navbar.offsetHeight,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Skill Card Hover Enhancement
document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.borderColor = 'var(--accent)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.borderColor = 'var(--border-light)';
    });
});

// Popular Search Tags
document.querySelectorAll('.tag-button').forEach(button => {
    button.addEventListener('click', () => {
        const searchTerm = button.textContent.trim();
        if (searchInput) {
            searchInput.value = searchTerm;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            focusOnMatchingSkill();
        }
    });
});

// Console Message
console.log('%c🎓 Skill Bank', 'color: #2C3E50; font-size: 18px; font-weight: bold;');
console.log('%cProfessional Skill Exchange Platform', 'color: #C9A961; font-size: 13px;');
