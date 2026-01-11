/* Sample user data for Slink platform */
const sampleUsers = [
  {
    id: 1,
    name: "Maya Johnson",
    headline: "UX Designer • Front-end Mentor",
    avatar: "assets/graphic designing.jpg",
    location: "Lagos",
    rating: 4.8,
    skillsOffered: [
      { name: "UX Design", level: "Advanced" },
      { name: "Figma", level: "Advanced" },
      { name: "HTML/CSS", level: "Intermediate" }
    ],
    skillsWanted: [
      { name: "Python", level: "Beginner" }
    ],
    bio: "Passionate UX designer with 5+ years of experience creating intuitive digital experiences. Love mentoring newcomers to the field.",
    availability: "Weekends",
    sampleWork: ["assets/graphic designing.jpg"]
  },
  {
    id: 2,
    name: "David Kim",
    headline: "Data Scientist • Python Expert",
    avatar: "assets/my-image.jpg",
    location: "Abuja",
    rating: 4.9,
    skillsOffered: [
      { name: "Python", level: "Expert" },
      { name: "Machine Learning", level: "Advanced" },
      { name: "SQL", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "Photography", level: "Beginner" }
    ],
    bio: "Data scientist at a tech startup. Enthusiastic about teaching Python and machine learning to aspiring developers.",
    availability: "Evenings",
    sampleWork: ["assets/cooking and culinary.jpg"]
  },
  {
    id: 3,
    name: "Sophia Garcia",
    headline: "Professional Photographer • Visual Storyteller",
    avatar: "assets/photography.jpg",
    location: "Port Harcourt",
    rating: 4.7,
    skillsOffered: [
      { name: "Photography", level: "Expert" },
      { name: "Adobe Lightroom", level: "Advanced" },
      { name: "Portrait Photography", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "Video Editing", level: "Intermediate" }
    ],
    bio: "Award-winning photographer specializing in portraits and events. Looking to learn video editing to expand my creative services.",
    availability: "Flexible",
    sampleWork: ["assets/photography.jpg", "assets/smoothies.jpg"]
  },
  {
    id: 4,
    name: "James Wilson",
    headline: "Chef & Nutritionist • Culinary Instructor",
    avatar: "assets/cooking and culinary.jpg",
    location: "Kano",
    rating: 4.6,
    skillsOffered: [
      { name: "Cooking", level: "Expert" },
      { name: "Nutrition", level: "Advanced" },
      { name: "Meal Planning", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "Social Media Marketing", level: "Beginner" }
    ],
    bio: "Professional chef with a passion for healthy eating. Teaching cooking classes and looking to improve my marketing skills.",
    availability: "Weekdays",
    sampleWork: ["assets/cooking and culinary.jpg", "assets/smoothies.jpg"]
  },
  {
    id: 5,
    name: "Emma Thompson",
    headline: "Video Editor • Content Creator",
    avatar: "assets/video editing.jpg",
    location: "Ibadan",
    rating: 4.9,
    skillsOffered: [
      { name: "Video Editing", level: "Expert" },
      { name: "Adobe Premiere", level: "Expert" },
      { name: "Content Creation", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "Cooking", level: "Intermediate" }
    ],
    bio: "Freelance video editor helping brands tell their stories. Want to learn cooking to create food-related content.",
    availability: "Evenings",
    sampleWork: ["assets/video editing.jpg"]
  },
  {
    id: 6,
    name: "Michael Chen",
    headline: "Marketing Specialist • Social Media Pro",
    avatar: "assets/my-image.jpg",
    location: "Benin City",
    rating: 4.5,
    skillsOffered: [
      { name: "Social Media Marketing", level: "Advanced" },
      { name: "Content Strategy", level: "Advanced" },
      { name: "Brand Management", level: "Intermediate" }
    ],
    skillsWanted: [
      { name: "Tailoring", level: "Beginner" }
    ],
    bio: "Digital marketing expert helping small businesses grow their online presence. Interested in learning tailoring for personal projects.",
    availability: "Weekends",
    sampleWork: ["assets/tailoring.jpg"]
  },
  {
    id: 7,
    name: "Olivia Parker",
    headline: "Fashion Designer • Sewing Instructor",
    avatar: "assets/tailoring.jpg",
    location: "Abeokuta",
    rating: 4.8,
    skillsOffered: [
      { name: "Tailoring", level: "Expert" },
      { name: "Pattern Making", level: "Advanced" },
      { name: "Fashion Design", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "UX Design", level: "Beginner" }
    ],
    bio: "Fashion designer with 8+ years of experience. Teaching sewing classes and looking to understand UX for e-commerce sites.",
    availability: "Flexible",
    sampleWork: ["assets/tailoring.jpg"]
  },
  {
    id: 8,
    name: "Robert Taylor",
    headline: "Hair Stylist • Beauty Educator",
    avatar: "assets/hairdressing.png",
    location: "Enugu",
    rating: 4.7,
    skillsOffered: [
      { name: "Hairdressing", level: "Expert" },
      { name: "Color Theory", level: "Advanced" },
      { name: "Client Consultation", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "Business Management", level: "Intermediate" }
    ],
    bio: "Professional hairstylist and salon owner. Looking to improve business management skills to expand my salon chain.",
    availability: "Weekdays",
    sampleWork: ["assets/hairdressing.png"]
  },
  {
    id: 9,
    name: "Aisha Mohammed",
    headline: "Web Designer • UI/UX Specialist",
    avatar: "assets/graphic designing.jpg",
    location: "Lagos",
    rating: 4.9,
    skillsOffered: [
      { name: "Website Design", level: "Expert" },
      { name: "UI/UX Design", level: "Advanced" },
      { name: "Figma", level: "Expert" }
    ],
    skillsWanted: [
      { name: "Digital Marketing", level: "Beginner" }
    ],
    bio: "Professional web designer with 7+ years of experience creating stunning websites. Passionate about teaching design principles to beginners.",
    availability: "Evenings",
    sampleWork: ["assets/graphic designing.jpg"]
  },
  {
    id: 10,
    name: "Chinedu Okafor",
    headline: "Full Stack Developer • Coding Instructor",
    avatar: "assets/my-image.jpg",
    location: "Port Harcourt",
    rating: 4.8,
    skillsOffered: [
      { name: "Website Development", level: "Expert" },
      { name: "JavaScript", level: "Expert" },
      { name: "React", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "Project Management", level: "Intermediate" }
    ],
    bio: "Full stack developer with expertise in building scalable web applications. Experienced in teaching programming to students of all levels.",
    availability: "Weekends",
    sampleWork: ["assets/cooking and culinary.jpg"]
  },
  {
    id: 11,
    name: "Adunni Adebayo",
    headline: "Professional Wig Maker • Beauty Specialist",
    avatar: "assets/tailoring.jpg",
    location: "Ibadan",
    rating: 4.6,
    skillsOffered: [
      { name: "Wigging", level: "Expert" },
      { name: "Hair Styling", level: "Advanced" },
      { name: "Beauty Therapy", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "Social Media Marketing", level: "Beginner" }
    ],
    bio: "Certified wig specialist with 10+ years of experience. Teaching traditional and modern wig making techniques to aspiring beauticians.",
    availability: "Flexible",
    sampleWork: ["assets/tailoring.jpg"]
  },
  {
    id: 12,
    name: "Emeka Nwosu",
    headline: "Videographer • Film Producer",
    avatar: "assets/video editing.jpg",
    location: "Abuja",
    rating: 4.7,
    skillsOffered: [
      { name: "Video", level: "Expert" },
      { name: "Cinematography", level: "Advanced" },
      { name: "Storytelling", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "Drone Operation", level: "Beginner" }
    ],
    bio: "Professional videographer with experience in documentary and commercial film production. Sharing practical video production skills with students.",
    availability: "Weekdays",
    sampleWork: ["assets/video editing.jpg"]
  },
  {
    id: 13,
    name: "Test Mentor One",
    headline: "Dummy Profile • Front-end Mentor",
    avatar: "assets/my-image.jpg",
    location: "Demo City",
    rating: 4.3,
    skillsOffered: [
      { name: "Website Development", level: "Intermediate" },
      { name: "JavaScript", level: "Intermediate" },
      { name: "HTML/CSS", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "UX Design", level: "Beginner" }
    ],
    bio: "This is a dummy mentor profile for testing and layout purposes.",
    availability: "Weekdays",
    sampleWork: ["assets/graphic designing.jpg"]
  },
  {
    id: 14,
    name: "Test Mentor Two",
    headline: "Dummy Profile • Data Mentor",
    avatar: "assets/my-image.jpg",
    location: "Sample Town",
    rating: 4.1,
    skillsOffered: [
      { name: "Python", level: "Intermediate" },
      { name: "SQL", level: "Intermediate" },
      { name: "Data Analysis", level: "Intermediate" }
    ],
    skillsWanted: [
      { name: "Video", level: "Beginner" }
    ],
    bio: "Another placeholder mentor so you can see how multiple dummy mentors look in the grid.",
    availability: "Evenings",
    sampleWork: ["assets/video editing.jpg"]
  },
  {
    id: 15,
    name: "Test Mentor Three",
    headline: "Dummy Profile • Design Coach",
    avatar: "assets/my-image.jpg",
    location: "Prototype City",
    rating: 3.9,
    skillsOffered: [
      { name: "UX Design", level: "Intermediate" },
      { name: "Figma", level: "Intermediate" }
    ],
    skillsWanted: [
      { name: "JavaScript", level: "Beginner" }
    ],
    bio: "Placeholder mentor profile used only for testing the mentor selection page.",
    availability: "Flexible",
    sampleWork: ["assets/graphic designing.jpg"]
  },
  {
    id: 16,
    name: "Sarah Johnson",
    headline: "Digital Marketing Specialist • SEO Expert",
    avatar: "assets/my-image.jpg",
    location: "Lagos",
    rating: 4.7,
    skillsOffered: [
      { name: "SEO", level: "Expert" },
      { name: "Google Ads", level: "Advanced" },
      { name: "Content Marketing", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "Graphic Design", level: "Beginner" }
    ],
    bio: "Helping businesses grow their online presence through effective digital marketing strategies. 8+ years of experience in SEO and paid advertising.",
    availability: "Weekdays",
    sampleWork: ["assets/graphic designing.jpg"]
  },
  {
    id: 17,
    name: "Michael Okonkwo",
    headline: "Blockchain Developer • Cryptocurrency Expert",
    avatar: "assets/my-image.jpg",
    location: "Abuja",
    rating: 4.8,
    skillsOffered: [
      { name: "Blockchain", level: "Expert" },
      { name: "Smart Contracts", level: "Advanced" },
      { name: "Solidity", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "Business Strategy", level: "Intermediate" }
    ],
    bio: "Building decentralized applications and smart contracts for various industries. Passionate about teaching blockchain technology to newcomers.",
    availability: "Evenings",
    sampleWork: ["assets/cooking and culinary.jpg"]
  },
  {
    id: 18,
    name: "Lisa Zhang",
    headline: "AI Engineer • Machine Learning Specialist",
    avatar: "assets/my-image.jpg",
    location: "Port Harcourt",
    rating: 4.9,
    skillsOffered: [
      { name: "Machine Learning", level: "Expert" },
      { name: "TensorFlow", level: "Advanced" },
      { name: "Python", level: "Expert" }
    ],
    skillsWanted: [
      { name: "Public Speaking", level: "Beginner" }
    ],
    bio: "Developing AI solutions for healthcare and finance sectors. Teaching machine learning concepts to students and professionals.",
    availability: "Weekends",
    sampleWork: ["assets/video editing.jpg"]
  },
  {
    id: 19,
    name: "Ahmed Ibrahim",
    headline: "Cybersecurity Analyst • Ethical Hacker",
    avatar: "assets/my-image.jpg",
    location: "Kano",
    rating: 4.6,
    skillsOffered: [
      { name: "Cybersecurity", level: "Expert" },
      { name: "Network Security", level: "Advanced" },
      { name: "Penetration Testing", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "Cloud Computing", level: "Intermediate" }
    ],
    bio: "Protecting organizations from cyber threats with 7+ years of experience in security assessment and penetration testing.",
    availability: "Flexible",
    sampleWork: ["assets/graphic designing.jpg"]
  },
  {
    id: 20,
    name: "Maria Santos",
    headline: "Mobile App Developer • Flutter Specialist",
    avatar: "assets/my-image.jpg",
    location: "Ibadan",
    rating: 4.5,
    skillsOffered: [
      { name: "Flutter", level: "Expert" },
      { name: "Dart", level: "Expert" },
      { name: "Firebase", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "UI/UX Design", level: "Intermediate" }
    ],
    bio: "Creating beautiful cross-platform mobile applications. Experienced in teaching mobile development to beginners and intermediate developers.",
    availability: "Weekdays",
    sampleWork: ["assets/tailoring.jpg"]
  },
  {
    id: 21,
    name: "Test Mentor Four",
    headline: "Dummy Profile • Business Coach",
    avatar: "assets/my-image.jpg",
    location: "Test City A",
    rating: 4.2,
    skillsOffered: [
      { name: "Business Strategy", level: "Advanced" },
      { name: "Leadership", level: "Advanced" },
      { name: "Project Management", level: "Expert" }
    ],
    skillsWanted: [
      { name: "Digital Marketing", level: "Beginner" }
    ],
    bio: "Experienced business consultant helping startups and established companies develop effective strategies. Placeholder profile for testing purposes.",
    availability: "Weekdays",
    sampleWork: ["assets/graphic designing.jpg"]
  },
  {
    id: 22,
    name: "Test Mentor Five",
    headline: "Dummy Profile • Language Tutor",
    avatar: "assets/my-image.jpg",
    location: "Test City B",
    rating: 4.0,
    skillsOffered: [
      { name: "English", level: "Expert" },
      { name: "French", level: "Advanced" },
      { name: "Spanish", level: "Intermediate" }
    ],
    skillsWanted: [
      { name: "German", level: "Beginner" }
    ],
    bio: "Professional language instructor with 10+ years of experience teaching multiple languages. Used for demonstration and testing.",
    availability: "Evenings",
    sampleWork: ["assets/cooking and culinary.jpg"]
  },
  {
    id: 23,
    name: "Test Mentor Six",
    headline: "Dummy Profile • Fitness Trainer",
    avatar: "assets/my-image.jpg",
    location: "Test City C",
    rating: 4.4,
    skillsOffered: [
      { name: "Personal Training", level: "Expert" },
      { name: "Nutrition", level: "Advanced" },
      { name: "Yoga", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "Cooking", level: "Intermediate" }
    ],
    bio: "Certified fitness professional helping clients achieve their health and wellness goals. Placeholder profile for platform testing.",
    availability: "Morning",
    sampleWork: ["assets/photography.jpg"]
  },
  {
    id: 24,
    name: "Test Mentor Seven",
    headline: "Dummy Profile • Music Instructor",
    avatar: "assets/my-image.jpg",
    location: "Test City D",
    rating: 4.6,
    skillsOffered: [
      { name: "Guitar", level: "Expert" },
      { name: "Music Theory", level: "Advanced" },
      { name: "Songwriting", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "Piano", level: "Beginner" }
    ],
    bio: "Professional musician and educator with expertise in multiple instruments. Used for testing mentor selection functionality.",
    availability: "Weekends",
    sampleWork: ["assets/video editing.jpg"]
  },
  {
    id: 25,
    name: "Test Mentor Eight",
    headline: "Dummy Profile • Financial Advisor",
    avatar: "assets/my-image.jpg",
    location: "Test City E",
    rating: 4.3,
    skillsOffered: [
      { name: "Financial Planning", level: "Expert" },
      { name: "Investment Strategies", level: "Advanced" },
      { name: "Tax Preparation", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "Cryptocurrency", level: "Beginner" }
    ],
    bio: "Licensed financial advisor helping individuals and businesses make informed financial decisions. Demo profile for platform testing.",
    availability: "Flexible",
    sampleWork: ["assets/tailoring.jpg"]
  },
  {
    id: 26,
    name: "Dummy Mentor A",
    headline: "Backend Development Mentor",
    avatar: "assets/my-image.jpg",
    location: "Lagos",
    rating: 4.4,
    skillsOffered: [
      { name: "Node.js", level: "Advanced" },
      { name: "Express", level: "Advanced" },
      { name: "MongoDB", level: "Intermediate" }
    ],
    skillsWanted: [
      { name: "GraphQL", level: "Beginner" }
    ],
    bio: "A dummy profile for a backend development mentor.",
    availability: "Weekends",
    sampleWork: ["assets/cooking and culinary.jpg"]
  },
  {
    id: 27,
    name: "Dummy Mentor B",
    headline: "Mobile Development Tutor",
    avatar: "assets/my-image.jpg",
    location: "Abuja",
    rating: 4.2,
    skillsOffered: [
      { name: "React Native", level: "Expert" },
      { name: "iOS Development", level: "Intermediate" },
      { name: "Android Development", level: "Intermediate" }
    ],
    skillsWanted: [
      { name: "SwiftUI", level: "Beginner" }
    ],
    bio: "This is a test mentor for mobile development skills.",
    availability: "Evenings",
    sampleWork: ["assets/video editing.jpg"]
  },
  {
    id: 28,
    name: "Dummy Mentor C",
    headline: "Cloud Engineering Guide",
    avatar: "assets/my-image.jpg",
    location: "Port Harcourt",
    rating: 4.6,
    skillsOffered: [
      { name: "AWS", level: "Expert" },
      { name: "Docker", level: "Advanced" },
      { name: "Kubernetes", level: "Intermediate" }
    ],
    skillsWanted: [
      { name: "Terraform", level: "Beginner" }
    ],
    bio: "Placeholder for a cloud engineering mentor.",
    availability: "Weekdays",
    sampleWork: ["assets/graphic designing.jpg"]
  },
  {
    id: 29,
    name: "Dummy Mentor D",
    headline: "Game Development Instructor",
    avatar: "assets/my-image.jpg",
    location: "Kano",
    rating: 4.7,
    skillsOffered: [
      { name: "Unity", level: "Expert" },
      { name: "C#", level: "Expert" },
      { name: "Game Design", level: "Advanced" }
    ],
    skillsWanted: [
      { name: "Unreal Engine", level: "Beginner" }
    ],
    bio: "A test profile for a game development mentor.",
    availability: "Flexible",
    sampleWork: ["assets/photography.jpg"]
  },
  {
    id: 30,
    name: "Dummy Mentor E",
    headline: "Quality Assurance Tester",
    avatar: "assets/my-image.jpg",
    location: "Ibadan",
    rating: 4.3,
    skillsOffered: [
      { name: "Manual Testing", level: "Expert" },
      { name: "Automated Testing", level: "Advanced" },
      { name: "Selenium", level: "Intermediate" }
    ],
    skillsWanted: [
      { name: "Cypress", level: "Beginner" }
    ],
    bio: "This is a placeholder for a QA mentor.",
    availability: "Weekends",
    sampleWork: ["assets/tailoring.jpg"]
  }
];

