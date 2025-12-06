document.addEventListener('DOMContentLoaded', () => {
    // ... (rest of the code remains the same)

    // --- Hamburger Menu --- //
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    // --- Custom Select Dropdown --- //
    function setupCustomSelects() {
        const customSelects = document.querySelectorAll('.custom-select-wrapper');
        if (!customSelects.length) return;

        customSelects.forEach(wrapper => {
            const selectElement = wrapper.querySelector('select');
            const options = selectElement.querySelectorAll('option');
            const parentFormGroup = wrapper.closest('.form-group-new');

            // Create the custom 'selected' element
            const selectedDiv = document.createElement('div');
            selectedDiv.setAttribute('class', 'select-selected');
            const initialSelectedIndex = selectElement.selectedIndex > -1 ? selectElement.selectedIndex : 0;
            selectedDiv.innerHTML = options[initialSelectedIndex].innerHTML || '&nbsp;'; // Use non-breaking space for empty initial value
            if (!options[initialSelectedIndex].innerHTML) {
                parentFormGroup.classList.remove('has-value');
            } else {
                 parentFormGroup.classList.add('has-value');
            }
            wrapper.appendChild(selectedDiv);

            // Create the options container
            const optionsDiv = document.createElement('div');
            optionsDiv.setAttribute('class', 'select-items select-hide');

            // Create and append options
            options.forEach((option) => {
                if (option.disabled) return; // Skip the disabled placeholder
                
                const optionDiv = document.createElement('div');
                optionDiv.innerHTML = option.innerHTML;
                
                optionDiv.addEventListener('click', function() {
                    selectElement.value = option.value;
                    selectedDiv.innerHTML = this.innerHTML;
                    parentFormGroup.classList.add('has-value');
                    parentFormGroup.classList.remove('is-active');
                    closeAllSelect(selectedDiv);
                });
                optionsDiv.appendChild(optionDiv);
            });
            wrapper.appendChild(optionsDiv);

            selectedDiv.addEventListener('click', function(e) {
                e.stopPropagation();
                const wasActive = this.classList.contains('select-arrow-active');
                closeAllSelect(this);
                if (!wasActive) {
                    this.nextSibling.classList.toggle('select-hide');
                    this.classList.toggle('select-arrow-active');
                    parentFormGroup.classList.toggle('is-active', this.classList.contains('select-arrow-active'));
                }
            });
        });

        function closeAllSelect(elmnt) {
            document.querySelectorAll('.select-items').forEach((items, i) => {
                const selected = document.querySelectorAll('.select-selected')[i];
                const parentGroup = selected.closest('.form-group-new');
                if (elmnt !== selected) {
                    selected.classList.remove('select-arrow-active');
                    if (parentGroup) parentGroup.classList.remove('is-active');
                    items.classList.add('select-hide');
                }
            });
        }

        document.addEventListener('click', () => closeAllSelect(null));
    }

    setupCustomSelects();

    // --- Join Community Form Submission --- //
    const joinForm = document.getElementById('join-community-form');
    const thankYouMessage = document.getElementById('form-thank-you');

    if (joinForm && thankYouMessage) {
        const formTitle = document.querySelector('#form-section .form-title');
        const formSubtitle = document.querySelector('#form-section .form-subtitle');

        joinForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(joinForm);

            fetch(joinForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    if (formTitle) {
                        formTitle.style.display = 'none';
                    }
                    if (formSubtitle) {
                        formSubtitle.style.display = 'none';
                    }
                    joinForm.style.display = 'none';
                    thankYouMessage.style.display = 'block';
                } else {
                    alert('There was a problem submitting your form. Please try again.');
                }
            }).catch(error => {
                console.error('Form submission error:', error);
                alert('There was a problem submitting your form. Please try again.');
            });
        });
    }


    // --- Tutor Application Form Submission --- //
    console.log('🔍 Looking for form elements...');
    
    // Wait for DOM to be fully loaded
    function initializeTutorForm() {
    const tutorForm = document.getElementById('tutor-application-form');
    const tutorThankYouMessage = document.getElementById('tutor-form-thank-you');
        
        console.log('🔍 Form elements found:', { tutorForm, tutorThankYouMessage });
        console.log('🔍 Form element type:', tutorForm?.constructor.name);
        console.log('🔍 Form element tagName:', tutorForm?.tagName);

    if (tutorForm && tutorThankYouMessage) {
            console.log('✅ Found tutor form, adding submission handler');
            
            // Form validation function
            function validateTutorForm() {
                console.log('🔍 Starting form validation...');
                
                let isValid = true;
                const requiredFields = tutorForm.querySelectorAll('[required]');
                const missingFields = [];
                
                // Check all required fields
                requiredFields.forEach(field => {
                    if (field.type === 'checkbox') {
                        // For checkboxes, check if at least one in the group is selected
                        if (field.name === 'availability[]') {
                            const checkboxes = tutorForm.querySelectorAll('input[name="availability[]"]');
                            const checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);
                            if (checkedBoxes.length === 0) {
                                isValid = false;
                                missingFields.push('Availability');
                                console.log('❌ No availability selected');
                            }
                        }
                    } else {
                        // For other fields, check if they have values
                        if (!field.value.trim()) {
                            isValid = false;
                            missingFields.push(field.name || field.id);
                            field.style.borderColor = '#e74c3c';
                            console.log('❌ Missing field:', field.name || field.id);
                        } else {
                            field.style.borderColor = '';
                        }
                    }
                });
                
                if (!isValid) {
                    console.log('❌ Validation failed. Missing fields:', missingFields);
                    alert('Please fill in all required fields: ' + missingFields.join(', '));
                    return false;
                }
                
                console.log('✅ All required fields are filled');
                return true;
            }
            
        tutorForm.addEventListener('submit', function(event) {
            event.preventDefault();
                console.log('🚀 Form submission started');

                // Validate form before submission
                if (!validateTutorForm()) {
                    console.log('❌ Form validation failed');
                    return;
                }

                console.log('✅ Form validation passed, proceeding with submission');

                // Get form data
            const formData = new FormData(tutorForm);

                // Show loading state
                const submitBtn = tutorForm.querySelector('.btn-submit');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                submitBtn.disabled = true;

                // Submit to Formspree
            fetch(tutorForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                    console.log('📨 Formspree response:', response.status);
                    
                if (response.ok) {
                        // Success - show thank you message
                    tutorForm.style.display = 'none';
                    tutorThankYouMessage.style.display = 'block';
                        console.log('✅ Form submitted successfully');
                } else {
                        throw new Error('Submission failed with status: ' + response.status);
                }
            }).catch(error => {
                    console.error('❌ Form submission error:', error);
                alert('There was a problem submitting your application. Please try again.');
                    
                    // Reset button state
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
            });
        });
            
            console.log('✅ Form submission handler added successfully');
            
            // Test function for debugging
            window.testTutorForm = function() {
                console.log('🧪 Testing tutor form...');
                
                // Fill form with test data
                const testData = {
                    'tutor-name': 'Test User',
                    'tutor-email': 'test@example.com',
                    'tutor-phone': '08012345678',
                    'tutor-location': 'Lagos, Nigeria',
                    'primary-skill': 'Web Development',
                    'skill-description': 'I am an experienced web developer with 5 years of experience in HTML, CSS, JavaScript, and React.',
                    'years-experience': '3-5 years',
                    'monthly-rate': '50000',
                    'motivation': 'I want to share my knowledge and help others grow in their web development journey.'
                };
                
                // Fill the form fields
                Object.keys(testData).forEach(key => {
                    const field = tutorForm.querySelector(`[name="${key}"]`);
                    if (field) {
                        field.value = testData[key];
                        console.log('✅ Filled field:', key, 'with value:', testData[key]);
                    } else {
                        console.log('❌ Field not found:', key);
                    }
                });
                
                // Check availability checkboxes
                const availabilityCheckboxes = tutorForm.querySelectorAll('input[name="availability[]"]');
                console.log('🔍 Found availability checkboxes:', availabilityCheckboxes.length);
                if (availabilityCheckboxes.length >= 4) {
                    availabilityCheckboxes[2].checked = true; // Weekday Evenings
                    availabilityCheckboxes[3].checked = true; // Weekends
                    console.log('✅ Checked availability checkboxes');
                }
                
                console.log('✅ Test data filled. You can now submit the form.');
                alert('Test data filled! You can now submit the form.');
            };
            
            // Add click event listener to submit button for debugging
            const submitButton = tutorForm.querySelector('.btn-submit');
            if (submitButton) {
                console.log('🔘 Found submit button:', submitButton);
                console.log('🔘 Button HTML:', submitButton.outerHTML);
                console.log('🔘 Button parent form:', submitButton.form);
                
                submitButton.addEventListener('click', function(e) {
                    console.log('🖱️ Submit button clicked!');
                    console.log('🖱️ Button element:', this);
                    console.log('🖱️ Button type:', this.type);
                    console.log('🖱️ Button disabled:', this.disabled);
                    console.log('🖱️ Event target:', e.target);
                });
                
                // Also add mousedown and mouseup events for debugging
                submitButton.addEventListener('mousedown', function(e) {
                    console.log('🖱️ Submit button mousedown');
                });
                
                submitButton.addEventListener('mouseup', function(e) {
                    console.log('🖱️ Submit button mouseup');
                });
            } else {
                console.error('❌ Submit button not found!');
            }
            
            // Test form submission directly
            window.testFormSubmission = function() {
                console.log('🧪 Testing form submission directly...');
                console.log('🧪 Form element:', tutorForm);
                console.log('🧪 Form action:', tutorForm.action);
                console.log('🧪 Form method:', tutorForm.method);
                
                // Try to submit the form programmatically
                try {
                    tutorForm.submit();
                    console.log('✅ Form.submit() called successfully');
                } catch (error) {
                    console.error('❌ Error calling form.submit():', error);
                }
            };
        } else {
            console.log('⚠️ Tutor form elements not found');
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTutorForm);
    } else {
        initializeTutorForm();
    }

    // Character counter functionality
    function addCharacterCounter(textarea) {
        const formGroup = textarea.closest('.form-group');
        if (!formGroup) return;

        const counter = document.createElement('div');
        counter.className = 'char-counter';
        formGroup.appendChild(counter);

        function updateCounter() {
            const length = textarea.value.length;
            const maxLength = textarea.getAttribute('maxlength') || 1000;
            
            counter.textContent = `${length}/${maxLength} characters`;
            
            // Update counter color based on length
            counter.classList.remove('warning', 'error');
            if (length > maxLength * 0.8) {
                counter.classList.add('warning');
            }
            if (length > maxLength * 0.95) {
                counter.classList.add('error');
            }
        }

        textarea.addEventListener('input', updateCounter);
        updateCounter(); // Initial count
    }

    // Form validation functions
    function validateTutorForm() {
        let isValid = true;
        const requiredFields = tutorForm.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        // Validate availability checkboxes
        if (!validateAvailability()) {
            isValid = false;
        }

        return isValid;
    }

    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        clearFieldError(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required.';
        }

        // Email validation
        if (fieldName === 'tutor-email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }
        }

        // Phone validation
        if (fieldName === 'tutor-phone' && value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number.';
            }
        }

        // Monthly rate validation
        if (fieldName === 'monthly-rate' && value) {
            const rate = parseInt(value);
            if (isNaN(rate) || rate < 10000) {
                isValid = false;
                errorMessage = 'Monthly rate must be at least $10,000.';
            }
        }

        // Text area minimum length
        if (field.tagName === 'TEXTAREA' && value) {
            if (value.length < 20) {
                isValid = false;
                errorMessage = 'Please provide more details (at least 20 characters).';
            }
        }

        // Show error if validation failed
        if (!isValid) {
            showFieldError(field, errorMessage);
        }

        return isValid;
    }

    function validateAvailability() {
        const availabilityCheckboxes = tutorForm.querySelectorAll('input[name="availability[]"]');
        const checkedBoxes = Array.from(availabilityCheckboxes).filter(cb => cb.checked);
        
        if (checkedBoxes.length === 0) {
            showFieldError(availabilityCheckboxes[0], 'Please select at least one availability option.');
            return false;
        }
        
        clearFieldError(availabilityCheckboxes[0]);
        return true;
    }

    function showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        // Remove existing error
        const existingError = formGroup.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);

        // Add error styling
        formGroup.classList.add('has-error');
        field.classList.add('error');
    }

    function clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        const errorDiv = formGroup.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }

        formGroup.classList.remove('has-error');
        field.classList.remove('error');
    }

    function showFormError(message) {
        // Create or update error message
        let errorDiv = tutorForm.querySelector('.form-error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'form-error-message';
            tutorForm.insertBefore(errorDiv, tutorForm.querySelector('.btn-submit'));
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    function showSuccessMessage(message) {
        // Create success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success-message';
        successDiv.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(successDiv);
        
        // Show with animation
        setTimeout(() => {
            successDiv.classList.add('show');
        }, 100);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            successDiv.classList.remove('show');
            setTimeout(() => {
                if (successDiv.parentElement) {
                    successDiv.remove();
                }
            }, 300);
        }, 5000);
    }

    // --- Community Guidelines Modal --- //
    const modal = document.getElementById('guidelines-modal');
    const openModalBtn = document.getElementById('open-guidelines-modal');
    const closeModalBtn = document.querySelector('#guidelines-modal .close-button');

    if (modal && openModalBtn && closeModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });

        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    }

    // (teach-a-skill removed) No-op: primary/other skill toggles are no longer needed

    // --- Scroll Animations --- //
    const animatedElements = document.querySelectorAll('.scroll-animate');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Animate expertise cards on scroll
    const expertiseCards = document.querySelectorAll('.expertise-card');
    if (expertiseCards.length > 0) {
        const expertiseObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 200);
                    expertiseObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        expertiseCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            expertiseObserver.observe(card);
        });
    }

    // --- Skills Page V2 Functionality --- //
    const skillsPage = document.querySelector('.skills-page-container');
    if (skillsPage) {
        const searchInput = document.getElementById('skill-search');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const skillCards = document.querySelectorAll('.skill-card');
        const selectSkillBtns = document.querySelectorAll('.select-skill-btn');
        const selectedSkillsDisplay = document.getElementById('selected-skills-display');
        const totalPriceDisplay = document.getElementById('total-price-display');
        const totalAmountSpan = document.getElementById('total-amount');
        const noSkillsMessage = document.querySelector('.no-skills-message');
        const learningForm = document.getElementById('learning-form');

        let selectedSkills = {};
        let currentFilter = 'all';
        let currentSearchTerm = '';
        let currentDifficulty = 'all';
        let currentPriceRange = { min: 0, max: 500 };

        // Initialize the page
        initializeSkillsPage();

        function initializeSkillsPage() {
            // Set initial active filter
            const allFilterBtn = document.querySelector('[data-filter="all"]');
            if (allFilterBtn) {
                allFilterBtn.classList.add('active');
            }

            // Set initial active difficulty
            const allDifficultyBtn = document.querySelector('[data-difficulty="all"]');
            if (allDifficultyBtn) {
                allDifficultyBtn.classList.add('active');
            }

            // Initialize price filters
            initializePriceFilters();

            // Add loading states to skill cards
            skillCards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
            });

            // Show initial skill count
            updateSkillCount();
            
            // Initialize enhanced hero interactions
            initializeSkillsHeroInteractions();
        }

        // Initialize enhanced hero interactions for skills page
        function initializeSkillsHeroInteractions() {
            // Add floating labels animation
            const heroStats = document.querySelectorAll('.teach-hero .stat-item');
            
            heroStats.forEach((item, index) => {
                // Add entrance animation
                item.style.opacity = '0';
                item.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    item.style.transition = 'all 0.6s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 200);
                
                // Add click interactions
                item.addEventListener('click', () => {
                    // Add click animation
                    item.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        item.style.transform = '';
                    }, 150);
                    
                    // Show skill-specific tooltip
                    showSkillsHeroTooltip(item);
                });
            });

            // Add hero text animations
            const heroTitle = document.querySelector('.teach-hero h1');
            const heroSubtitle = document.querySelector('.teach-hero .hero-subtitle');
            
            if (heroTitle) {
                heroTitle.style.opacity = '0';
                heroTitle.style.transform = 'translateY(30px)';
                setTimeout(() => {
                    heroTitle.style.transition = 'all 0.8s ease';
                    heroTitle.style.opacity = '1';
                    heroTitle.style.transform = 'translateY(0)';
                }, 100);
            }
            
            if (heroSubtitle) {
                heroSubtitle.style.opacity = '0';
                heroSubtitle.style.transform = 'translateY(30px)';
                setTimeout(() => {
                    heroSubtitle.style.transition = 'all 0.8s ease';
                    heroSubtitle.style.opacity = '1';
                    heroSubtitle.style.transform = 'translateY(0)';
                }, 300);
            }
        }

        function showSkillsHeroTooltip(item) {
            const tooltip = document.createElement('div');
            tooltip.className = 'skills-hero-tooltip';
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 0.8rem 1.2rem;
                border-radius: 12px;
                font-size: 0.9rem;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s ease;
                max-width: 250px;
                text-align: center;
                box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            `;
            
            const statNumber = item.querySelector('.stat-number').textContent;
            const statLabel = item.querySelector('.stat-label').textContent;
            
            if (statLabel.includes('Available Skills')) {
                tooltip.textContent = `Browse our extensive collection of ${statNumber} skills across all categories!`;
            } else if (statLabel.includes('Active Learners')) {
                tooltip.textContent = `Join ${statNumber} learners who are already transforming their lives!`;
            } else if (statLabel.includes('Success Rate')) {
                tooltip.textContent = `${statNumber} of our students achieve their learning goals!`;
            }
            
            item.appendChild(tooltip);
            
            // Animate in
            setTimeout(() => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateY(0)';
            }, 10);
            
            // Remove after 4 seconds
            setTimeout(() => {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateY(10px)';
                setTimeout(() => tooltip.remove(), 300);
            }, 4000);
        }

        // Initialize price filter functionality
        function initializePriceFilters() {
            const priceMinSlider = document.getElementById('price-min');
            const priceMaxSlider = document.getElementById('price-max');
            const priceMinLabel = document.getElementById('price-min-label');
            const priceMaxLabel = document.getElementById('price-max-label');

            if (priceMinSlider && priceMaxSlider) {
                // Update labels when sliders change
                priceMinSlider.addEventListener('input', (e) => {
                    const value = e.target.value;
                    priceMinLabel.textContent = value;
                    currentPriceRange.min = parseInt(value);
                    filterSkills(currentFilter, currentSearchTerm, currentDifficulty, currentPriceRange);
                    updateSkillCount();
                });

                priceMaxSlider.addEventListener('input', (e) => {
                    const value = e.target.value;
                    priceMaxLabel.textContent = value;
                    currentPriceRange.max = parseInt(value);
                    filterSkills(currentFilter, currentSearchTerm, currentDifficulty, currentPriceRange);
                    updateSkillCount();
                });

                // Ensure min doesn't exceed max and vice versa
                priceMinSlider.addEventListener('input', () => {
                    if (parseInt(priceMinSlider.value) > parseInt(priceMaxSlider.value)) {
                        priceMaxSlider.value = priceMinSlider.value;
                        priceMaxLabel.textContent = priceMinSlider.value;
                        currentPriceRange.max = parseInt(priceMinSlider.value);
                    }
                });

                priceMaxSlider.addEventListener('input', () => {
                    if (parseInt(priceMaxSlider.value) < parseInt(priceMinSlider.value)) {
                        priceMinSlider.value = priceMaxSlider.value;
                        priceMinLabel.textContent = priceMaxSlider.value;
                        currentPriceRange.min = parseInt(priceMaxSlider.value);
                    }
                });
            }
        }

        // 1. Enhanced Filtering Logic with Count Display
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Handle category filters
                if (btn.hasAttribute('data-filter')) {
                    document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                    currentFilter = btn.getAttribute('data-filter');
                }
                
                // Handle difficulty filters
                if (btn.hasAttribute('data-difficulty')) {
                    document.querySelectorAll('[data-difficulty]').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentDifficulty = btn.getAttribute('data-difficulty');
                }
                
                filterSkills(currentFilter, currentSearchTerm, currentDifficulty);
                updateSkillCount();
            });
        });

        // 2. Enhanced Search Logic with Debouncing
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value;
            clearTimeout(searchTimeout);
            
            // Add loading state
            searchInput.classList.add('searching');
            
            searchTimeout = setTimeout(() => {
                filterSkills(currentFilter, currentSearchTerm);
                updateSkillCount();
                searchInput.classList.remove('searching');
            }, 300);
        });

        // 3. Enhanced Filter Function with Better Performance
        function filterSkills(category, searchTerm, difficulty, priceRange = currentPriceRange) {
            const normalizedSearchTerm = searchTerm.toLowerCase().trim();
            let visibleCount = 0;

            skillCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                const cardDifficulty = card.getAttribute('data-difficulty');
                const cardPrice = parseInt(card.getAttribute('data-price') || '0');
                const cardTitle = card.querySelector('h3').textContent.toLowerCase();
                const cardDescription = card.querySelector('p').textContent.toLowerCase();
                
                const categoryMatch = category === 'all' || cardCategory === category;
                const difficultyMatch = difficulty === 'all' || cardDifficulty === difficulty;
                const priceMatch = cardPrice >= priceRange.min && cardPrice <= priceRange.max;
                const searchMatch = !searchTerm || 
                    cardTitle.includes(normalizedSearchTerm) || 
                    cardDescription.includes(normalizedSearchTerm);

                if (categoryMatch && difficultyMatch && priceMatch && searchMatch) {
                    card.style.display = 'flex';
                    card.style.animation = 'skillCardFadeIn 0.4s ease-out';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Show "no results" message if needed
            showNoResultsMessage(visibleCount === 0 && (searchTerm || category !== 'all' || difficulty !== 'all'));
        }

        // 4. Show/Hide No Results Message
        function showNoResultsMessage(show) {
            let noResultsMsg = document.querySelector('.no-results-message');
            
            if (show) {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.className = 'no-results-message';
                    noResultsMsg.innerHTML = `
                        <div style="text-align: center; padding: 3rem 1rem; color: var(--color-secondary);">
                            <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                            <h3>No skills found</h3>
                            <p>Try adjusting your search terms or filter selection.</p>
                        </div>
                    `;
                    document.querySelector('.skills-grid').appendChild(noResultsMsg);
                }
                noResultsMsg.style.display = 'block';
            } else if (noResultsMsg) {
                noResultsMsg.style.display = 'none';
            }
        }

        // 5. Update Skill Count Display
        function updateSkillCount() {
            const visibleCards = Array.from(skillCards).filter(card => 
                card.style.display !== 'none'
            );
            
            // Add count display to sidebar if it doesn't exist
            let countDisplay = document.querySelector('.skills-count');
            if (!countDisplay) {
                countDisplay = document.createElement('div');
                countDisplay.className = 'skills-count';
                countDisplay.style.cssText = `
                    background: var(--color-primary);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    text-align: center;
                    margin-top: 1rem;
                `;
                document.querySelector('.sidebar-widget:last-child').appendChild(countDisplay);
            }
            
            countDisplay.textContent = `${visibleCards.length} skill${visibleCards.length !== 1 ? 's' : ''} available`;
        }

        // 6. Enhanced Skill Selection with Better UX
        selectSkillBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const skillName = btn.getAttribute('data-skill');
                const skillCard = btn.closest('.skill-card');
                
                if (selectedSkills[skillName]) {
                    // Show feedback that skill is already selected
                    showSkillAlreadySelectedFeedback(btn);
                    return;
                }

                // Create enhanced tier selection modal
                createEnhancedTierSelectionModal(skillName, skillCard);
            });
        });

        function showSkillAlreadySelectedFeedback(btn) {
            const originalText = btn.textContent;
            btn.textContent = 'Already Selected!';
            btn.style.background = 'var(--color-secondary)';
            btn.style.cursor = 'not-allowed';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.cursor = '';
            }, 2000);
        }

        function createEnhancedTierSelectionModal(skillName, skillCard) {
            const tiers = Array.from(skillCard.querySelectorAll('.pricing-tier'));
            
            // Remove existing modal if any
            const existingModal = document.querySelector('.tier-selection-modal');
            if(existingModal) existingModal.remove();

            const modal = document.createElement('div');
            modal.className = 'tier-selection-modal';

            let optionsHTML = tiers.map(tier => {
                const name = tier.querySelector('.tier-name').textContent;
                const priceText = tier.querySelector('.tier-price').textContent;
                const price = parseInt(priceText.replace('₦', '').replace('$', ''));
                return `<div class="tier-option" data-tier="${name}" data-price="${price}">
                            <span class="tier-name">${name}</span>
                            <span class="tier-price">${priceText}</span>
                        </div>`;
            }).join('');

            modal.innerHTML = `
                <div class="modal-content">
                    <button class="close-modal">&times;</button>
                    <h4><i class="fas fa-graduation-cap"></i> Select a Tier for ${skillName}</h4>
                    <p style="color: var(--color-secondary); margin-bottom: 1.5rem;">Choose the learning level that best fits your needs</p>
                    <div class="tier-options">${optionsHTML}</div>
                </div>
            `;

            document.body.appendChild(modal);

            // Add event listeners for the new modal
            modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => { if(e.target === modal) modal.remove() });

            modal.querySelectorAll('.tier-option').forEach(option => {
                option.addEventListener('click', () => {
                    const tier = option.dataset.tier;
                    const price = parseInt(option.dataset.price);
                    addSkill(skillName, tier, price);
                    modal.remove();
                    
                    // Show success feedback
                    showSkillAddedFeedback(skillName);
                });
            });

            // Add keyboard support
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') modal.remove();
            });
        }

        function showSkillAddedFeedback(skillName) {
            // Create a temporary success message
            const successMsg = document.createElement('div');
            successMsg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--green-accent);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 1001;
                animation: slideInRight 0.3s ease-out;
            `;
            successMsg.innerHTML = `<i class="fas fa-check"></i> ${skillName} added to your selection!`;
            
            document.body.appendChild(successMsg);
            
            setTimeout(() => {
                successMsg.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => successMsg.remove(), 300);
            }, 3000);
        }

        // 7. Enhanced Skill Management
        function addSkill(name, tier, price) {
            selectedSkills[name] = { tier, price, addedAt: new Date() };
            updateSelectedSkillsUI();
            
            // Update the button state
            const skillCard = document.querySelector(`[data-skill="${name}"]`);
            if (skillCard) {
                const btn = skillCard.querySelector('.select-skill-btn');
                btn.textContent = 'Selected ✓';
                btn.style.background = 'var(--green-accent)';
                btn.style.cursor = 'not-allowed';
            }
        }

        function removeSkill(name) {
            delete selectedSkills[name];
            updateSelectedSkillsUI();
            
            // Reset the button state
            const skillCard = document.querySelector(`[data-skill="${name}"]`);
            if (skillCard) {
                const btn = skillCard.querySelector('.select-skill-btn');
                btn.textContent = 'Select This Skill';
                btn.style.background = '';
                btn.style.cursor = '';
            }
        }

        // 8. Enhanced UI Updates
        function updateSelectedSkillsUI() {
            if (Object.keys(selectedSkills).length === 0) {
                noSkillsMessage.style.display = 'block';
                selectedSkillsDisplay.innerHTML = '';
                selectedSkillsDisplay.appendChild(noSkillsMessage);
                totalPriceDisplay.style.display = 'none';
            } else {
                noSkillsMessage.style.display = 'none';
                selectedSkillsDisplay.innerHTML = '';
                let total = 0;

                for (const skillName in selectedSkills) {
                    const skill = selectedSkills[skillName];
                    total += skill.price;

                    const skillEl = document.createElement('div');
                    skillEl.className = 'selected-skill-item';
                    skillEl.innerHTML = `
                        <div class="skill-info">
                            <span class="skill-name"><strong>${skillName}</strong></span>
                            <span class="skill-tier">${skill.tier} Level</span>
                        </div>
                        <span class="skill-price">$${skill.price.toLocaleString()}</span>
                        <button type="button" class="remove-skill-btn" title="Remove ${skillName}">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    skillEl.querySelector('.remove-skill-btn').addEventListener('click', () => removeSkill(skillName));
                    selectedSkillsDisplay.appendChild(skillEl);
                }

                totalAmountSpan.textContent = total.toLocaleString();
                totalPriceDisplay.style.display = 'block';
            }
        }

        // 9. Enhanced Form Validation and Submission
        if (learningForm) {
            learningForm.addEventListener('submit', (e) => {
                e.preventDefault();

                if (Object.keys(selectedSkills).length === 0) {
                    showFormError('Please select at least one skill before submitting.');
                    return;
                }

                // Validate required fields
                const requiredFields = learningForm.querySelectorAll('[required]');
                let isValid = true;
                let firstInvalidField = null;

                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        field.classList.add('error');
                        isValid = false;
                        if (!firstInvalidField) firstInvalidField = field;
                    } else {
                        field.classList.remove('error');
                    }
                });

                if (!isValid) {
                    showFormError('Please fill in all required fields.');
                    if (firstInvalidField) {
                        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        firstInvalidField.focus();
                    }
                    return;
                }

                // Show loading state
                const submitBtn = learningForm.querySelector('.btn-submit');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                submitBtn.disabled = true;

                // Add selected skills to hidden input
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'Selected Skills';
                hiddenInput.value = JSON.stringify(selectedSkills, null, 2);
                learningForm.appendChild(hiddenInput);

                // Add total price to hidden input
                const hiddenPriceInput = document.createElement('input');
                hiddenPriceInput.type = 'hidden';
                hiddenPriceInput.name = 'Total Price';
                hiddenPriceInput.value = `$${totalAmountSpan.textContent}`;
                learningForm.appendChild(hiddenPriceInput);

                // Submit form
                const formData = new FormData(learningForm);
                fetch(learningForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                }).then(response => {
                    if (response.ok) {
                        showFormSuccess();
                    } else {
                        throw new Error('Submission failed');
                    }
                }).catch(error => {
                    console.error('Form submission error:', error);
                    showFormError('There was an issue submitting your request. Please try again.');
                    
                    // Reset button state
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
            });
        }

        function showFormError(message) {
            showFormMessage(message, 'error');
        }

        function showFormSuccess() {
            showFormMessage('Your learning request has been submitted successfully! We will get back to you shortly.', 'success');
        }

        function showFormMessage(message, type) {
            // Remove existing messages
            const existingMsg = document.querySelector('.form-message');
            if (existingMsg) existingMsg.remove();

            const msgDiv = document.createElement('div');
            msgDiv.className = `form-message ${type}`;
            msgDiv.style.cssText = `
                padding: 1rem 1.5rem;
                border-radius: 8px;
                margin-bottom: 1rem;
                font-weight: 500;
                text-align: center;
                animation: slideInDown 0.3s ease-out;
            `;

            if (type === 'error') {
                msgDiv.style.background = '#fee';
                msgDiv.style.color = '#c33';
                msgDiv.style.border = '1px solid #fcc';
            } else {
                msgDiv.style.background = '#efe';
                msgDiv.style.color = '#363';
                msgDiv.style.border = '1px solid #cfc';
            }

            msgDiv.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i> ${message}`;
            
            learningForm.insertBefore(msgDiv, learningForm.firstChild);

            // Auto-remove success messages
            if (type === 'success') {
                setTimeout(() => {
                    msgDiv.style.animation = 'slideOutUp 0.3s ease-in';
                    setTimeout(() => msgDiv.remove(), 300);
                }, 5000);
            }
        }

        // 10. Add CSS animations for new features
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            @keyframes slideInDown {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideOutUp {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-20px); opacity: 0; }
            }
            .searching {
                background: var(--color-primary-x-light) !important;
            }
            .form-control.error {
                border-color: var(--color-danger) !important;
                box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.1) !important;
            }
            .skill-info {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }
            .skill-tier {
                font-size: 0.85rem;
                color: var(--color-secondary);
            }
            .compare-mode .skill-card {
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .compare-mode .skill-card:hover {
                transform: scale(1.05);
                box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            }
            .compare-mode .skill-card.selected-for-compare {
                border: 3px solid var(--color-primary);
                background: var(--color-primary-x-light);
            }
            .compare-mode .skill-card.selected-for-compare::after {
                content: '✓';
                position: absolute;
                top: 10px;
                right: 10px;
                background: var(--color-primary);
                color: white;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
            }
            .comparison-panel {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: white;
                border-top: 3px solid var(--color-primary);
                box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
                transform: translateY(100%);
                transition: transform 0.3s ease;
                z-index: 1000;
                max-height: 60vh;
                overflow-y: auto;
            }
            .comparison-panel.show {
                transform: translateY(0);
            }
            .comparison-header {
                background: var(--color-primary);
                color: white;
                padding: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .comparison-content {
                padding: 1rem;
            }
            .comparison-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
            }
            .comparison-item {
                background: var(--color-primary-x-light);
                padding: 1rem;
                border-radius: 8px;
                border: 1px solid var(--color-primary-light);
            }
            .comparison-item h4 {
                color: var(--color-primary);
                margin-bottom: 0.5rem;
            }
            .comparison-item .price {
                font-size: 1.2rem;
                font-weight: bold;
                color: var(--color-dark);
            }
            .comparison-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
            }
            .comparison-actions button {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s ease;
            }
            .btn-compare {
                background: var(--color-primary);
                color: white;
            }
            .btn-compare:hover {
                background: var(--blue-accent);
                transform: translateY(-2px);
            }
            .btn-clear {
                background: var(--color-secondary);
                color: white;
            }
            .btn-clear:hover {
                background: #5a6268;
                transform: translateY(-2px);
            }
            .toggle-compare-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--color-primary);
                color: white;
                border: none;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                font-size: 1.5rem;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                z-index: 999;
            }
            .toggle-compare-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            }
            .toggle-compare-btn.active {
                background: var(--blue-accent);
            }
        `;
        document.head.appendChild(style);

        // 11. Skills Comparison Feature
        let compareMode = false;
        let skillsForComparison = [];
        let comparisonPanel = null;

        // Create comparison toggle button
        const compareToggleBtn = document.createElement('button');
        compareToggleBtn.className = 'toggle-compare-btn';
        compareToggleBtn.innerHTML = '<i class="fas fa-balance-scale"></i>';
        compareToggleBtn.title = 'Toggle Comparison Mode';
        document.body.appendChild(compareToggleBtn);

        // Create comparison panel
        function createComparisonPanel() {
            comparisonPanel = document.createElement('div');
            comparisonPanel.className = 'comparison-panel';
            comparisonPanel.innerHTML = `
                <div class="comparison-header">
                    <h3><i class="fas fa-balance-scale"></i> Skills Comparison</h3>
                    <button class="close-comparison" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div class="comparison-content">
                    <div class="comparison-grid" id="comparison-grid">
                        <p style="text-align: center; color: var(--color-secondary);">Select skills to compare (up to 3)</p>
                    </div>
                    <div class="comparison-actions">
                        <button class="btn-compare" onclick="addSelectedSkillsToForm()">Add Selected to Form</button>
                        <button class="btn-clear" onclick="clearComparison()">Clear All</button>
                    </div>
                </div>
            `;
            document.body.appendChild(comparisonPanel);

            // Add event listeners
            comparisonPanel.querySelector('.close-comparison').addEventListener('click', () => {
                comparisonPanel.classList.remove('show');
            });
        }

        // Toggle comparison mode
        compareToggleBtn.addEventListener('click', () => {
            compareMode = !compareMode;
            compareToggleBtn.classList.toggle('active');
            
            if (compareMode) {
                document.body.classList.add('compare-mode');
                if (!comparisonPanel) {
                    createComparisonPanel();
                }
                comparisonPanel.classList.add('show');
            } else {
                document.body.classList.remove('compare-mode');
                if (comparisonPanel) {
                    comparisonPanel.classList.remove('show');
                }
                // Clear comparison selections
                skillsForComparison = [];
                updateComparisonUI();
                skillCards.forEach(card => card.classList.remove('selected-for-compare'));
            }
        });

        // Handle skill card clicks in comparison mode
        skillCards.forEach(card => {
            card.addEventListener('click', () => {
                if (!compareMode) return;
                
                const skillName = card.querySelector('h3').textContent;
                const skillIndex = skillsForComparison.findIndex(s => s.name === skillName);
                
                if (skillIndex > -1) {
                    // Remove from comparison
                    skillsForComparison.splice(skillIndex, 1);
                    card.classList.remove('selected-for-compare');
                } else if (skillsForComparison.length < 3) {
                    // Add to comparison
                    const tier = card.querySelector('.pricing-tier:first-child .tier-name').textContent;
                    const price = parseInt(card.querySelector('.pricing-tier:first-child .tier-price').textContent.replace('₦', '').replace('$', ''));
                    skillsForComparison.push({ name: skillName, tier, price });
                    card.classList.add('selected-for-compare');
                } else {
                    showFormMessage('You can only compare up to 3 skills at a time.', 'error');
                    return;
                }
                
                updateComparisonUI();
            });
        });

        function updateComparisonUI() {
            if (!comparisonPanel) return;
            
            const grid = comparisonPanel.querySelector('#comparison-grid');
            if (skillsForComparison.length === 0) {
                grid.innerHTML = '<p style="text-align: center; color: var(--color-secondary);">Select skills to compare (up to 3)</p>';
                return;
            }
            
            grid.innerHTML = skillsForComparison.map(skill => `
                <div class="comparison-item">
                    <h4>${skill.name}</h4>
                    <p><strong>Tier:</strong> ${skill.tier}</p>
                    <p class="price">$${skill.price.toLocaleString()}</p>
                </div>
            `).join('');
        }

        // Add selected skills from comparison to form
        window.addSelectedSkillsToForm = function() {
            if (skillsForComparison.length === 0) {
                showFormMessage('No skills selected for comparison.', 'error');
                return;
            }
            
            skillsForComparison.forEach(skill => {
                if (!selectedSkills[skill.name]) {
                    addSkill(skill.name, skill.tier, skill.price);
                }
            });
            
            // Close comparison panel and exit compare mode
            compareMode = false;
            compareToggleBtn.classList.remove('active');
            document.body.classList.remove('compare-mode');
            comparisonPanel.classList.remove('show');
            
            // Clear comparison selections
            skillsForComparison = [];
            updateComparisonUI();
            skillCards.forEach(card => card.classList.remove('selected-for-compare'));
            
            // Scroll to form
            document.getElementById('learning-form-section').scrollIntoView({ behavior: 'smooth' });
            
            showFormMessage(`${skillsForComparison.length} skills added to your selection!`, 'success');
        };

        // Clear comparison
        window.clearComparison = function() {
            skillsForComparison = [];
            updateComparisonUI();
            skillCards.forEach(card => card.classList.remove('selected-for-compare'));
        };

        // 12. Save/Load User Preferences
        function saveUserPreferences() {
            const preferences = {
                selectedSkills: selectedSkills,
                lastFilter: currentFilter,
                lastSearch: currentSearchTerm,
                timestamp: Date.now()
            };
            localStorage.setItem('skillbank-preferences', JSON.stringify(preferences));
        }

        function loadUserPreferences() {
            const saved = localStorage.getItem('skillbank-preferences');
            if (saved) {
                try {
                    const preferences = JSON.parse(saved);
                    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                    
                    // Only load if preferences are less than 24 hours old
                    if (Date.now() - preferences.timestamp < oneDay) {
                        if (preferences.selectedSkills) {
                            selectedSkills = preferences.selectedSkills;
                            updateSelectedSkillsUI();
                            
                            // Update button states
                            Object.keys(selectedSkills).forEach(skillName => {
                                const skillCard = document.querySelector(`[data-skill="${skillName}"]`);
                                if (skillCard) {
                                    const btn = skillCard.querySelector('.select-skill-btn');
                                    btn.textContent = 'Selected ✓';
                                    btn.style.background = 'var(--green-accent)';
                                    btn.style.cursor = 'not-allowed';
                                }
                            });
                        }
                        
                        if (preferences.lastFilter) {
                            currentFilter = preferences.lastFilter;
                            const filterBtn = document.querySelector(`[data-filter="${currentFilter}"]`);
                            if (filterBtn) {
                                filterBtns.forEach(b => b.classList.remove('active'));
                                filterBtn.classList.add('active');
                            }
                        }
                        
                        if (preferences.lastSearch) {
                            currentSearchTerm = preferences.lastSearch;
                            searchInput.value = currentSearchTerm;
                        }
                        
                        // Apply saved filters
                        filterSkills(currentFilter, currentSearchTerm);
                        updateSkillCount();
                    }
                } catch (error) {
                    console.error('Error loading preferences:', error);
                }
            }
        }

        // Load preferences on page load
        loadUserPreferences();

        // Save preferences when changes occur
        const savePreferencesDebounced = debounce(saveUserPreferences, 1000);
        
        // Save preferences when skills are added/removed
        const originalAddSkill = addSkill;
        const originalRemoveSkill = removeSkill;
        
        addSkill = function(name, tier, price) {
            originalAddSkill(name, tier, price);
            savePreferencesDebounced();
        };
        
        removeSkill = function(name) {
            originalRemoveSkill(name);
            savePreferencesDebounced();
        };

        // 13. Enhanced Keyboard Navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close comparison panel
                if (comparisonPanel && comparisonPanel.classList.contains('show')) {
                    comparisonPanel.classList.remove('show');
                }
                
                // Close tier selection modal
                const modal = document.querySelector('.tier-selection-modal');
                if (modal) {
                    modal.remove();
                }
            }
            
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
            
            // Ctrl/Cmd + / to toggle comparison mode
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                compareToggleBtn.click();
            }
        });

        // 14. Utility Functions
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // 15. Performance Optimization
        function optimizeSkillCards() {
            // Use Intersection Observer for skill cards
            const skillObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, { threshold: 0.1 });

            skillCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.6s ease-out';
                skillObserver.observe(card);
            });
        }

        // Initialize performance optimizations
        optimizeSkillCards();

        // 16. Learning Paths Functionality
        initializeLearningPaths();

        function initializeLearningPaths() {
            const pathCards = document.querySelectorAll('.path-card');
            const pathFilterBtns = document.querySelectorAll('.path-filter-btn');
            
            // Initialize path filtering
            pathFilterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    pathFilterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const filter = btn.getAttribute('data-path-filter');
                    filterLearningPaths(filter);
                });
            });
            
            // Initialize path selection
            pathCards.forEach(card => {
                const selectBtn = card.querySelector('.path-select-btn');
                if (selectBtn) {
                    selectBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        selectLearningPath(card);
                    });
                }
            });
        }

        function filterLearningPaths(category) {
            const pathCards = document.querySelectorAll('.path-card');
            
            pathCards.forEach(card => {
                const cardCategory = card.getAttribute('data-path-category');
                
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.4s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        function selectLearningPath(card) {
            const skillTags = card.querySelectorAll('.skill-tag');
            const skills = Array.from(skillTags).map(tag => tag.textContent);
            const pathName = card.querySelector('h3').textContent;
            
            // Auto-select skills from the learning path
            let addedCount = 0;
            skills.forEach(skillName => {
                const skillCard = document.querySelector(`[data-skill="${skillName}"]`);
                if (skillCard && !selectedSkills[skillName]) {
                    // Simulate clicking the select button for the first tier
                    const selectBtn = skillCard.querySelector('.select-skill-btn');
                    if (selectBtn) {
                        selectBtn.click();
                        addedCount++;
                    }
                }
            });
            
            if (addedCount > 0) {
                // Show success message
                showFormMessage(`Added ${addedCount} skills from ${pathName} learning path!`, 'success');
                
                // Scroll to form
                setTimeout(() => {
                    document.getElementById('learning-form-section').scrollIntoView({ behavior: 'smooth' });
                }, 1000);
            } else {
                showFormMessage('All skills from this path are already selected!', 'info');
            }
        }

        // 17. Enhanced Search with Auto-suggestions
        function initializeSearchSuggestions() {
            const searchInput = document.getElementById('skill-search');
            let suggestionsContainer = null;

            searchInput.addEventListener('focus', () => {
                if (!suggestionsContainer) {
                    suggestionsContainer = document.createElement('div');
                    suggestionsContainer.className = 'search-suggestions';
                    suggestionsContainer.style.cssText = `
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background: white;
                        border: 1px solid #ddd;
                        border-top: none;
                        border-radius: 0 0 8px 8px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        z-index: 1000;
                        max-height: 200px;
                        overflow-y: auto;
                        display: none;
                    `;
                    searchInput.parentNode.appendChild(suggestionsContainer);
                }
            });

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                
                if (query.length < 2) {
                    if (suggestionsContainer) suggestionsContainer.style.display = 'none';
                    return;
                }

                const suggestions = Array.from(skillCards)
                    .map(card => card.querySelector('h3').textContent)
                    .filter(skill => skill.toLowerCase().includes(query))
                    .slice(0, 5);

                if (suggestions.length > 0) {
                    suggestionsContainer.innerHTML = suggestions.map(skill => 
                        `<div class="suggestion-item" style="padding: 0.75rem; cursor: pointer; border-bottom: 1px solid #eee; transition: background 0.2s;">${skill}</div>`
                    ).join('');
                    
                    suggestionsContainer.style.display = 'block';
                    
                    // Add click handlers
                    suggestionsContainer.querySelectorAll('.suggestion-item').forEach((item, index) => {
                        item.addEventListener('click', () => {
                            searchInput.value = suggestions[index];
                            suggestionsContainer.style.display = 'none';
                            filterSkills(currentFilter, suggestions[index], currentDifficulty, currentPriceRange);
                            updateSkillCount();
                        });
                        
                        item.addEventListener('mouseenter', () => {
                            item.style.background = '#f8f9fa';
                        });
                        
                        item.addEventListener('mouseleave', () => {
                            item.style.background = 'white';
                        });
                    });
                } else {
                    suggestionsContainer.style.display = 'none';
                }
            });

            // Hide suggestions when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && (!suggestionsContainer || !suggestionsContainer.contains(e.target))) {
                    if (suggestionsContainer) suggestionsContainer.style.display = 'none';
                }
            });
        }

        // Initialize search suggestions
        initializeSearchSuggestions();

        // 18. Skill Recommendations Functionality
        initializeSkillRecommendations();

        // 19. FAQ Functionality
        initializeFAQ();
    }

    function initializeFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }

    function initializeSkillRecommendations() {
        const recommendationBtns = document.querySelectorAll('.recommendation-btn');
        
        recommendationBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const skillName = btn.getAttribute('data-skill');
                const skillCard = document.querySelector(`[data-skill="${skillName}"]`);
                
                if (skillCard) {
                    // Scroll to the skill card
                    skillCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Highlight the skill card temporarily
                    skillCard.style.animation = 'pulse 0.6s ease-in-out';
                    setTimeout(() => {
                        skillCard.style.animation = '';
                    }, 600);
                    
                    // Show info message
                    showFormMessage(`Check out ${skillName} - it's a great choice!`, 'info');
                }
            });
        });
    }

    // (teach-a-skill removed) strip page-specific initializers
    const teachSkillPage = null;

    function initializeLearningOutcomes() {
        const addBtn = document.querySelector('.add-outcome-btn');
        const input = document.querySelector('.outcome-input');
        const list = document.getElementById('outcomes-list');

        if (addBtn && input && list) {
            addBtn.addEventListener('click', () => {
                const value = input.value.trim();
                if (value) {
                    addOutcome(value);
                    input.value = '';
                    updateSkillPreview();
                }
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addBtn.click();
                }
            });
        }
    }

    function addOutcome(outcome) {
        const list = document.getElementById('outcomes-list');
        const item = document.createElement('div');
        item.className = 'outcome-item';
        item.innerHTML = `
            ${outcome}
            <button type="button" class="remove-item-btn" onclick="this.parentElement.remove(); updateSkillPreview();">&times;</button>
        `;
        list.appendChild(item);
    }

    function initializeFeatures() {
        const addBtn = document.querySelector('.add-feature-btn');
        const input = document.querySelector('.feature-input');
        const list = document.getElementById('features-list');

        if (addBtn && input && list) {
            addBtn.addEventListener('click', () => {
                const value = input.value.trim();
                if (value) {
                    addFeature(value);
                    input.value = '';
                    updateSkillPreview();
                }
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addBtn.click();
                }
            });
        }
    }

    function addFeature(feature) {
        const list = document.getElementById('features-list');
        const item = document.createElement('div');
        item.className = 'feature-item';
        item.innerHTML = `
            ${feature}
            <button type="button" class="remove-item-btn" onclick="this.parentElement.remove(); updateSkillPreview();">&times;</button>
        `;
        list.appendChild(item);
    }

    function initializePricingTiers() {
        const addBtn = document.querySelector('.add-tier-btn');
        const nameInput = document.querySelector('.tier-name-input');
        const priceInput = document.querySelector('.tier-price-input');
        const list = document.getElementById('tiers-list');

        if (addBtn && nameInput && priceInput && list) {
            addBtn.addEventListener('click', () => {
                const name = nameInput.value.trim();
                const price = priceInput.value.trim();
                if (name && price) {
                    addPricingTier(name, price);
                    nameInput.value = '';
                    priceInput.value = '';
                    updateSkillPreview();
                }
            });
        }
    }

    function addPricingTier(name, price) {
        const list = document.getElementById('tiers-list');
        const item = document.createElement('div');
        item.className = 'tier-item';
        item.innerHTML = `
            <span><strong>${name}</strong> - $${price}</span>
            <button type="button" class="remove-item-btn" onclick="this.parentElement.remove(); updateSkillPreview();">&times;</button>
        `;
        list.appendChild(item);
    }

    function initializeCourseStructure() {
        const addBtn = document.querySelector('.add-module-btn');
        const moduleInput = document.querySelector('.module-input');
        const topicInput = document.querySelector('.topic-input');
        const list = document.getElementById('modules-list');

        if (addBtn && moduleInput && topicInput && list) {
            addBtn.addEventListener('click', () => {
                const module = moduleInput.value.trim();
                const topic = topicInput.value.trim();
                if (module && topic) {
                    addCourseModule(module, topic);
                    moduleInput.value = '';
                    topicInput.value = '';
                }
            });
        }
    }

    function addCourseModule(module, topic) {
        const list = document.getElementById('modules-list');
        const item = document.createElement('div');
        item.className = 'module-item';
        item.innerHTML = `
            <span><strong>${module}</strong>: ${topic}</span>
            <button type="button" class="remove-item-btn" onclick="this.parentElement.remove();">&times;</button>
        `;
        list.appendChild(item);
    }

    function initializeSkillPreview() {
        // Update preview when form fields change
        const skillNameInput = document.getElementById('primary-skill');
        const skillDescriptionInput = document.getElementById('skill-description');
        const expertiseLevelInput = document.getElementById('expertise-level');

        if (skillNameInput) {
            skillNameInput.addEventListener('change', updateSkillPreview);
        }
        if (skillDescriptionInput) {
            skillDescriptionInput.addEventListener('input', updateSkillPreview);
        }
        if (expertiseLevelInput) {
            expertiseLevelInput.addEventListener('change', updateSkillPreview);
        }
    }

    function updateSkillPreview() {
        const skillName = document.getElementById('primary-skill')?.value || 'Your Skill Name';
        const skillDescription = document.getElementById('skill-description')?.value || 'Your skill description will appear here...';
        const expertiseLevel = document.getElementById('expertise-level')?.value || 'Beginner';

        // Update preview elements
        const previewSkillName = document.getElementById('preview-skill-name');
        const previewDescription = document.getElementById('preview-description');
        const previewDifficulty = document.getElementById('preview-difficulty');

        if (previewSkillName) previewSkillName.textContent = skillName;
        if (previewDescription) previewDescription.textContent = skillDescription;
        if (previewDifficulty) {
            previewDifficulty.textContent = expertiseLevel;
            previewDifficulty.className = `preview-difficulty ${expertiseLevel.toLowerCase()}`;
        }

        // Update features preview
        updateFeaturesPreview();
        updatePricingPreview();
    }

    function updateFeaturesPreview() {
        const featuresList = document.getElementById('features-list');
        const previewFeatures = document.getElementById('preview-features');
        
        if (featuresList && previewFeatures) {
            const features = Array.from(featuresList.querySelectorAll('.feature-item')).map(item => 
                item.textContent.replace('×', '').trim()
            );
            
            if (features.length > 0) {
                previewFeatures.innerHTML = features.map(feature => 
                    `<div class="preview-feature">${feature}</div>`
                ).join('');
            } else {
                previewFeatures.innerHTML = '<div class="preview-feature">Feature 1</div><div class="preview-feature">Feature 2</div><div class="preview-feature">Feature 3</div>';
            }
        }
    }

    function updatePricingPreview() {
        const tiersList = document.getElementById('tiers-list');
        const previewPricing = document.getElementById('preview-pricing');
        
        if (tiersList && previewPricing) {
            const tiers = Array.from(tiersList.querySelectorAll('.tier-item')).map(item => {
                const text = item.textContent.replace('×', '').trim();
                const [name, price] = text.split(' - ');
                return { name, price };
            });
            
            if (tiers.length > 0) {
                previewPricing.innerHTML = tiers.map(tier => 
                    `<div class="preview-tier"><span class="tier-name">${tier.name}</span><span class="tier-price">${tier.price}</span></div>`
                ).join('');
            } else {
                previewPricing.innerHTML = '<div class="preview-tier"><span class="tier-name">Basic</span><span class="tier-price">$0</span></div>';
            }
        }
    }





    function initializeEnhancedFormInteractions() {
        // Add floating labels animation
        const formControls = document.querySelectorAll('.form-control');
        
        formControls.forEach(control => {
            control.addEventListener('focus', () => {
                control.parentElement.classList.add('focused');
            });
            
            control.addEventListener('blur', () => {
                if (!control.value) {
                    control.parentElement.classList.remove('focused');
                }
            });
            
            // Add character counter for textareas
            if (control.tagName === 'TEXTAREA') {
                const counter = document.createElement('div');
                counter.className = 'char-counter';
                counter.style.cssText = `
                    position: absolute;
                    bottom: -20px;
                    right: 0;
                    font-size: 0.8rem;
                    color: var(--color-secondary);
                `;
                control.parentElement.style.position = 'relative';
                control.parentElement.appendChild(counter);
                
                const updateCounter = () => {
                    const remaining = control.maxLength - control.value.length;
                    counter.textContent = `${remaining} characters remaining`;
                    counter.style.color = remaining < 20 ? '#e74c3c' : 'var(--color-secondary)';
                };
                
                control.addEventListener('input', updateCounter);
                updateCounter();
            }
        });

        // Add form section animations
        const formSections = document.querySelectorAll('.form-section');
        formSections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                section.style.transition = 'all 0.6s ease';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * 200);
        });

        // Add interactive stat items
        const statItems = document.querySelectorAll('.stat-item');
        statItems.forEach(item => {
            item.addEventListener('click', () => {
                // Add click animation
                item.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    item.style.transform = '';
                }, 150);
                
                // Show tooltip or additional info
                showStatTooltip(item);
            });
        });
    }

    function initializeEnhancedTeachSkillFeatures() {
        // Animate hero stats on scroll
        animateHeroStats();
        
        // Initialize expertise card interactions
        initializeExpertiseCards();
        
        // Initialize enhanced form validation
        initializeEnhancedFormValidation();
        
        // Initialize smooth scrolling
        initializeSmoothScrolling();
    }

    function animateHeroStats() {
        const statNumbers = document.querySelectorAll('.teach-hero .stat-number[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const finalValue = parseInt(target.getAttribute('data-count'));
                    const isPercentage = target.textContent.includes('%');
                    
                    animateNumber(target, 0, finalValue, 2000, isPercentage);
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(stat => observer.observe(stat));
    }

    function animateNumber(element, start, end, duration, isPercentage) {
        const startTime = performance.now();
        const suffix = isPercentage ? '%' : '';
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * easeOutQuart(progress));
            element.textContent = current.toLocaleString() + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        
        requestAnimationFrame(updateNumber);
    }

    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    function initializeExpertiseCards() {
        const expertiseCards = document.querySelectorAll('.expertise-card');
        
        expertiseCards.forEach(card => {
            const learnMoreBtn = card.querySelector('.learn-more-btn');
            
            if (learnMoreBtn) {
                learnMoreBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Toggle expanded state
                    const isExpanded = card.classList.contains('expanded');
                    
                    // Close all other cards
                    expertiseCards.forEach(otherCard => {
                        otherCard.classList.remove('expanded');
                    });
                    
                    // Toggle current card
                    if (!isExpanded) {
                        card.classList.add('expanded');
                        learnMoreBtn.textContent = 'Show Less';
                    } else {
                        card.classList.remove('expanded');
                        learnMoreBtn.textContent = 'Learn More';
                    }
                });
            }
            
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    function initializeEnhancedFormValidation() {
        const form = document.getElementById('tutor-application-form');
        const inputs = form.querySelectorAll('.form-control');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', () => {
                validateField(input);
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    validateField(input);
                }
            });
            
            // Add success state on valid input
            input.addEventListener('input', () => {
                if (input.value && !input.classList.contains('error')) {
                    input.classList.add('success');
                } else {
                    input.classList.remove('success');
                }
            });
        });
    }

    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let message = '';
        
        // Remove existing validation message
        const existingMessage = field.parentElement.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Validation rules
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'This field is required';
        } else if (fieldName === 'tutor-email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        } else if (fieldName === 'tutor-phone' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                isValid = false;
                message = 'Please enter a valid phone number';
            }
        } else if (fieldName === 'hourly-rate' && value) {
            const rate = parseInt(value);
            if (rate < 1000) {
                isValid = false;
                message = 'Minimum hourly rate is $1,000';
            }
        }
        
        // Apply validation state
        field.classList.remove('error', 'success');
        
        if (!isValid) {
            field.classList.add('error');
            showValidationMessage(field, message);
        } else if (value) {
            field.classList.add('success');
        }
    }

    function showValidationMessage(field, message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'validation-message';
        messageElement.textContent = message;
        
        field.parentElement.appendChild(messageElement);
        
        // Show message with animation
        setTimeout(() => {
            messageElement.classList.add('show');
        }, 10);
    }

    function initializeSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 100;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    function showStatTooltip(item) {
        const tooltip = document.createElement('div');
        tooltip.className = 'stat-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
        `;
        
        const statNumber = item.querySelector('.stat-number').textContent;
        const statLabel = item.querySelector('.stat-label').textContent;
        
        if (statLabel.includes('Active Professionals')) {
            tooltip.textContent = `Join ${statNumber} educators already making a difference!`;
        } else if (statLabel.includes('Online Courses')) {
            tooltip.textContent = `Access ${statNumber} courses and learning materials!`;
        } else if (statLabel.includes('Success Rate')) {
            tooltip.textContent = `${statNumber} of our tutors achieve their teaching goals!`;
        }
        
        item.appendChild(tooltip);
        
        // Animate in
        setTimeout(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(10px)';
            setTimeout(() => tooltip.remove(), 300);
        }, 3000);
    }





    

    // --- Tutors grid wiring (moved from skills.html) --- //
    (function() {
        const NGN = new Intl.NumberFormat('en-NG');
        const $ = (sel, el=document) => el.querySelector(sel);
        const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
        let selectedTutorId = null;
        async function loadTutors() {
            const grid = $('#tutors-grid');
            if (!grid) return;
            if ($$('#tutors-grid .tutor-card').length > 0) {
                wireStaticConnect();
                return;
            }
            try {
                const res = await fetch('file.json', { cache: 'no-store' });
                if (!res.ok) throw new Error('Network error');
                const data = await res.json();
                const tutorsRaw = normalizeTutors(data);
                const tutorsAvailable = tutorsRaw.filter(t => t.name && t.skill && (t.status || '').toLowerCase() !== 'open');
                const listings = groupBySkillPickCheapest(tutorsAvailable);
                buildFilters(listings);
                renderTutors(listings.slice(0, 9));
                wireInteractions(listings);
                updateHeroStats(listings);
            } catch (e) {
                const hint = (location.protocol === 'file:')
                    ? '<br/><small>Tip: open this site via a local server (for example, using VS Code Live Server or any simple static server) so file.json can be fetched.</small>'
                    : '';
                if ($('#tutors-grid')) $('#tutors-grid').innerHTML = '<div class="tutors-empty">Unable to load tutors at this time.' + hint + '</div>';
                console.error('Failed to load tutors:', e);
            }
        }
        function wireStaticConnect() {
            const grid = document.getElementById('tutors-grid');
            if (!grid) return;
            const connect = (card) => {
                const name = card.querySelector('h3')?.textContent.trim() || '';
                const skill = card.querySelector('.tutor-skill')?.textContent.trim() || '';
                onSelectStatic({ name, skill }, card);
            };
            $$('.btn-connect', grid).forEach(btn => {
                btn.addEventListener('click', (e) => { e.stopPropagation(); const card = btn.closest('.tutor-card'); if (card) connect(card); });
            });
            $$('.tutor-card', grid).forEach(card => {
                card.addEventListener('click', (e) => { if (e.target.closest('.btn-connect')) return; connect(card); });
            });
        }
        function updateSelectedTutorDisplay(data) {
            const display = document.getElementById('selected-skills-display');
            if (!display) return;
            // hide empty message
            const empty = display.querySelector('.no-skills-message');
            if (empty) empty.style.display = 'none';
            display.innerHTML = '';
            const item = document.createElement('div');
            item.className = 'selected-skill-item';
            const name = data.name || '';
            const skill = data.skill || '';
            item.innerHTML = `
                <div class="skill-info">
                    <span class="skill-name"><strong>${escapeHtml(skill)}</strong></span>
                    <span class="skill-tier">${escapeHtml(name)}</span>
                </div>
            `;
            display.appendChild(item);
        }
        function collectSelectedTutorFromGrid() {
            const grid = document.getElementById('tutors-grid');
            const selected = grid?.querySelector('.tutor-card.selected');
            if (!selected) return null;
            const name = selected.querySelector('h3')?.textContent.trim() || '';
            const skill = selected.querySelector('.tutor-skill')?.textContent.trim() || '';
            return { name, skill };
        }
        // Ensure selected tutor fields are present before submitting the form
        (function attachLearningFormSubmitHandler(){
            const form = document.getElementById('learning-form');
            const homeForm = document.getElementById('home-exchange-form');
            const bind = (f) => f && f.addEventListener('submit', (e) => {
                const ensureHidden = (name, value) => {
                    let input = e.target.querySelector(`input[name="${name}"]`);
                    if (!input) { input = document.createElement('input'); input.type = 'hidden'; input.name = name; e.target.appendChild(input); }
                    input.value = value;
                };
                const selectedName = e.target.querySelector('input[name="Selected Tutor Name"]')?.value?.trim();
                const desiredSkill = e.target.querySelector('#desired-skill, #home-desired-skill')?.value?.trim();
                if (!selectedName && !desiredSkill) {
                    const selected = collectSelectedTutorFromGrid();
                    if (selected) {
                        ensureHidden('Selected Tutor Name', selected.name || '');
                        ensureHidden('Selected Tutor Skill', selected.skill || '');
                    } else {
                        e.preventDefault();
                        alert('Please select a skill or enter a Desired Skill to Learn.');
                    }
                }
                // Validate offered skill vs paid option
                const offered = e.target.querySelector('#offered-skill, #home-offered-skill');
                const paidOpt = e.target.querySelector('#paid-option, #home-paid-option');
                const budgetInput = e.target.querySelector('#budget-amount, #home-budget');
                const paying = paidOpt && paidOpt.checked;
                if (!paying) {
                    if (offered && !offered.value.trim()) {
                        e.preventDefault();
                        alert('Enter the skill you can offer, or choose the pay-to-learn option.');
                        return;
                    }
                } else {
                    if (budgetInput && !budgetInput.value.trim()) {
                        e.preventDefault();
                        alert('Please provide your monthly budget.');
                        return;
                    }
                    ensureHidden('Payment Preference', 'Paid');
                }
                if (!paying) ensureHidden('Payment Preference', 'Exchange');

                // Ensure consistent field names where homepage uses different ids
                const map = [
                    ['learner-name', '#home-name, #learner-name'],
                    ['learner-email', '#home-email, #learner-email'],
                    ['learner-phone', '#home-phone, #learner-phone'],
                    ['learner-location', '#home-location, #learner-location'],
                    ['desired-skill', '#home-desired-skill, #desired-skill'],
                    ['offered-skill', '#home-offered-skill, #offered-skill'],
                    ['learning-intensity', '#home-intensity, #learning-intensity'],
                    ['learning-duration', '#home-duration, #learning-duration'],
                    ['learning-goals', '#home-goals, #learning-goals'],
                    ['budget-amount', '#home-budget, #budget-amount'],
                    ['teach-preference', '#home-teach-option:checked, #teach-option:checked'],
                    ['teach-skill', '#home-teach-skill, #teach-skill'],
                    ['teach-experience', '#home-teach-experience, #teach-experience'],
                    ['teach-availability', '#home-teach-availability, #teach-availability'],
                    ['teach-mode', '#home-teach-mode, #teach-mode'],
                    ['teach-bio', '#home-teach-bio, #teach-bio']
                ];
                map.forEach(([name, selector]) => {
                    let value = '';
                    if (selector.includes(':checked')) {
                        const el = e.target.querySelector(selector);
                        if (el) value = 'Teach';
                    } else {
                        const el = e.target.querySelector(selector);
                        if (el) value = el.value;
                    }
                    if (value && !e.target.querySelector(`input[name="${name}"]`)) {
                        ensureHidden(name, value);
                    }
                });
            });
            bind(form);
            bind(homeForm);
        })();

        // Toggle budget visibility when pay option is selected (both forms)
        function bindPaidToggle(checkboxId, groupId, offeredId) {
            const cb = document.getElementById(checkboxId);
            const grp = document.getElementById(groupId);
            const offered = document.getElementById(offeredId);
            if (!cb || !grp) return;
            const update = () => {
                const show = cb.checked;
                grp.style.display = show ? 'block' : 'none';
                if (offered) offered.required = !show;
            };
            cb.addEventListener('change', update);
            update();
        }
        bindPaidToggle('paid-option', 'budget-group', 'offered-skill');
        bindPaidToggle('home-paid-option', 'home-budget-group', 'home-offered-skill');

        // Toggle teach fields when teach option selected (both forms)
        function bindTeachToggle(checkboxId, fieldsId) {
            const cb = document.getElementById(checkboxId);
            const fields = document.getElementById(fieldsId);
            if (!cb || !fields) return;
            const update = () => {
                const show = cb.checked;
                fields.style.display = show ? 'block' : 'none';
                const requiredIds = ['teach-skill', 'home-teach-skill'];
                requiredIds.forEach(id => {
                    const el = document.getElementById(id);
                    if (el && fields.contains(el)) el.required = show;
                });
            };
            cb.addEventListener('change', update);
            update();
        }
        bindTeachToggle('teach-option', 'teach-fields');
        bindTeachToggle('home-teach-option', 'home-teach-fields');
        function onSelectStatic(tutor, cardEl) {
            const form = document.getElementById('learning-form');
            if (!form) return;
            const ensure = (name, value) => {
                let input = form.querySelector(`input[name="${name}"]`);
                if (!input) { input = document.createElement('input'); input.type = 'hidden'; input.name = name; form.appendChild(input); }
                input.value = value;
            };
            ensure('Selected Tutor Name', tutor.name || '');
            ensure('Selected Tutor Skill', tutor.skill || '');
            // Mirror key selections into home form if present
            const homeForm = document.getElementById('home-exchange-form');
            if (homeForm) {
                const copy = (n, v) => { let i = homeForm.querySelector(`input[name="${n}"]`); if (!i) { i = document.createElement('input'); i.type='hidden'; i.name=n; homeForm.appendChild(i); } i.value = v; };
                copy('Selected Tutor Name', tutor.name || '');
                copy('Selected Tutor Skill', tutor.skill || '');
            }
            const grid = document.getElementById('tutors-grid');
            if (grid) {
                $$('.tutor-card', grid).forEach(c => c.classList.remove('selected'));
                if (cardEl) cardEl.classList.add('selected');
                // update button text states
                $$('.btn-connect', grid).forEach(b => b.textContent = 'Connect');
                const btn = cardEl?.querySelector('.btn-connect');
                if (btn) btn.textContent = 'Selected';
            }
            // reflect in Selected Tutor & Skill UI
            updateSelectedTutorDisplay({ name: tutor.name, skill: tutor.skill });
            document.getElementById('learning-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        function normalizeTutors(rows) {
            return rows.map((r, idx) => {
                const primary = (r['primary-skill'] || '').trim();
                const other = (r['other-skill-specify'] || '').trim();
                const skill = primary && primary !== 'Other' ? primary : (other || 'General');
                const availability = (r['availability'] || '').trim();
                const exp = (r['years-experience'] || '').trim();
                const rate = Number(r['monthly-rate']) || 0;
                const name = (r['tutor-name'] || 'Tutor').trim();
                const email = (r['tutor-email'] || '').trim();
                const phone = (r['tutor-phone'] || '').trim();
                const location = (r['tutor-location'] || '').trim();
                const desc = (r['skill-description'] || r['motivation'] || '').trim();
                const status = (r['_status'] || '').trim();
                return { id: idx + 1, name, skill, availability, experience: exp, rate, email, phone, location, desc, status };
            });
        }
        function groupBySkillPickCheapest(tutors) {
            const skillToTutor = new Map();
            tutors.forEach(t => {
                const key = t.skill;
                const current = skillToTutor.get(key);
                if (!current || t.rate < current.rate) {
                    skillToTutor.set(key, t);
                }
            });
            return Array.from(skillToTutor.values()).sort((a,b) => a.skill.localeCompare(b.skill));
        }
        function buildFilters(tutors) {
            const skillSel = $('#tutor-skill-filter');
            if (!skillSel) return;
            const skills = Array.from(new Set(tutors.map(t => t.skill))).sort();
            skills.forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s; skillSel.appendChild(o); });
        }
        function renderTutors(tutors) {
            const grid = $('#tutors-grid');
            if (!grid) return;
            if (!tutors.length) { grid.innerHTML = '<div class="tutors-empty">No tutors found.</div>'; return; }
            grid.innerHTML = tutors.map(t => tutorCardHTML(t, String(t.id) === String(selectedTutorId))).join('');
            $$('.tutor-card', grid).forEach(card => {
                card.addEventListener('click', () => onSelectTutor(card.getAttribute('data-id'), tutors, { scroll: false }));
            });
            $$('.tutor-card .btn-request', grid).forEach(btn => {
                btn.addEventListener('click', (e) => { e.stopPropagation(); onSelectTutor(btn.getAttribute('data-id'), tutors, { scroll: true }); });
            });
        }
        function tutorCardHTML(t, isSelected) {
            const initials = t.name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase();
            return `
            <div class="tutor-card${isSelected ? ' selected' : ''}" data-id="${t.id}" data-skill="${escapeAttr(t.skill)}" data-experience="${escapeAttr(t.experience)}" data-rate="${t.rate}" data-name="${escapeAttr(t.name)}">
                <div class="selected-badge"><i class="fas fa-check"></i></div>
                <div class="tutor-header">
                    <div class="avatar">${initials}</div>
                    <div>
                        <div class="tutor-skill"><strong>${escapeHtml(t.skill)}</strong></div>
                        <h3 class=\"tutor-name\">${escapeHtml(t.name)}</h3>
                    </div>
                </div>
                <div class="tutor-meta">
                    <span><i class="fas fa-briefcase"></i>${escapeHtml(t.experience || 'Experience N/A')}</span>
                </div>
                <div class="tutor-footer">
                    <div class="actions">
                        <button class="btn btn-secondary btn-request" data-id="${t.id}">${isSelected ? 'Selected' : 'Select'}</button>
                    </div>
                </div>
            </div>`;
        }
        function wireInteractions(allTutors) {
            const search = $('#tutor-search');
            const skillSel = $('#tutor-skill-filter');
            let query = '', skill = 'all';
            const apply = () => {
                let list = allTutors.slice();
                if (skill !== 'all') list = list.filter(t => t.skill === skill);
                if (query) {
                    const q = query.toLowerCase();
                    list = list.filter(t => t.name.toLowerCase().includes(q) || (t.skill || '').toLowerCase().includes(q) || (t.location || '').toLowerCase().includes(q));
                }
                renderTutors(list.slice(0, 9));
            };
            const debounceLocal = (fn, wait=250) => { let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); }; };
            if (search) search.addEventListener('input', debounceLocal(e => { query = e.target.value.trim(); apply(); }, 300));
            if (skillSel) skillSel.addEventListener('change', () => { skill = skillSel.value; apply(); });
        }
        function updateHeroStats(tutors) {
            const statItems = document.querySelectorAll('.teach-hero .stat-item');
            if (!statItems || statItems.length === 0) return;
            const uniqueSkills = new Set(tutors.map(t => t.skill)).size;
            const tutorsCount = tutors.length;
            const first = statItems[0];
            const second = statItems[1];
            if (first) {
                const num = first.querySelector('.stat-number');
                const lbl = first.querySelector('.stat-label');
                if (num) num.textContent = uniqueSkills.toLocaleString();
                if (lbl) lbl.textContent = 'Available Skills';
            }
            if (second) {
                const num = second.querySelector('.stat-number');
                const lbl = second.querySelector('.stat-label');
                if (num) num.textContent = tutorsCount.toLocaleString();
                if (lbl) lbl.textContent = 'Available Skills';
            }
        }
        function onSelectTutor(id, tutors, opts={ scroll: false }) {
            const tutor = tutors.find(t => String(t.id) === String(id));
            if (!tutor) return;
            const form = document.getElementById('learning-form');
            if (!form) { alert('Form not found.'); return; }
            const ensure = (name, value) => {
                let input = form.querySelector(`input[name="${name}"]`);
                if (!input) { input = document.createElement('input'); input.type = 'hidden'; input.name = name; form.appendChild(input); }
                input.value = value;
            };
            selectedTutorId = tutor.id;
            ensure('Selected Tutor Name', tutor.name);
            ensure('Selected Tutor Skill', tutor.skill);
            ensure('Requested Tutor Name', tutor.name);
            ensure('Requested Tutor Skill', tutor.skill);
            ensure('Requested Tutor Availability', tutor.availability || '');
            ensure('Requested Tutor Location', tutor.location || '');
            ensure('Requested Tutor Email', tutor.email || '');
            ensure('Requested Tutor Phone', tutor.phone || '');
            const goals = document.getElementById('learning-goals');
            if (goals && !goals.value) {
                goals.value = `I would like to learn ${tutor.skill} with ${tutor.name}.`;
            }
            const grid = document.getElementById('tutors-grid');
            if (grid) {
                $$('.tutor-card', grid).forEach(card => card.classList.remove('selected'));
                const selectedCard = grid.querySelector(`.tutor-card[data-id="${tutor.id}"]`);
                if (selectedCard) selectedCard.classList.add('selected');
                const btn = selectedCard?.querySelector('.btn-request');
                if (btn) btn.textContent = 'Selected';
            }
            // reflect in Selected Tutor & Skill UI
            updateSelectedTutorDisplay({ name: tutor.name, skill: tutor.skill });
            if (opts.scroll) document.getElementById('learning-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        function escapeHtml(str) { return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[s])); }
        function escapeAttr(str) { return escapeHtml(str).replace(/"/g, '&quot;'); }
        loadTutors();
    })();

});

