# 📱 WhatsApp Integration Setup Guide

## 🚀 Quick Start (2 Minutes)

### Step 1: Install Dependencies
```bash
# Dependencies are already installed in package.json
npm install
```

### Step 2: Run WhatsApp Bot
```bash
# Start the enhanced WhatsApp bot
node server/whatsapp-enhanced.cjs
```

### Step 3: Scan QR Code
1. A QR code will appear in your terminal
2. Open WhatsApp on your phone
3. Go to **Settings → Linked Devices**
4. Tap **"Link a Device"**
5. Scan the QR code
6. ✅ Your bot is now connected!

### Step 4: Test Your Bot
1. Send a message to your WhatsApp number from another phone
2. Try: "I need a plumber"
3. Bot responds with provider recommendations! 🎉

## 🤖 Enhanced Features

### ✨ Advanced AI Capabilities
- **Natural Language Processing**: Understands complex requests
- **Context Awareness**: Remembers conversation history
- **Smart Matching**: Scores providers based on multiple factors
- **Location Detection**: Automatically extracts location from messages
- **Urgency Detection**: Identifies urgent requests
- **Budget Analysis**: Considers user budget constraints

### 📱 Rich Interactions
- **Contact Sharing**: Direct provider contact details
- **Location Support**: Handles shared locations
- **Media Handling**: Responds to images/documents
- **Group Support**: Responds when mentioned in groups
- **Typing Indicators**: Shows realistic typing behavior

### 🔧 Supported Services
- 🚰 **Plumbing** - Pipes, leaks, installations, repairs
- 🧹 **Cleaning** - House, office, deep cleaning, maintenance
- ⚡ **Electrical** - Wiring, repairs, installations, solar
- 💄 **Beauty** - Makeup, hair, spa, wellness services
- 🪚 **Carpentry** - Furniture, repairs, custom work
- 📚 **Tutoring** - Academic subjects, exam preparation
- 🧱 **Masonry** - Stonework, construction, repairs

## 💬 Example Conversations

### Basic Service Request
```
User: I need a plumber
Bot: 🔍 Searching for plumbing providers...

✨ Found 3 excellent plumbing providers!

1. John Kamau
💰 KSh 2,400 (2 hours)
⭐ 4.8 rating | < 30 mins
📍 Nairobi, Westlands

2. Peter Mwangi
💰 KSh 3,200 (2 hours)
⭐ 4.7 rating | < 45 mins
📍 Nairobi, CBD

💡 Reply with a number (1-2) to get contact details
```

### Location-Specific Request
```
User: Looking for house cleaning in Karen
Bot: 🔍 Searching for cleaning providers in Karen...

✨ Found 2 excellent cleaning providers!

1. Mary Wanjiku
💰 KSh 1,200 (3 hours)
⭐ 4.9 rating | < 15 mins
📍 Nairobi, Karen

💡 Reply with 1 to get contact details
```

### Urgent Request
```
User: Need an electrician urgently!
Bot: 🔍 Searching for electrical providers (URGENT)...

✨ Found 2 excellent electrical providers!

1. Peter Mwangi
💰 KSh 2,880 (2 hours)
⭐ 4.7 rating | < 45 mins
📍 Nairobi, CBD
🚨 Urgency fee: KSh 480

💡 Reply with 1 to get contact details
```

### Contact Details
```
User: 1
Bot: 📞 Contact John Kamau

📱 Phone: +254700123456
⭐ Rating: 4.8/5.0
📍 Location: Nairobi, Westlands
⏰ Response Time: < 30 mins

🔧 Services offered:
• Pipe Installation
• Leak Repairs
• Drain Cleaning
• Water Heater Service

💡 To book: Call directly or type "book 1"
```

## 🛠️ Configuration Options

