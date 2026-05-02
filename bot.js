require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN || '');

// Mock data for profiles (in a real app, this would come from a database)
const profiles = {};

bot.start((ctx) => {
    const firstName = ctx.from.first_name || 'Player';
    ctx.replyWithPhoto(
        { url: 'https://placehold.co/600x400/1e2328/ffffff?text=BC+GAME+WELCOME' },
        {
            caption: `<b>Welcome to BcgameOfficaill.</b>\n\nSend your BC.Game UID to verify your VIP status and claim your bonus.`,
            parse_mode: 'HTML'
        }
    );
});

bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    
    // Check if it's a numeric UID
    if (/^\d+$/.test(text)) {
        const uid = text;
        const username = ctx.from.username || ctx.from.first_name;
        
        // Save UID for this user (mock)
        profiles[ctx.from.id] = uid;

        const profileMessage = `
<b>BC GAME PLAYER PROFILE</b>
━━━━━━━━━━━━━━━
👤 <b>Name</b>     : ${username}
🆔 <b>UID</b>      : ${uid}
🏅 <b>Rank</b>     : Beginner
━━━━━━━━━━━━━━━
<b>BONUS DETAILS</b>
━━━━━━━━━━━━━━━
🎁 <b>ENGINE REWARDS</b>
📌 <b>Status</b>   : ✅ VERIFIED
— Claim is available

<b>This exclusive bonus is available to all verified players.</b>
━━━━━━━━━━━━━━━`;

        await ctx.replyWithPhoto(
            { url: 'https://placehold.co/600x600/1e2328/3bc117?text=BC+ENGINE' },
            {
                caption: profileMessage,
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [Markup.button.webApp('Claim Bonus', process.env.WEBAPP_URL || 'https://google.com')]
                ])
            }
        );
    } else {
        ctx.reply('Please send a valid numeric BC.Game UID.');
    }
});

bot.launch().then(() => {
    console.log('Bot is running...');
}).catch(err => {
    console.error('Error starting bot:', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