// Expose to window for non-module scripts that rely on window.sampleUsers
if (typeof window !== 'undefined') {
  window.sampleUsers = sampleUsers;
}

// Current user (for demo purposes)
let currentUser = {
  id: 13,
  name: "You",
  headline: "Web Developer • Skill Enthusiast",
  avatar: "assets/my-image.jpg",
  location: "Lagos",
  rating: 0,
  skillsOffered: [
    { name: "JavaScript", level: "Intermediate" },
    { name: "HTML/CSS", level: "Advanced" },
    { name: "Website Design", level: "Intermediate" }
  ],
  skillsWanted: [
    { name: "Figma", level: "Beginner" },
    { name: "Python", level: "Beginner" },
    { name: "Website Development", level: "Beginner" },
    { name: "Video", level: "Beginner" }
  ],
  bio: "Front-end developer passionate about learning new skills and sharing knowledge with others.",
  availability: "Evenings",
  sampleWork: []
};

// Expose to window for compatibility
if (typeof window !== 'undefined') {
  window.currentUser = currentUser;
}

// Calculate match score between current user and another user
function calculateMatchScore(currentUser, otherUser) {
  let score = 0;
  let reason = "";
  
  // Check if current user wants skills that other user offers
  const wantedSkills = currentUser.skillsWanted.map(skill => skill.name.toLowerCase());
  const offeredSkills = otherUser.skillsOffered.map(skill => skill.name.toLowerCase());
  
  const matchingSkills = wantedSkills.filter(skill => 
    offeredSkills.includes(skill)
  );
  
  // Check if other user wants skills that current user offers
  const otherWantedSkills = otherUser.skillsWanted.map(skill => skill.name.toLowerCase());
  const currentUserOfferedSkills = currentUser.skillsOffered.map(skill => skill.name.toLowerCase());
  
  const reverseMatchingSkills = otherWantedSkills.filter(skill => 
    currentUserOfferedSkills.includes(skill)
  );
  
  // Calculate score based on matches
  if (matchingSkills.length > 0) {
    score += matchingSkills.length * 25; // 25 points per matching skill
    reason += `Offers: ${matchingSkills.join(", ")}. `;
  }
  
  if (reverseMatchingSkills.length > 0) {
    score += reverseMatchingSkills.length * 25; // 25 points for reverse matches
    reason += `Needs: ${reverseMatchingSkills.join(", ")}. `;
  }
  
  // Cap score at 100
  score = Math.min(score, 100);
  
  // If no matches, provide a default reason
  if (score === 0) {
    reason = "Shared interests in skill development";
  }
  
  return {
    score: Math.round(score),
    reason: reason.trim()
  };
}

