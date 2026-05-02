const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Fallback for all other routes to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Web App server running at http://localhost:${port}`);
    console.log(`To use this with Telegram, you'll need an HTTPS URL (e.g., using ngrok or Vercel).`);
});
