// Initialize Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// Elements
const tabs = document.querySelectorAll('.tab');
const usernameInput = document.getElementById('username');
const passwordContainer = document.getElementById('password-container');
const forgotPassword = document.getElementById('forgot-password');
const loginForm = document.getElementById('login-form');
const otpModal = document.getElementById('otp-modal');
const modalClose = document.getElementById('modal-close');
const confirmBtn = document.getElementById('confirm-btn');
const timerEl = document.getElementById('timer');

let currentTab = 'password';

// Tab switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.dataset.tab;
        
        if (currentTab === 'otp') {
            usernameInput.placeholder = 'Email / Phone Number';
            passwordContainer.style.display = 'none';
            forgotPassword.style.display = 'none';
        } else {
            usernameInput.placeholder = 'Email / Phone Number / Username';
            passwordContainer.style.display = 'block';
            forgotPassword.style.display = 'block';
        }
    });
});

// Password visibility
document.querySelector('.toggle-password').addEventListener('click', () => {
    const passwordInput = document.getElementById('password');
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
});

// Form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (currentTab === 'otp') {
        openOTPModal();
    } else {
        const username = usernameInput.value;
        const password = document.getElementById('password').value;
        
        // Simulating standard login
        tg.showConfirm(`Sign in as ${username}?`, (ok) => {
            if (ok) {
                tg.close();
            }
        });
    }
});

// OTP Modal Logic
function openOTPModal() {
    otpModal.style.display = 'flex';
    startTimer(46);
}

function startTimer(seconds) {
    let timeLeft = seconds;
    const interval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) clearInterval(interval);
    }, 1000);
}

modalClose.addEventListener('click', () => {
    otpModal.style.display = 'none';
});

confirmBtn.addEventListener('click', () => {
    const otp = document.getElementById('otp-input').value;
    const username = usernameInput.value;

    if (otp.length === 6) {
        confirmBtn.textContent = 'Verifying...';
        confirmBtn.disabled = true;

        setTimeout(() => {
            tg.showAlert(`Verification successful for ${username}!`);
            tg.close();
        }, 1500);
    } else {
        tg.showAlert('Please enter a valid 6-digit code.');
    }
});

// Close WebApp
document.getElementById('close-btn').addEventListener('click', () => {
    tg.close();
});
