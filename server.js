require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
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
    
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🔐 BC.GAME Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #2d3137; border-radius: 12px; background-color: #1c1e22; color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://bc.game/assets/logo.01f4640d.png" alt="BC.GAME" style="height: 30px;">
                </div>
                <h2 style="color: #3bc117; text-align: center; margin-bottom: 20px;">Verification Code</h2>
                <p style="font-size: 16px; margin-bottom: 10px;">Your 6-digit verification code is:</p>
                <div style="font-size: 36px; font-weight: bold; text-align: center; padding: 20px; background: #24272c; border-radius: 8px; letter-spacing: 8px; color: #3bc117; margin-bottom: 20px;">
                    ${otp}
                </div>
                <p style="font-size: 14px; color: #98a7b5;">This code is valid for 5 minutes. If you did not request this code, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #2d3137; margin: 20px 0;">
                <p style="font-size: 12px; color: #556767; text-align: center;">© 2026 BC.GAME. All rights reserved.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