### Environment Variables (.env)
```bash
# WhatsApp Bot Configuration
WHATSAPP_SESSION_NAME=fundiconnect-session
WHATSAPP_PORT=3001
WHATSAPP_DEBUG=true

# Optional: Webhook for production
WHATSAPP_WEBHOOK_URL=https://yourdomain.com/webhook
```

### Session Management
- Sessions are stored locally in `./whatsapp-sessions/`
- Each user's conversation context is maintained
- Automatic cleanup of old sessions

### Debug Mode
- Set `WHATSAPP_DEBUG=true` to see browser window
- Useful for troubleshooting connection issues
- Shows detailed logs in console

## 🚀 Production Deployment

### 1. Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up

# Set environment variables
railway variables set WHATSAPP_SESSION_NAME=production-session
railway variables set WHATSAPP_DEBUG=false
```

### 2. Heroku
```bash
# Create app
heroku create fundiconnect-whatsapp

# Set environment variables
heroku config:set WHATSAPP_SESSION_NAME=production-session
heroku config:set WHATSAPP_DEBUG=false

# Deploy
git push heroku main
```

### 3. VPS/Server
```bash
# Install PM2 for process management
npm install -g pm2

# Start bot with PM2
pm2 start server/whatsapp-enhanced.cjs --name "whatsapp-bot"

# Save PM2 configuration
pm2 save
pm2 startup
```

## 📊 Monitoring & Analytics

### Health Check Endpoints
```bash
# Check bot status
curl http://localhost:3001/health

# Response:
{
  "status": "running",
  "service": "FundiConnect WhatsApp Bot",
  "whatsapp_status": "connected",
  "active_sessions": 15,
  "uptime": 3600
}
```

### Built-in Logging
- All conversations are logged with timestamps
- User sessions tracked for context
- Error logging for debugging
- Performance metrics

### Send Message API (Testing)
```bash
# Send test message
curl -X POST http://localhost:3001/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "number": "254700000000",
    "message": "Test message from API"
  }'
```

## 🔧 Troubleshooting

### Common Issues

**QR Code not appearing:**
```bash
# Check if port is available
lsof -i :3001

# Restart with debug mode
WHATSAPP_DEBUG=true node server/whatsapp-enhanced.cjs
```

**Authentication failed:**
```bash
# Clear session data
rm -rf ./whatsapp-sessions/

# Restart bot
node server/whatsapp-enhanced.cjs
```

**Bot not responding:**
```bash
# Check WhatsApp connection
curl http://localhost:3001/status

# Restart bot
pkill -f whatsapp-enhanced
node server/whatsapp-enhanced.cjs
```

### Session Management
- Sessions are automatically saved
- Old sessions cleaned up after 30 days
- Manual session reset: delete `./whatsapp-sessions/` folder

## 🔐 Security Best Practices

1. **Session Security**
   - Keep session files secure
   - Don't commit session data to git
   - Use environment variables for sensitive config

2. **Rate Limiting**
   - Built-in message throttling
   - Prevents spam and abuse
   - Configurable limits

3. **Data Privacy**
   - User conversations not permanently stored
   - GDPR compliant design
   - Optional data retention policies

## 🎯 Advanced Features

### Custom Commands
Add custom commands by modifying the intent recognition:

```javascript
// In recognizeIntent method
if (lowerMessage.includes('status')) {
  intent = 'status_check';
}
```

### Webhook Integration
For production, use webhooks instead of polling:

```javascript
// Set webhook URL
await client.setWebhook('https://yourdomain.com/webhook');
```

### Multi-language Support
Add language detection and responses:

```javascript
// Detect language and respond accordingly
const language = detectLanguage(message);
const responses = await botService.processMessage(message, userId, userName, language);
```

Your FundiConnect WhatsApp bot is now ready to provide intelligent service provider recommendations with advanced AI capabilities! 🚀

## 📞 Support

- **Documentation**: Check this guide for setup instructions
- **Issues**: Report bugs via GitHub issues
- **Community**: Join our Discord for support
- **Website**: https://fundiconnect.com