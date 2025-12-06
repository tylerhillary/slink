/**
 * Skill Bank - User Matching Algorithm
 * Matches users based on complementary skill interests
 */

class SkillMatcher {
    constructor() {
        this.users = [];
        this.matches = [];
    }

    /**
     * Add a new user to the system
     * @param {Object} user - User object with skills
     */
    addUser(user) {
        const userProfile = {
            id: user.id || this.generateId(),
            name: user.name,
            email: user.email,
            skillsToTeach: user.skillsToTeach || [],
            skillsToLearn: user.skillsToLearn || [],
            experience: user.experience || 'intermediate',
            availability: user.availability || 'flexible',
            location: user.location || '',
            rating: user.rating || 0,
            completedExchanges: user.completedExchanges || 0,
            joinedDate: user.joinedDate || new Date()
        };
        
        this.users.push(userProfile);
        return userProfile;
    }

    /**
     * Generate unique user ID
     */
    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Find matches for a specific user
     * @param {string} userId - User ID to find matches for
     * @returns {Array} Array of matched users with compatibility scores
     */
    findMatches(userId) {
        const currentUser = this.users.find(u => u.id === userId);
        if (!currentUser) return [];

        const matches = [];

        this.users.forEach(otherUser => {
            if (otherUser.id === userId) return;

            const compatibility = this.calculateCompatibility(currentUser, otherUser);
            
            if (compatibility.score > 0) {
                matches.push({
                    user: otherUser,
                    compatibility: compatibility
                });
            }
        });

        // Sort by compatibility score (highest first)
        matches.sort((a, b) => b.compatibility.score - a.compatibility.score);

        return matches;
    }

    /**
     * Calculate compatibility between two users
     * @param {Object} user1 - First user
     * @param {Object} user2 - Second user
     * @returns {Object} Compatibility object with score and reasons
     */
    calculateCompatibility(user1, user2) {
        let score = 0;
        const reasons = [];
        const matchedSkills = {
            user1Teaches: [],
            user2Teaches: []
        };

        // Primary Match: Skills I want to learn that they can teach (50 points max)
        const primaryMatches = this.findSkillOverlap(
            user1.skillsToLearn,
            user2.skillsToTeach
        );
        if (primaryMatches.length > 0) {
            const primaryScore = Math.min(primaryMatches.length * 15, 50);
            score += primaryScore;
            matchedSkills.user2Teaches = primaryMatches;
            reasons.push(`Can teach you: ${primaryMatches.join(', ')}`);
        }

        // Secondary Match: Skills they want to learn that I can teach (50 points max)
        const secondaryMatches = this.findSkillOverlap(
            user2.skillsToLearn,
            user1.skillsToTeach
        );
        if (secondaryMatches.length > 0) {
            const secondaryScore = Math.min(secondaryMatches.length * 15, 50);
            score += secondaryScore;
            matchedSkills.user1Teaches = secondaryMatches;
            reasons.push(`Wants to learn from you: ${secondaryMatches.join(', ')}`);
        }

        // Mutual Exchange Bonus: Both can teach each other (20 points)
        if (primaryMatches.length > 0 && secondaryMatches.length > 0) {
            score += 20;
            reasons.push('Perfect mutual exchange opportunity');
        }

        // Experience Level Compatibility (10 points)
        if (this.isExperienceCompatible(user1.experience, user2.experience)) {
            score += 10;
            reasons.push('Compatible experience levels');
        }

        // Activity Score: Active users get bonus (10 points)
        if (user2.completedExchanges > 5) {
            score += 10;
            reasons.push('Experienced exchanger');
        }

        // Rating Bonus (10 points max)
        if (user2.rating >= 4.5) {
            score += 10;
            reasons.push('Highly rated');
        } else if (user2.rating >= 4.0) {
            score += 5;
        }

        return {
            score: Math.min(score, 100),
            matchedSkills: matchedSkills,
            reasons: reasons,
            isPerfectMatch: primaryMatches.length > 0 && secondaryMatches.length > 0
        };
    }

    /**
     * Find overlapping skills between two arrays
     * @param {Array} skills1 
     * @param {Array} skills2 
     * @returns {Array} Overlapping skills
     */
    findSkillOverlap(skills1, skills2) {
        if (!skills1 || !skills2) return [];
        
        return skills1.filter(skill1 => 
            skills2.some(skill2 => 
                this.normalizeSkill(skill1) === this.normalizeSkill(skill2) ||
                this.isRelatedSkill(skill1, skill2)
            )
        );
    }

    /**
     * Normalize skill name for comparison
     */
    normalizeSkill(skill) {
        return skill.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    }

    /**
     * Check if two skills are related
     */
    isRelatedSkill(skill1, skill2) {
        const relatedSkills = {
            'javascript': ['js', 'react', 'nodejs', 'typescript'],
            'python': ['django', 'flask', 'datascience', 'machinelearning'],
            'design': ['ui', 'ux', 'graphicdesign', 'webdesign'],
            'photography': ['photoshop', 'lightroom', 'videoediting'],
            'marketing': ['seo', 'digitalmarketing', 'socialmedia']
        };

        const norm1 = this.normalizeSkill(skill1);
        const norm2 = this.normalizeSkill(skill2);

        for (const [key, related] of Object.entries(relatedSkills)) {
            if ((norm1.includes(key) && related.some(r => norm2.includes(r))) ||
                (norm2.includes(key) && related.some(r => norm1.includes(r)))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if experience levels are compatible
     */
    isExperienceCompatible(exp1, exp2) {
        const levels = {
            'beginner': 1,
            'intermediate': 2,
            'advanced': 3,
            'expert': 4
        };

        const diff = Math.abs(levels[exp1] - levels[exp2]);
        return diff <= 1; // Compatible if within 1 level
    }

    /**
     * Get top matches for a user
     * @param {string} userId 
     * @param {number} limit - Number of matches to return
     * @returns {Array} Top matches
     */
    getTopMatches(userId, limit = 10) {
        const matches = this.findMatches(userId);
        return matches.slice(0, limit);
    }

    /**
     * Get all users
     */
    getAllUsers() {
        return this.users;
    }

    /**
     * Search users by skill
     * @param {string} skillQuery 
     * @returns {Array} Users who teach this skill
     */
    searchBySkill(skillQuery) {
        const normalizedQuery = this.normalizeSkill(skillQuery);
        
        return this.users.filter(user => 
            user.skillsToTeach.some(skill => 
                this.normalizeSkill(skill).includes(normalizedQuery) ||
                normalizedQuery.includes(this.normalizeSkill(skill))
            )
        ).map(user => ({
            user: user,
            matchedSkills: user.skillsToTeach.filter(skill =>
                this.normalizeSkill(skill).includes(normalizedQuery) ||
                normalizedQuery.includes(this.normalizeSkill(skill))
            )
        }));
    }

    /**
     * Get match statistics
     */
    getMatchStatistics(userId) {
        const matches = this.findMatches(userId);
        
        return {
            totalMatches: matches.length,
            perfectMatches: matches.filter(m => m.compatibility.isPerfectMatch).length,
            averageScore: matches.length > 0 
                ? matches.reduce((sum, m) => sum + m.compatibility.score, 0) / matches.length 
                : 0,
            topMatch: matches[0] || null
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillMatcher;
}
