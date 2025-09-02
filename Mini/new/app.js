document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    const percentageInput = document.getElementById('class12Percentage');
    const streamSelect = document.getElementById('streamSelect');
    const subjectGroup = document.getElementById('subjectGroup');
    const subjectSelect = document.getElementById('subjectSelect');
    const checkEligibilityBtn = document.getElementById('checkEligibilityBtn');
    const eligibilityResult = document.getElementById('eligibilityResult');

    const percentageError = document.getElementById('percentage-error');
    const streamError = document.getElementById('stream-error');
    const subjectError = document.getElementById('subject-error');

    // Show/hide subject selection based on stream
    streamSelect.addEventListener('change', () => {
        if (streamSelect.value === 'Science' || streamSelect.value === 'Engineering') {
            subjectGroup.classList.remove('hidden');
        } else {
            subjectGroup.classList.add('hidden');
            subjectSelect.value = ''; // Clear subject selection if not applicable
        }
        clearErrors();
        eligibilityResult.classList.add('hidden'); // Hide results when inputs change
    });

    // Clear errors when input fields are changed
    percentageInput.addEventListener('input', clearErrors);
    streamSelect.addEventListener('change', clearErrors);
    subjectSelect.addEventListener('change', clearErrors);

    function clearErrors() {
        percentageError.textContent = '';
        streamError.textContent = '';
        subjectError.textContent = '';
        eligibilityResult.classList.add('hidden');
        eligibilityResult.classList.remove('eligible', 'not-eligible');
    }

    checkEligibilityBtn.addEventListener('click', () => {
        clearErrors();
        const percentage = parseFloat(percentageInput.value);
        const stream = streamSelect.value;
        const subjects = subjectSelect.value;

        let isValid = true;

        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            percentageError.textContent = 'Please enter a valid percentage (0-100).';
            isValid = false;
        }
        if (!stream) {
            streamError.textContent = 'Please select a stream.';
            isValid = false;
        }
        if ((stream === 'Science' || stream === 'Engineering') && !subjects) {
            subjectError.textContent = 'Please select subject combination for Science/Engineering.';
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        let isEligible = false;
        let message = '';
        let advice = '';

        switch (stream) {
            case 'Science':
                if (subjects === 'PCM' || subjects === 'PCB') {
                    if (percentage >= 60) {
                        isEligible = true;
                        message = 'You are generally eligible for the Science stream!';
                        advice = 'Keep in mind that highly competitive colleges may require higher percentages or entrance exam scores. Specific colleges might also have individual subject minimums.';
                    } else {
                        message = 'You are generally not eligible for the Science stream based on percentage.';
                        advice = 'Most Science programs require a minimum of 60% in Class 12 with PCM/PCB. Consider re-evaluating your options or checking specific college criteria.';
                    }
                } else {
                    message = 'Please select a valid subject combination (PCM/PCB) for Science.';
                    advice = 'The Science stream requires specific subject backgrounds. If you did not take PCM or PCB, you might need to consider other streams or foundational courses.';
                }
                break;

            case 'Commerce':
                if (percentage >= 50) {
                    isEligible = true;
                    message = 'You are generally eligible for the Commerce stream!';
                    advice = 'While 50% is a common minimum, top Commerce colleges (like SRCC) often have much higher cut-offs. Some universities also require entrance exam scores (e.g., CUET).';
                } else {
                    message = 'You are generally not eligible for the Commerce stream based on percentage.';
                    advice = 'A minimum of 50% in Class 12 is usually required for Commerce. Consider exploring Arts or vocational courses, or improving your percentage.';
                }
                break;

            case 'Arts':
                if (percentage >= 40) {
                    isEligible = true;
                    message = 'You are generally eligible for the Arts stream!';
                    advice = 'The Arts stream is very flexible. While 40% is a common minimum, specific courses like Law or Journalism might have higher requirements or entrance exams (e.g., CLAT).';
                } else {
                    message = 'You are generally not eligible for the Arts stream based on percentage.';
                    advice = 'A minimum of 40% in Class 12 is typically required for Arts programs. There might be some foundational courses or alternative options available.';
                }
                break;

            case 'Engineering':
                if (subjects === 'PCM') {
                    if (percentage >= 60) {
                        isEligible = true;
                        message = 'You are generally eligible for Engineering!';
                        advice = 'Admission to Engineering programs (B.Tech/B.E.) heavily relies on competitive entrance exams like JEE Main, JEE Advanced, or state-level exams, along with Class 12 PCM subjects. A higher percentage is often advantageous.';
                    } else {
                        message = 'You are generally not eligible for Engineering based on percentage.';
                        advice = 'Engineering generally requires a minimum of 60% in Class 12 PCM subjects. Furthermore, strong performance in entrance exams is crucial for admission to good colleges.';
                    }
                } else {
                    message = 'Engineering requires Physics, Chemistry, and Mathematics (PCM) in Class 12.';
                    advice = 'If you did not have PCM, you might not be eligible for traditional engineering degrees. Consider other Science fields or vocational courses.';
                }
                break;

            default:
                message = 'Please select a valid stream.';
                advice = 'Ensure you select one of the available college streams.';
                break;
        }

        eligibilityResult.classList.remove('hidden', 'eligible', 'not-eligible');
        if (isEligible) {
            eligibilityResult.classList.add('eligible');
            
            setTimeout(() => {
                window.location.href = '/Mini/index.html'; 
            }, 2500); 
            
        } else {
            eligibilityResult.classList.add('not-eligible');
        }

        eligibilityResult.innerHTML = `
            <h3>Eligibility Status:</h3>
            <p><strong>Result:</strong> ${isEligible ? 'Eligible! 🎉' : 'Not Eligible 😔'}</p>
            <p>${message}</p>
            <p><strong>Advice:</strong> ${advice}</p>
        `;
    });
});