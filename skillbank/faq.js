// FAQ Data
const faqData = [
    {
        question: "What is Skill Bank?",
        answer: "Skill Bank is a professional skill exchange platform that connects individuals who want to teach and learn skills from each other. Unlike traditional education platforms, Skill Bank operates on a skill-for-skill exchange model, where you can offer your expertise in one area while learning something new in return.",
        category: "Getting Started",
        tags: ["overview", "platform", "introduction"]
    },
    {
        question: "How does Skill Bank work?",
        answer: "Skill Bank works in three simple steps:<br><br><strong>Step 1:</strong> Create Your Profile - Sign up and list the skills you can teach and what you want to learn<br><strong>Step 2:</strong> Get Matched - Our algorithm finds compatible professionals whose needs align with yours<br><strong>Step 3:</strong> Start Exchanging - Connect with your matches, schedule sessions, and begin teaching and learning",
        category: "Getting Started",
        tags: ["how it works", "onboarding", "matching"]
    },
    {
        question: "Is Skill Bank free to use?",
        answer: "Registration and basic features are completely free. You can create a profile, browse skills, view matches, and exchange skills with other members at no cost. Some premium features like marketplace connections (₦20,000 / ~$25 USD per skill) and priority matching may require payment.",
        category: "Payments & Pricing",
        tags: ["pricing", "plans", "marketplace"]
    },
    {
        question: "Who can join Skill Bank?",
        answer: "Anyone 18 years or older with professional skills to share can join Skill Bank. Our community includes professionals, freelancers, entrepreneurs, career changers, experts, and students. All users are verified to ensure a safe environment.",
        category: "Getting Started",
        tags: ["eligibility", "requirements", "verification"]
    },
    {
        question: "How do I create an account?",
        answer: "Click 'Sign Up' on the homepage, fill out your profile with your name and email, list the skills you can teach, specify what you want to learn, select your experience level and availability, agree to our Terms of Service, and submit. You'll receive a confirmation email and can start browsing matches immediately.",
        category: "Getting Started",
        tags: ["sign up", "profile", "account"]
    },
    {
        question: "How does the matching algorithm work?",
        answer: "Our intelligent algorithm analyzes multiple factors including skill compatibility (matching users whose teaching skills align with your learning goals), mutual exchange potential, experience levels, user ratings, and availability. Each match receives a compatibility score (0-100%) to help you choose the best partners.",
        category: "Matching & Sessions",
        tags: ["algorithm", "compatibility", "scores"]
    },
    {
        question: "How do I connect with someone?",
        answer: "You can connect through your recommended matches (free) by clicking 'Connect' on their profile, or through the marketplace by browsing skills and paying a connection fee (₦20,000 / ~$25 USD) to access all professionals teaching that skill.",
        category: "Matching & Sessions",
        tags: ["connections", "marketplace", "networking"]
    },
    {
        question: "What are the connection fees?",
        answer: "Per-Skill Connection through the marketplace costs ₦20,000 (~$25 USD) and unlocks access to all professionals teaching that skill permanently. Connecting with your algorithmic matches is always free. The connection fee is one-time payment.",
        category: "Payments & Pricing",
        tags: ["fees", "payments", "cost"]
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept Credit/Debit Cards (Visa, Mastercard, Verve), Bank Transfer, Mobile Money, and PayPal for international users. All transactions are processed securely through trusted payment providers.",
        category: "Payments & Pricing",
        tags: ["cards", "bank transfer", "paypal"]
    },
    {
        question: "Can I get a refund?",
        answer: "Connection fees are generally non-refundable once access is granted. However, if you couldn't access the service due to technical issues on our end, we provide a full refund. For unsatisfactory experiences, contact us within 48 hours at skillbank0@gmail.com with your transaction details.",
        category: "Payments & Pricing",
        tags: ["refunds", "policy", "support"]
    },
    {
        question: "Is Skill Bank safe?",
        answer: "Yes! We prioritize safety with user verification, SSL encryption, a rating system, reporting tools, privacy controls, and active moderation. All members are verified before joining, and we have a dedicated team monitoring for safety.",
        category: "Trust & Safety",
        tags: ["safety", "security", "moderation"]
    },
    {
        question: "How do you verify users?",
        answer: "Our verification process includes email address verification, profile completeness review, skills and credentials validation, identity verification for premium users, and background checks where applicable. Verified users receive a badge on their profile.",
        category: "Trust & Safety",
        tags: ["verification", "identity", "badge"]
    },
    {
        question: "What if I have a problem with another user?",
        answer: "Use the in-app 'Report' button on their profile, provide details about the issue, block the user to prevent further contact, and contact support at skillbank0@gmail.com for immediate assistance. We investigate all reports and take appropriate action.",
        category: "Trust & Safety",
        tags: ["report", "issues", "support"]
    },
    {
        question: "How is my personal information protected?",
        answer: "We use SSL encryption for all data transmission, secure servers with regular backups, strict access controls, password hashing, regular security audits, and GDPR/CCPA compliance. Review our Privacy Policy for complete details.",
        category: "Trust & Safety",
        tags: ["privacy", "data", "compliance"]
    },
    {
        question: "How long should a skill exchange last?",
        answer: "The duration is completely flexible and depends on skill complexity, learning goals, and availability. Most exchanges range from 4-12 weeks with 1-2 sessions per week, but you can customize based on your needs and mutual agreement.",
        category: "Matching & Sessions",
        tags: ["duration", "timeline", "sessions"]
    },
    {
        question: "What if I don't find a good match?",
        answer: "Update your profile with more detailed skills, broaden your learning goals to include related skills, check back regularly as new members join daily, use the search function to find specific skills, or contact support at skillbank0@gmail.com for personalized recommendations.",
        category: "Matching & Sessions",
        tags: ["matching", "tips", "recommendations"]
    },
    {
        question: "How do I update my profile?",
        answer: "Once logged in, go to 'My Profile' from the navigation menu, click 'Edit Profile', update your skills, bio, photo, or preferences, and save your changes. Keep your profile updated to receive better match recommendations.",
        category: "Account & Support",
        tags: ["profile", "settings", "edit"]
    },
    {
        question: "How do I delete my account?",
        answer: "Email us at skillbank0@gmail.com with the subject 'Account Deletion Request' and include your registered email address. We'll process your request within 48 hours. Some information may be retained for legal purposes as outlined in our Privacy Policy.",
        category: "Account & Support",
        tags: ["delete", "account", "privacy"]
    }
];

