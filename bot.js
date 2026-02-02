import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';

// ═══════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════
const BOT_TOKEN = process.env.BOT_TOKEN;
const SECRET_CODE = process.env.SECRET_CODE;
const GIF_URL = process.env.GIF_URL || 'https://media.tenor.com/images/3421945902795778238/tenor.gif';

if (!BOT_TOKEN) {
    console.error('❌ BOT_TOKEN is required! Create a .env file with your bot token.');
    process.exit(1);
}

// ═══════════════════════════════════════════════════════════════
// State Management
// ═══════════════════════════════════════════════════════════════
const STATES = {
    AWAITING_SECRET: 'AWAITING_SECRET',
    ASKING_VALENTINE: 'ASKING_VALENTINE',
    RETRYING: 'RETRYING',
    ACCEPTED: 'ACCEPTED'
};

// In-memory state store (per user)
const userStates = new Map();

function getState(userId) {
    return userStates.get(userId) || STATES.AWAITING_SECRET;
}

function setState(userId, state) {
    userStates.set(userId, state);
}

// ═══════════════════════════════════════════════════════════════
// Playful "No" responses
// ═══════════════════════════════════════════════════════════════
const noResponses = [
    "Are you sure baby? 🥺",
    "Wrong answer, Sunshine 😏",
    "No try me o 🥺",
    "Okay, but why? 🥺",
    "I'll wait 😌",
    "So you no want me again? 😏",
    "Hmm, try the other one! 💕",
    "The button on the left looks nicer, no? 💖"
];

let noResponseIndex = 0;

function getNextNoResponse() {
    const response = noResponses[noResponseIndex];
    noResponseIndex = (noResponseIndex + 1) % noResponses.length;
    return response;
}

// ═══════════════════════════════════════════════════════════════
// Valentine Question Keyboard
// ═══════════════════════════════════════════════════════════════
const valentineKeyboard = Markup.inlineKeyboard([
    Markup.button.callback('✅ Yes', 'yes_valentine'),
    Markup.button.callback('❌ No', 'no_valentine')
]);

// ═══════════════════════════════════════════════════════════════
// Bot Setup
// ═══════════════════════════════════════════════════════════════
const bot = new Telegraf(BOT_TOKEN);

// /start command
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    setState(userId, STATES.AWAITING_SECRET);

    await ctx.reply(
        "🌸 *Welcome!*\n\n" +
        "What's the secret code to unlock the message?\n\n" +
        "_(Hint: Check the card attached to the flower bouquet I sent to you.)_",
        { parse_mode: 'Markdown' }
    );
});

// Handle text messages (secret code validation)
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const state = getState(userId);
    const message = ctx.message.text.trim().toLowerCase();

    // Ignore if already accepted
    if (state === STATES.ACCEPTED) {
        await ctx.reply("You already said yes! 💘🥳");
        return;
    }

    // Validate secret code
    if (state === STATES.AWAITING_SECRET) {
        if (message === SECRET_CODE.toLowerCase()) {
            setState(userId, STATES.ASKING_VALENTINE);
            await ctx.reply(
                "💌 *You unlocked the secret message!*\n\n" +
                "Would you be my valentine? 💕",
                { parse_mode: 'Markdown', ...valentineKeyboard }
            );
        } else {
            await ctx.reply("Hmm… are you sure you are the intended recipient");
        }
        return;
    }

    // If in ASKING_VALENTINE or RETRYING state, remind them to use buttons
    if (state === STATES.ASKING_VALENTINE || state === STATES.RETRYING) {
        await ctx.reply(
            "Use the buttons below! 👇💕",
            valentineKeyboard
        );
    }
});

// Handle "Yes" button
bot.action('yes_valentine', async (ctx) => {
    const userId = ctx.from.id;

    await ctx.answerCbQuery('💖');
    setState(userId, STATES.ACCEPTED);

    // Send celebration GIF
    await ctx.replyWithAnimation(GIF_URL);
    await ctx.reply("YAYYYY 💘🥳\n\nYou just made my day baby! 🌹");
});

// Handle "No" button
bot.action('no_valentine', async (ctx) => {
    const userId = ctx.from.id;

    await ctx.answerCbQuery('🥺');
    setState(userId, STATES.RETRYING);

    const playfulResponse = getNextNoResponse();
    await ctx.reply(playfulResponse);

    // Re-send the question with buttons
    await ctx.reply(
        "Would you be my valentine? 💌",
        valentineKeyboard
    );
});

// ═══════════════════════════════════════════════════════════════
// Launch Bot
// ═══════════════════════════════════════════════════════════════
bot.launch()
    .then(() => {
        console.log('Valentine Bot is running!');
        console.log('Waiting for your special someone...');
    })
    .catch((err) => {
        console.error('Failed to start bot:', err.message);
    });

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
