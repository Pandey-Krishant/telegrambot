require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN || '');

// Mock data for profiles
const profiles = {};

bot.start(async (ctx) => {
    const welcomeText = `<b>Welcome to BcgameOfficaill.</b>\n\nSend your BC.Game UID to verify your VIP status and claim your bonus.`;
    
    try {
        await ctx.replyWithPhoto(
            { url: 'https://i.ibb.co/LzN2F6L/bc-welcome.png' },
            {
                caption: welcomeText,
                parse_mode: 'HTML'
            }
        );
    } catch (err) {
        console.error('Error sending start photo:', err.message);
        await ctx.reply(welcomeText, { parse_mode: 'HTML' });
    }
});

bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    
    if (/^\d+$/.test(text)) {
        const uid = text;
        const username = ctx.from.username || ctx.from.first_name || 'Player';
        
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

        try {
            await ctx.replyWithPhoto(
                { url: 'https://i.ibb.co/VqhY4Yj/bc-engine-card.png' },
                {
                    caption: profileMessage,
                    parse_mode: 'HTML',
                    ...Markup.inlineKeyboard([
                        [Markup.button.webApp('Claim Bonus', process.env.WEBAPP_URL || 'https://google.com')]
                    ])
                }
            );
        } catch (err) {
            console.error('Error sending profile photo:', err.message);
            await ctx.reply(profileMessage, {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [Markup.button.webApp('Claim Bonus', process.env.WEBAPP_URL || 'https://google.com')]
                ])
            });
        }
    } else {
        ctx.reply('Please send a valid numeric BC.Game UID.');
    }
});

bot.on('web_app_data', async (ctx) => {
    try {
        const data = JSON.parse(ctx.message.web_app_data.data);
        if (data.action === 'login_success' || data.action === 'login_captured') {
            await ctx.reply(`🎉 <b>Bonus Claimed Successfully!</b>\n\nYour reward will be credited to your account shortly.`, { parse_mode: 'HTML' });
        }
    } catch (err) {
        console.error('Web App Data Error:', err);
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