const categoryOrder = [
    "Getting Started",
    "Matching & Sessions",
    "Payments & Pricing",
    "Trust & Safety",
    "Account & Support"
];

const categoryDescriptions = {
    "Getting Started": "Lay the groundwork for a polished profile and clear goals.",
    "Matching & Sessions": "Fine-tune recommendations and manage each exchange with confidence.",
    "Payments & Pricing": "Understand connection fees, billing, and premium upgrades.",
    "Trust & Safety": "See how we keep every interaction safe and policy-aligned.",
    "Account & Support": "Manage your settings or work directly with our support team."
};

// Initialize FAQ
document.addEventListener('DOMContentLoaded', () => {
    const faqSections = document.getElementById('faq-sections');
    const emptyState = document.getElementById('faq-empty-state');
    const searchInput = document.getElementById('faq-search-input');
    const filterGroup = document.getElementById('faq-filter-group');
    let currentFilter = "All";
    let searchTerm = "";

    function attachAccordionHandlers() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                const answer = item.querySelector('.faq-answer');
                const isActive = item.classList.contains('active');

                // Close all items
                document.querySelectorAll('.faq-item').forEach(i => {
                    i.classList.remove('active');
                    const panel = i.querySelector('.faq-answer');
                    if (panel) panel.style.maxHeight = null;
                });

                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });
    }

    function renderFAQs() {
        const filteredFAQs = faqData.filter(faq => {
            const matchesCategory = currentFilter === "All" || faq.category === currentFilter;
            const haystack = [faq.question, faq.answer, ...(faq.tags || [])].join(' ').toLowerCase();
            return matchesCategory && haystack.includes(searchTerm);
        });

        if (!filteredFAQs.length) {
            faqSections.innerHTML = "";
            emptyState.hidden = false;
            return;
        }

        emptyState.hidden = true;

        const grouped = filteredFAQs.reduce((acc, faq) => {
            if (!acc[faq.category]) acc[faq.category] = [];
            acc[faq.category].push(faq);
            return acc;
        }, {});

        const orderedCategories = [
            ...categoryOrder.filter(category => grouped[category]),
            ...Object.keys(grouped).filter(category => !categoryOrder.includes(category))
        ];

        faqSections.innerHTML = orderedCategories.map(category => `
            <div class="faq-section">
                <div class="faq-section-head">
                    <h2 class="faq-section-title">${category}</h2>
                    <p class="faq-section-description">${categoryDescriptions[category] || ""}</p>
                </div>
                ${grouped[category].map((faq, index) => `
                    <div class="faq-item" data-index="${index}">
                        <div class="faq-question">
                            <span>${faq.question}</span>
                            <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                        <div class="faq-answer">
                            <div class="faq-answer-content">${faq.answer}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `).join('');

        attachAccordionHandlers();
    }

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderFAQs();
    });

    // Filter functionality
    filterGroup.addEventListener('click', (event) => {
        if (!event.target.matches('.faq-filter')) return;
        const newFilter = event.target.getAttribute('data-filter');
        if (!newFilter || newFilter === currentFilter) return;

        currentFilter = newFilter;
        filterGroup.querySelectorAll('.faq-filter').forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-filter') === currentFilter);
        });
        renderFAQs();
    });

    // Initial render
    renderFAQs();
});
