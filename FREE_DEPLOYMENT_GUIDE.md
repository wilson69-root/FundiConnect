# Free Deployment Guide for FundiConnect WhatsApp Bot

## 🆓 Free Hosting Options

### 1. **Railway** (Recommended - Free Tier)
- **Free Credits**: $5/month
- **Features**: Automatic deployments, environment variables
- **Perfect for**: WhatsApp bots

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables
railway variables set TELEGRAM_BOT_TOKEN=your_token
```

### 2. **Render** (Free Tier)
- **Free**: 750 hours/month
- **Features**: Auto-deploy from GitHub
- **Setup**: Connect GitHub repository

### 3. **Heroku** (Free Alternative: Koyeb)
```bash
# Koyeb (Heroku alternative)
# Visit: https://www.koyeb.com/
# Deploy directly from GitHub
```

### 4. **Replit** (Completely Free)
- **Cost**: 100% Free
- **Features**: Online IDE + hosting
- **Perfect for**: Testing and small deployments

## 🚀 Quick Setup Steps

### Step 1: Clone and Install
```bash
git clone your-repo
cd fundiconnect
npm install
```

### Step 2: WhatsApp Setup (Free)
```bash
# Run WhatsApp bot locally
npm run whatsapp-bot

# Scan QR code with your phone
# Bot is now connected to your WhatsApp!
```

### Step 3: Telegram Setup (Free)
```bash
# Get bot token from @BotFather
# Set environment variable
export TELEGRAM_BOT_TOKEN=your_token

# Run Telegram bot
node server/telegram-bot.js
```

### Step 4: Deploy to Railway (Free)
```bash
railway login
railway init
railway up
```

## 💡 Pro Tips for Free Usage

1. **WhatsApp Web API**: Completely free, no limits
2. **Telegram Bot API**: Free forever, unlimited messages
3. **Railway**: $5 free credits monthly (enough for small bots)
4. **Replit**: Free hosting with always-on option

## 🔧 Local Development
```bash
# Terminal 1: Run web app
npm run dev

# Terminal 2: Run WhatsApp bot
npm run whatsapp-bot

# Terminal 3: Run Telegram bot (optional)
node server/telegram-bot.js
```

## 📱 Testing Your Bot

### WhatsApp Testing:
1. Run `npm run whatsapp-bot`
2. Scan QR code with your phone
3. Send message to your own WhatsApp number
4. Bot responds automatically!

### Telegram Testing:
1. Create bot with @BotFather
2. Get token and set environment variable
3. Run `node server/telegram-bot.js`
4. Message your bot on Telegram

## 🎯 Free Features Included:
- ✅ AI-powered service matching
- ✅ Instant quotations
- ✅ Multi-platform support (WhatsApp + Telegram)
- ✅ Real-time responses
- ✅ Service provider recommendations
- ✅ Booking integration
- ✅ Analytics and monitoring

## 🔄 Keeping It Free:
1. Use WhatsApp Web API (no API costs)
2. Deploy on Railway free tier
3. Use Telegram Bot API (free forever)
4. Monitor usage to stay within limits

Your FundiConnect bot can run completely free and handle hundreds of users daily!