// Expose calculateMatchScore to window for cross-script access
if (typeof window !== 'undefined') {
  window.calculateMatchScore = calculateMatchScore;
}

// Render match cards on the homepage
function renderMatchCards() {
  const matchesGrid = document.querySelector('.matches-grid');
  if (!matchesGrid) return;
  
  // Calculate scores for all users
  const usersWithScores = sampleUsers.map(user => {
    const matchResult = calculateMatchScore(currentUser, user);
    return {
      ...user,
      matchScore: matchResult.score,
      matchReason: matchResult.reason
    };
  });
  
  // Sort by match score (descending) and take top 3
  const topMatches = usersWithScores
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
  
  // Generate HTML for match cards
  matchesGrid.innerHTML = topMatches.map(user => `
    <div class="match-card">
      <div class="match-card__header">
        <img src="${user.avatar}" alt="${user.name}" class="match-card__avatar">
        <div class="match-card__info">
          <h3>${user.name}</h3>
          <p>${user.headline}</p>
          <div class="rating">${'★'.repeat(Math.floor(user.rating))}${'☆'.repeat(5 - Math.floor(user.rating))} ${user.rating}</div>
        </div>
      </div>
      <div class="match-card__body">
        <div class="match-card__skills">
          <h4>Skills Offered:</h4>
          <div class="skill-tags">
            ${user.skillsOffered.map(skill => 
              `<span class="skill-tag skill-tag--offered">${skill.name} (${skill.level})</span>`
            ).join('')}
          </div>
        </div>
        <div class="match-card__skills">
          <h4>Skills Wanted:</h4>
          <div class="skill-tags">
            ${user.skillsWanted.map(skill => 
              `<span class="skill-tag skill-tag--wanted">${skill.name} (${skill.level})</span>`
            ).join('')}
          </div>
        </div>
        <div class="match-score">
          <span>Match: ${user.matchScore}%</span>
          <div class="match-score__bar">
            <div class="match-score__fill" style="width: ${user.matchScore}%"></div>
          </div>
        </div>
        <p class="match-card__reason">${user.matchReason}</p>
      </div>
      <div class="match-card__footer">
        <button class="btn btn--primary match-card__connect-btn" onclick="window.location.href='payment.html'">Connect ($25)</button>
      </div>
    </div>
  `).join('');
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  renderMatchCards();
  
  // Add event listeners for buttons
  const findSkillBtn = document.querySelector('.hero__cta .btn--primary');
  if (findSkillBtn) {
    findSkillBtn.addEventListener('click', () => {
      window.location.href = 'skill-selection.html';
    });
  }
  
  const offerSkillBtn = document.querySelector('.hero__cta .btn--secondary');
  if (offerSkillBtn) {
    offerSkillBtn.addEventListener('click', () => {
      showInfo('Skill offering form would open here in a full implementation.');
    });
  }
  
  // Mobile menu toggle
  const mobileMenuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".header__nav");

  mobileMenuButton?.addEventListener("click", () => {
    mobileMenuButton.classList.toggle("open");
    nav?.classList.toggle("open");
  });

  nav?.querySelectorAll(".header__nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (nav.classList.contains("open")) {
        nav.classList.remove("open");
        mobileMenuButton?.classList.remove("open");
      }
    });
  });

  const animatedElements = document.querySelectorAll('[data-animate]');
  if (animatedElements.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.getAttribute('data-animate-delay');
            if (delay) {
              el.style.transitionDelay = `${parseFloat(delay)}s`;
            }
            el.setAttribute('data-animate-state', 'visible');
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    animatedElements.forEach((el) => observer.observe(el));
  }
});

