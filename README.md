# 💌 Valentine Telegram Bot

A playful Telegram bot that asks someone to be your Valentine! They need a secret code first, and can't really say "No" 😉

## Setup

### 1. Create a Telegram Bot
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the prompts
3. Copy the bot token

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your values:
```
BOT_TOKEN=your_bot_token_here
SECRET_CODE=myflowers
GIF_URL=https://media.tenor.com/images/3421945902795778238/tenor.gif
```

### 3. Install & Run
```bash
npm install
npm start
```

## How It Works

1. 🌸 User starts the bot → Prompted for secret code
2. 🔑 User enters correct code → Valentine question appears
3. ❌ User taps "No" → Playful rejection + question repeats
4. ✅ User taps "Yes" → Celebration GIF! 🎉

## Customization

- **SECRET_CODE**: Change to match the code on your flower bouquet card
- **GIF_URL**: Replace with your own celebration GIF
- **noResponses** in `bot.js`: Edit the playful "No" rejection messages
