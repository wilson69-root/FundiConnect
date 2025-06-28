# 📱 Telegram Bot Setup Guide for FundiConnect

## 🚀 Quick Start (5 Minutes)

### Step 1: Create Your Telegram Bot
1. Open Telegram and search for `@BotFather`
2. Start a chat and send `/newbot`
3. Choose a name: `FundiConnect Assistant`
4. Choose a username: `fundiconnect_bot` (must end with 'bot')
5. Copy the bot token (looks like: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### Step 2: Set Environment Variable
```bash
# On Windows
set TELEGRAM_BOT_TOKEN=your_bot_token_here

# On Mac/Linux
export TELEGRAM_BOT_TOKEN=your_bot_token_here

# Or create .env file
echo "TELEGRAM_BOT_TOKEN=your_bot_token_here" > .env
```

### Step 3: Install Dependencies & Run
```bash
# Install dependencies
npm install

# Run Telegram bot
npm run telegram-bot
```

### Step 4: Test Your Bot
1. Search for your bot username on Telegram
2. Start a chat with `/start`
3. Try: "I need a plumber"
4. Bot responds with provider recommendations! 🎉

## 🤖 Bot Features

### ✨ AI-Powered Responses
- **Natural Language**: "I need a plumber for leak repair"
- **Location Aware**: "Looking for cleaning in Westlands"
- **Service Matching**: Automatically finds relevant providers
- **Instant Quotes**: Real-time pricing estimates

### 📱 Interactive Buttons
- **Service Categories**: Quick access to all services
- **Provider Actions**: Call, Book, View Profile
- **Smart Navigation**: Search again, expand results
- **Direct Booking**: Links to website booking

### 🔧 Supported Services
- 🚰 **Plumbing** - Pipes, leaks, installations
- 🧹 **Cleaning** - House, office, deep cleaning
- ⚡ **Electrical** - Wiring, repairs, installations
- 💄 **Beauty** - Makeup, hair, wellness
- 🪚 **Carpentry** - Furniture, repairs, installations
- 📚 **Tutoring** - Math, science, exam prep
- 🧱 **Masonry** - Stonework, construction, repairs

## 💬 Example Conversations

### Basic Service Request
```
User: I need a plumber
Bot: 🔍 Searching for plumbing providers...

✨ Found 3 excellent plumbing providers!

1. John Kamau
💰 KSh 2,400 (3 hours)
⭐ 4.8 rating | < 30 mins
📍 Nairobi, Westlands

[📞 Call John Kamau] [📅 Book John Kamau]
```

### Location-Specific Search
```
User: Looking for house cleaning in Karen
Bot: 🔍 Searching for cleaning providers in Karen...

✨ Found 2 excellent cleaning providers!

1. Mary Wanjiku
💰 KSh 1,200 (2 hours)
⭐ 4.9 rating | < 15 mins
📍 Nairobi, Karen

[📞 Call Mary] [📅 Book Mary]
```

### Pricing Inquiry
```
User: How much does electrical work cost?
Bot: 💰 FundiConnect Pricing Information

Our rates vary by service and provider:
⚡ Electrical: KSh 1,500 - 3,000/hr

💡 Get exact quotes by telling me what service you need!

[🔍 Get Quote] [🌐 View Website]
```

## 🛠️ Advanced Configuration

### Custom Bot Commands
Add these commands via @BotFather:
```
start - Welcome message and service overview
help - How to use the bot and features
services - List all available services
pricing - View pricing information
contact - Contact support
```

### Webhook Setup (Production)
```javascript
// For production deployment
const webhookUrl = 'https://yourdomain.com/webhook';
bot.setWebHook(webhookUrl);

app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});
```

### Environment Variables
```bash
# Required
TELEGRAM_BOT_TOKEN=your_bot_token

# Optional
PORT=3002
NODE_ENV=production
WEBHOOK_URL=https://yourdomain.com/webhook
```

## 🚀 Deployment Options

### 1. Railway (Free Tier)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up

# Set environment variable
railway variables set TELEGRAM_BOT_TOKEN=your_token
```

### 2. Heroku
```bash
# Create app
heroku create fundiconnect-telegram

# Set environment variable
heroku config:set TELEGRAM_BOT_TOKEN=your_token

# Deploy
git push heroku main
```

### 3. Vercel (Serverless)
```javascript
// api/telegram-webhook.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Handle Telegram updates
    await bot.processUpdate(req.body);
    res.status(200).json({ ok: true });
  }
}
```

## 🔧 Troubleshooting

### Common Issues

**Bot not responding:**
```bash
# Check if token is set
echo $TELEGRAM_BOT_TOKEN

# Restart bot
npm run telegram-bot
```

**Polling errors:**
```bash
# Stop other bot instances
pkill -f telegram-bot

# Clear webhook (if set)
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/deleteWebhook"
```

**Markdown errors:**
- Bot automatically escapes special characters
- If issues persist, check console logs

### Testing Commands
```bash
# Test bot logic
npm run test-bots -- --test-logic

# Start test interface
npm run test-bots -- --server
# Visit: http://localhost:3003
```

## 📊 Analytics & Monitoring

### Built-in Logging
```javascript
// Automatic logging includes:
console.log('👋 New user started: John (12345)');
console.log('📨 Message from Jane: I need a plumber');
console.log('🔘 Button pressed by Mike: service_plumbing');
console.log('✅ Responded to Sarah');
```

### Health Check Endpoint
```bash
# Check bot status
curl http://localhost:3002/health

# Response:
{
  "status": "running",
  "service": "FundiConnect Telegram Bot",
  "telegram_connected": true,
  "uptime": 3600
}
```

## 🔐 Security Best Practices

1. **Never commit bot tokens** to version control
2. **Use environment variables** for sensitive data
3. **Validate user inputs** before processing
4. **Rate limit** to prevent spam
5. **Log security events** for monitoring

## 🎯 Next Steps

1. **Customize responses** in `telegram-bot.js`
2. **Add more services** to the providers array
3. **Integrate with database** for real provider data
4. **Add payment processing** for bookings
5. **Implement user analytics** for insights

Your FundiConnect Telegram bot is now ready to help users find service providers with AI-powered recommendations! 🚀