let activeAlertTimeout = null;

function showAlert(message, type = 'info', title = null, duration = 5000) {
  if (!message) {
    return null;
  }

  if (activeAlertTimeout) {
    clearTimeout(activeAlertTimeout);
    activeAlertTimeout = null;
  }

  const existingAlert = document.querySelector('.alert');
  existingAlert?.remove();

  const iconMap = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  const defaultTitles = {
    info: 'Heads up',
    success: 'Success',
    warning: 'Check this',
    error: 'Something went wrong',
  };

  const alertEl = document.createElement('div');
  alertEl.className = `alert alert-${type}`;
  alertEl.setAttribute('role', 'status');
  alertEl.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

  const heading = title ?? defaultTitles[type] ?? 'Notice';
  const icon = iconMap[type] ?? iconMap.info;

  alertEl.innerHTML = `
    <div class="alert-icon" aria-hidden="true">${icon}</div>
    <div class="alert-content">
      ${heading ? `<div class="alert-title">${heading}</div>` : ''}
      <div class="alert-message">${message}</div>
    </div>
    <button class="alert-close" type="button" aria-label="Close notification">×</button>
  `;

  const dismiss = () => {
    alertEl.classList.remove('show');
    alertEl.addEventListener('transitionend', () => alertEl.remove(), { once: true });
  };

  alertEl.querySelector('.alert-close')?.addEventListener('click', dismiss);

  document.body.appendChild(alertEl);

  requestAnimationFrame(() => {
    alertEl.classList.add('show');
  });

  if (duration > 0) {
    activeAlertTimeout = setTimeout(dismiss, duration);
  }

  return alertEl;
}

// Convenience functions
function showSuccess(message, title = null, duration = 5000) {
  return showAlert(message, 'success', title, duration);
}

function showError(message, title = null, duration = 5000) {
  return showAlert(message, 'error', title, duration);
}

function showWarning(message, title = null, duration = 5000) {
  return showAlert(message, 'warning', title, duration);
}

function showInfo(message, title = null, duration = 5000) {
  return showAlert(message, 'info', title, duration);
}

// End of Slink core functionality