document.addEventListener('DOMContentLoaded', () => {

    // ========================================
    // SPAM PREVENTION (12-Hour Block)
    // ========================================
    const lastSubmitTime = localStorage.getItem('marvel_feedback_timestamp');
    if (lastSubmitTime) {
        const timePassed = Date.now() - parseInt(lastSubmitTime);
        const twelveHoursInMs = 12 * 60 * 60 * 1000;
        
        if (timePassed < twelveHoursInMs) {
            // Already submitted recently, show Arc Reactor immediately
            document.querySelector('.form-wrapper').classList.add('hidden');
            document.querySelector('.lang-selector').classList.add('hidden');
            document.getElementById('thank-you-screen').classList.remove('hidden');
            return; // Stop initializing the rest of the form
        }
    }

    // ========================================
    // TRANSLATIONS
    // ========================================
    const translations = {
        en: {
            subtitle: "Your feedback makes us stronger. It's completely anonymous.",
            sec_workout: "How was your workout today?",
            sec_equipment: "Equipment & Machines",
            sec_cleanliness: "Cleanliness & Hygiene",
            sec_trainers: "Trainers & Staff",
            sec_atmosphere: "Music & Atmosphere",
            ph_workout: "Any additional comments...",
            ph_equipment: "Tell us about the equipment...",
            ph_cleanliness: "How clean was the gym...",
            ph_trainers: "How were the trainers...",
            ph_atmosphere: "How was the vibe...",
            submit: "ASSEMBLE FEEDBACK",
            thanks_title: "Thank You, Hero!",
            thanks_msg: "Your feedback has been securely transmitted to HQ.",
            mood_1: "Very Bad 😞",
            mood_2: "Not Great 😕",
            mood_3: "It's Okay 😐",
            mood_4: "Good! 😊",
            mood_5: "Excellent! 🤩",
            reactions: [
                "Hmm... interesting! 🤔",
                "Tell me more! 👀",
                "Oh really?! 😮",
                "I'm watching you... 👁️",
                "Spicy feedback! 🌶️",
                "Keep going... 📝",
                "Noted! 💪",
                "Wow, that's bold! 😏",
                "This is gold! ✨",
                "Don't stop now! 🔥"
            ],
            idle_reaction: "Still writing? 🤨"
        },
        ml: {
            subtitle: "നിങ്ങളുടെ ഫീഡ്‌ബാക്ക് ഞങ്ങളെ ശക്തരാക്കുന്നു. ഇത് പൂർണ്ണമായും അജ്ഞാതമാണ്.",
            sec_workout: "ഇന്നത്തെ വ്യായാമം എങ്ങനെയുണ്ടായിരുന്നു?",
            sec_equipment: "ഉപകരണങ്ങളും യന്ത്രങ്ങളും",
            sec_cleanliness: "വൃത്തിയും ശുചിത്വവും",
            sec_trainers: "ട്രെയിനർമാരും ജീവനക്കാരും",
            sec_atmosphere: "സംഗീതവും അന്തരീക്ഷവും",
            ph_workout: "കൂടുതൽ അഭിപ്രായങ്ങൾ...",
            ph_equipment: "ഉപകരണങ്ങളെ കുറിച്ച് പറയൂ...",
            ph_cleanliness: "ജിം എത്ര വൃത്തിയായിരുന്നു...",
            ph_trainers: "ട്രെയിനർമാർ എങ്ങനെയുണ്ടായിരുന്നു...",
            ph_atmosphere: "അന്തരീക്ഷം എങ്ങനെയുണ്ടായിരുന്നു...",
            submit: "ഫീഡ്‌ബാക്ക് സമർപ്പിക്കുക",
            thanks_title: "നന്ദി, ഹീറോ!",
            thanks_msg: "നിങ്ങളുടെ ഫീഡ്‌ബാക്ക് സുരക്ഷിതമായി HQ-യിലേക്ക് അയച്ചു.",
            mood_1: "വളരെ മോശം 😞",
            mood_2: "അത്ര നന്നായില്ല 😕",
            mood_3: "ശരിയാണ് 😐",
            mood_4: "നല്ലത്! 😊",
            mood_5: "അതിഗംഭീരം! 🤩",
            reactions: [
                "ഹ്‌മ്... രസകരം! 🤔",
                "കൂടുതൽ പറയൂ! 👀",
                "ശരിക്കും?! 😮",
                "ഞാൻ നോക്കുന്നുണ്ട്... 👁️",
                "എരിവുള്ള ഫീഡ്‌ബാക്ക്! 🌶️",
                "തുടരൂ... 📝",
                "കുറിച്ചു! 💪",
                "ധൈര്യമുള്ള അഭിപ്രായം! 😏",
                "ഇത് സ്വർണ്ണം! ✨",
                "നിർത്തരുത്! 🔥"
            ],
            idle_reaction: "ഇനിയും എഴുതുകയാണോ? 🤨"
        }
    };

    let currentLang = 'en';

    // ========================================
    // LANGUAGE SWITCHING
    // ========================================
    const langBtns = document.querySelectorAll('.lang-btn');

    function applyLanguage(lang) {
        currentLang = lang;
        const t = translations[lang];

        // Update all text elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });

        // Update all placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (t[key]) el.placeholder = t[key];
        });

        // Update mood labels for already rated sections
        document.querySelectorAll('.rating-stars').forEach(starGroup => {
            const selected = parseInt(starGroup.getAttribute('data-selected') || '0');
            const category = starGroup.getAttribute('data-rating');
            const moodLabel = document.querySelector(`.mood-label[data-rating-for="${category}"]`);
            if (selected > 0 && moodLabel) {
                moodLabel.textContent = t[`mood_${selected}`];
            }
        });

        // Update active button
        langBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });
    }

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            applyLanguage(btn.getAttribute('data-lang'));
        });
    });

    // ========================================
    // ACCORDION SECTIONS
    // ========================================
    const sections = document.querySelectorAll('.feedback-section');
    const sectionHeaders = document.querySelectorAll('.section-header');

    sectionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const targetIdx = header.getAttribute('data-target');
            const targetSection = document.querySelector(`.feedback-section[data-section="${targetIdx}"]`);

            if (targetSection.classList.contains('active')) {
                targetSection.classList.remove('active');
            } else {
                sections.forEach(s => s.classList.remove('active'));
                targetSection.classList.add('active');
                setTimeout(() => {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        });
    });

    // ========================================
    // STAR RATING + MOOD SYSTEM
    // ========================================
    const moodEmojis = {
        0: '🤔',
        1: '😢',
        2: '😕',
        3: '😐',
        4: '😊',
        5: '🤩'
    };

    document.querySelectorAll('.rating-stars').forEach(starGroup => {
        const starsInGroup = starGroup.querySelectorAll('.star');
        const category = starGroup.getAttribute('data-rating');
        const section = starGroup.closest('.feedback-section');
        const moodLabel = document.querySelector(`.mood-label[data-rating-for="${category}"]`);

        starsInGroup.forEach(star => {
            star.addEventListener('click', () => {
                const val = parseInt(star.getAttribute('data-value'));
                starGroup.setAttribute('data-selected', val);

                // Update active stars
                starsInGroup.forEach(s => {
                    if (parseInt(s.getAttribute('data-value')) <= val) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });

                // Update mood label
                const t = translations[currentLang];
                if (moodLabel) {
                    moodLabel.textContent = t[`mood_${val}`];
                    moodLabel.style.color = val >= 4 ? '#4caf50' : val >= 3 ? '#f0c040' : '#ed1d24';
                }

                // Update intruder mood in this section
                const intruderBody = section.querySelector('.intruder-body');
                const speechText = section.querySelector('.speech-text');
                if (intruderBody) {
                    // Remove all mood classes
                    intruderBody.classList.remove('mood-1', 'mood-2', 'mood-3', 'mood-4', 'mood-5');
                    intruderBody.classList.add(`mood-${val}`);
                }
                if (speechText) {
                    speechText.textContent = moodEmojis[val];
                }
            });
        });
    });

    // ========================================
    // TEXTAREA + INTRUDER ANIMATION
    // ========================================
    document.querySelectorAll('.feedback-textarea').forEach(textarea => {
        const wrapper = textarea.closest('.textarea-wrapper');
        const animZone = wrapper.querySelector('.marvel-anim-zone');
        const intruderBody = animZone ? animZone.querySelector('.intruder-body') : null;
        const speechBubble = animZone ? animZone.querySelector('.speech-bubble') : null;
        const speechText = animZone ? animZone.querySelector('.speech-text') : null;

        let lastReactionIndex = -1;
        let reactionTimer = null;

        // FOCUS: Show intruder
        textarea.addEventListener('focus', () => {
            if (animZone) animZone.classList.add('peek');
        });

        // BLUR: Always hide intruder immediately
        textarea.addEventListener('blur', () => {
            if (animZone) {
                animZone.classList.remove('peek');
                if (intruderBody) {
                    intruderBody.style.transform = '';
                    intruderBody.style.bottom = '';
                    intruderBody.style.opacity = '';
                }
            }
            clearTimeout(reactionTimer);
        });

        // INPUT: Track typing
        textarea.addEventListener('input', () => {
            if (!intruderBody) return;
            const text = textarea.value;
            const charsOnCurrentLine = text.split('\n').pop().length;

            // Face follows typing
            let moveX = (charsOnCurrentLine * 5) - 50;
            moveX = Math.max(-50, Math.min(50, moveX));
            const rotation = Math.sin(text.length * 0.3) * 6;

            intruderBody.style.transform = `translateX(calc(-50% + ${moveX}px)) scale(1) rotate(${rotation}deg)`;
            intruderBody.style.bottom = '10px';
            intruderBody.style.opacity = '1';

            // Speech bubble reactions every ~12 chars
            const t = translations[currentLang];
            if (text.length % 12 === 0 && text.length > 0 && speechText) {
                let idx;
                do { idx = Math.floor(Math.random() * t.reactions.length); }
                while (idx === lastReactionIndex);
                lastReactionIndex = idx;
                speechBubble.style.transform = 'scale(0.7)';
                setTimeout(() => {
                    speechText.textContent = t.reactions[idx];
                    speechBubble.style.transform = 'scale(1)';
                }, 150);
            }

            // Idle reaction after 2.5s
            clearTimeout(reactionTimer);
            reactionTimer = setTimeout(() => {
                if (speechText) speechText.textContent = t.idle_reaction;
            }, 2500);
        });
    });

    // ========================================
    // FORM SUBMISSION (API Integration)
    // ========================================
    const form = document.getElementById('feedback-form');
    const successMsg = document.getElementById('success-message');

    // Your Supabase credentials
    const API_URL = 'https://pthqfnqgjwzzinjndbet.supabase.co/rest/v1/feedback';
    const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHFmbnFnand6emluam5kYmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MTMyNjMsImV4cCI6MjA5Njk4OTI2M30.Y1EcUuLKetpcJboIV1mPYrCI1SaHMkKl9SxziWaxRgk';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Gather the data into a structured JSON object
        const payload = {
            workout_rating: parseInt(document.querySelector('.rating-stars[data-rating="workout"]').getAttribute('data-selected')) || null,
            workout_comment: document.querySelector('textarea[placeholder*="additional comments"]')?.value || document.querySelector('textarea[placeholder*="കൂടുതൽ അഭിപ്രായങ്ങൾ"]')?.value || '',
            equipment_rating: parseInt(document.querySelector('.rating-stars[data-rating="equipment"]').getAttribute('data-selected')) || null,
            equipment_comment: document.querySelector('textarea[placeholder*="equipment"]')?.value || document.querySelector('textarea[placeholder*="ഉപകരണങ്ങളെ"]')?.value || '',
            cleanliness_rating: parseInt(document.querySelector('.rating-stars[data-rating="cleanliness"]').getAttribute('data-selected')) || null,
            cleanliness_comment: document.querySelector('textarea[placeholder*="clean"]')?.value || document.querySelector('textarea[placeholder*="വൃത്തിയായിരുന്നു"]')?.value || '',
            trainers_rating: parseInt(document.querySelector('.rating-stars[data-rating="trainers"]').getAttribute('data-selected')) || null,
            trainers_comment: document.querySelector('textarea[placeholder*="trainers"]')?.value || document.querySelector('textarea[placeholder*="ട്രെയിനർമാർ"]')?.value || '',
            atmosphere_rating: parseInt(document.querySelector('.rating-stars[data-rating="atmosphere"]').getAttribute('data-selected')) || null,
            atmosphere_comment: document.querySelector('textarea[placeholder*="vibe"]')?.value || document.querySelector('textarea[placeholder*="അന്തരീക്ഷം"]')?.value || ''
        };

        const submitBtn = document.getElementById('submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;
        btnText.textContent = "TRANSMITTING...";

        try {
            // 2. Send the JSON payload to the database
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Save timestamp for spam prevention
                localStorage.setItem('marvel_feedback_timestamp', Date.now());

                document.querySelectorAll('.marvel-anim-zone').forEach(z => z.classList.remove('peek'));
                
                const formWrapper = document.querySelector('.form-wrapper');
                const langSelector = document.querySelector('.lang-selector');
                const thankYouScreen = document.getElementById('thank-you-screen');

                formWrapper.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                langSelector.style.transition = 'opacity 0.5s ease';
                formWrapper.style.opacity = '0';
                langSelector.style.opacity = '0';
                formWrapper.style.transform = 'scale(0.95)';

                setTimeout(() => {
                    formWrapper.classList.add('hidden');
                    langSelector.classList.add('hidden');
                    thankYouScreen.classList.remove('hidden');
                }, 500);
            } else {
                throw new Error('Database insertion failed');
            }
        } catch (error) {
            console.error("Transmission failed", error);
            alert("Connection error. Please try assembling your feedback again.");
            btnText.textContent = originalText;
        }
    });
});