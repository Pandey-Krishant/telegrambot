const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://telegrambot-navy.vercel.app/';

bot.start((ctx) => {
    ctx.reply('<b>Welcome to BC.GAME</b>\n\nPlease enter your BC.GAME User ID (UID) to continue.', {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
            [Markup.button.url('Join Channel', 'https://t.me/bcgame_official')]
        ])
    });
});

bot.on('text', (ctx) => {
    const uid = ctx.message.text;
    if (/^\d+$/.test(uid)) {
        ctx.reply(`<b>UID Verified: ${uid}</b>\n\nYou are now eligible to claim your bonus. Click the button below to sign in and claim.`, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.webApp('Claim Bonus', WEBAPP_URL)]
            ])
        });
    } else {
        ctx.reply('Please enter a valid numeric User ID.');
    }
});

bot.launch().then(() => console.log('Bot is running...'));
