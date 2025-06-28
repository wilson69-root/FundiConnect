# 🌐 Multi-Platform Bot Integration Guide

## 🚀 Overview
Run FundiConnect bots on WhatsApp, Telegram, and Web simultaneously with shared AI logic.

## 📱 Platform Comparison

| Feature | WhatsApp | Telegram | Web Chat |
|---------|----------|----------|----------|
| **Setup Complexity** | Medium | Easy | Easy |
| **Cost** | Free | Free | Free |
| **Message Limits** | Unlimited | Unlimited | Unlimited |
| **Rich Media** | ✅ | ✅ | ✅ |
| **Inline Buttons** | Limited | ✅ | ✅ |
| **File Sharing** | ✅ | ✅ | ✅ |
| **Group Support** | ✅ | ✅ | ❌ |

## 🔧 Running All Bots

### Option 1: Run Separately
```bash
# Terminal 1: Web app
npm run dev

# Terminal 2: WhatsApp bot
npm run whatsapp-bot

# Terminal 3: Telegram bot
npm run telegram-bot
```

### Option 2: Run Concurrently
```bash
# Install concurrently
npm install concurrently --save-dev

# Run all bots together
npm run start-bots
```

### Option 3: Production Setup
```bash
# Using PM2 for production
npm install -g pm2

# Start all services
pm2 start ecosystem.config.js
```

## 🤖 Shared Bot Logic

### Unified Service Class
```javascript
// shared/bot-service.js
class UnifiedBotService {
  constructor() {
    this.providers = [...]; // Shared provider data
  }

  async processMessage(message, platform = 'web') {
    const responses = await this.generateResponses(message);
    return this.formatForPlatform(responses, platform);
  }

  formatForPlatform(responses, platform) {
    switch (platform) {
      case 'whatsapp':
        return this.formatForWhatsApp(responses);
      case 'telegram':
        return this.formatForTelegram(responses);
      default:
        return responses;
    }
  }
}
```

## 📊 Analytics Dashboard

### Track Cross-Platform Usage
```javascript
// analytics/tracker.js
class CrossPlatformAnalytics {
  static trackMessage(platform, userId, message) {
    console.log(`[${platform}] ${userId}: ${message}`);
    
    // Store in database or analytics service
    this.logToDatabase({
      platform,
      userId,
      message,
      timestamp: new Date()
    });
  }

  static getDailyStats() {
    return {
      whatsapp: { users: 150, messages: 450 },
      telegram: { users: 89, messages: 267 },
      web: { users: 234, messages: 678 }
    };
  }
}
```

## 🚀 Deployment Strategies

### 1. Single Server Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  fundiconnect-web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production

  fundiconnect-whatsapp:
    build: .
    command: node server/whatsapp-bot.js
    environment:
      - NODE_ENV=production

  fundiconnect-telegram:
    build: .
    command: node server/telegram-bot.js
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
```

### 2. Microservices Architecture
```bash
# Deploy each bot as separate service
railway deploy --service whatsapp-bot
railway deploy --service telegram-bot
railway deploy --service web-app
```

### 3. Serverless Functions
```javascript
// vercel/api/telegram.js
export default async function handler(req, res) {
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
  await bot.processUpdate(req.body);
  res.status(200).json({ ok: true });
}

// vercel/api/whatsapp.js
export default async function handler(req, res) {
  // Handle WhatsApp webhook
  const responses = await botService.processMessage(req.body.message);
  res.json({ responses });
}
```

## 🔄 Message Synchronization

### Cross-Platform User Tracking
```javascript
class UserManager {
  constructor() {
    this.users = new Map(); // userId -> { platforms: [], preferences: {} }
  }

  linkPlatforms(userId, platform, platformId) {
    if (!this.users.has(userId)) {
      this.users.set(userId, { platforms: [], preferences: {} });
    }
    
    const user = this.users.get(userId);
    user.platforms.push({ platform, platformId });
  }

  async sendCrossplatformMessage(userId, message) {
    const user = this.users.get(userId);
    if (!user) return;

    for (const { platform, platformId } of user.platforms) {
      switch (platform) {
        case 'whatsapp':
          await whatsappBot.sendMessage(platformId, message);
          break;
        case 'telegram':
          await telegramBot.sendMessage(platformId, message);
          break;
      }
    }
  }
}
```

## 📱 Platform-Specific Features

### WhatsApp Features
```javascript
// WhatsApp-specific enhancements
class WhatsAppEnhancements {
  static async sendLocation(chatId, provider) {
    await client.sendMessage(chatId, {
      location: {
        latitude: provider.lat,
        longitude: provider.lng
      }
    });
  }

  static async sendContact(chatId, provider) {
    await client.sendMessage(chatId, {
      contact: {
        name: provider.name,
        number: provider.phone
      }
    });
  }
}
```

### Telegram Features
```javascript
// Telegram-specific enhancements
class TelegramEnhancements {
  static async sendInlineKeyboard(chatId, text, buttons) {
    await bot.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: buttons
      }
    });
  }

  static async sendPoll(chatId, question, options) {
    await bot.sendPoll(chatId, question, options);
  }
}
```

## 🔧 Configuration Management

### Environment Variables
```bash
# .env
# Web App
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# WhatsApp Bot
WHATSAPP_SESSION_PATH=./whatsapp-session

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_token

# Shared
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
```

### Platform Configuration
```javascript
// config/platforms.js
export const platformConfig = {
  whatsapp: {
    enabled: process.env.WHATSAPP_ENABLED === 'true',
    sessionPath: process.env.WHATSAPP_SESSION_PATH,
    webhookUrl: process.env.WHATSAPP_WEBHOOK_URL
  },
  telegram: {
    enabled: process.env.TELEGRAM_ENABLED === 'true',
    token: process.env.TELEGRAM_BOT_TOKEN,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL
  },
  web: {
    enabled: true,
    port: process.env.PORT || 3000
  }
};
```

## 📊 Monitoring & Health Checks

### Unified Health Check
```javascript
// health/checker.js
class HealthChecker {
  static async checkAllPlatforms() {
    const status = {
      web: await this.checkWeb(),
      whatsapp: await this.checkWhatsApp(),
      telegram: await this.checkTelegram(),
      timestamp: new Date().toISOString()
    };

    return status;
  }

  static async checkWhatsApp() {
    try {
      return {
        status: client.info ? 'connected' : 'disconnected',
        uptime: process.uptime()
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  static async checkTelegram() {
    try {
      const me = await bot.getMe();
      return {
        status: 'connected',
        botName: me.username,
        uptime: process.uptime()
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}
```

## 🎯 Best Practices

### 1. Error Handling
```javascript
class ErrorHandler {
  static async handlePlatformError(platform, error, context) {
    console.error(`[${platform}] Error:`, error);
    
    // Log to monitoring service
    await this.logError(platform, error, context);
    
    // Send fallback response
    await this.sendFallbackResponse(platform, context);
  }
}
```

### 2. Rate Limiting
```javascript
class RateLimiter {
  constructor() {
    this.limits = new Map(); // userId -> { count, resetTime }
  }

  isAllowed(userId, platform) {
    const limit = this.getPlatformLimit(platform);
    const userLimit = this.limits.get(userId) || { count: 0, resetTime: Date.now() + 60000 };
    
    if (Date.now() > userLimit.resetTime) {
      userLimit.count = 0;
      userLimit.resetTime = Date.now() + 60000;
    }
    
    if (userLimit.count >= limit) {
      return false;
    }
    
    userLimit.count++;
    this.limits.set(userId, userLimit);
    return true;
  }
}
```

### 3. Message Queue
```javascript
class MessageQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async addMessage(platform, userId, message) {
    this.queue.push({ platform, userId, message, timestamp: Date.now() });
    
    if (!this.processing) {
      await this.processQueue();
    }
  }

  async processQueue() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const message = this.queue.shift();
      await this.processMessage(message);
      
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.processing = false;
  }
}
```

## 🚀 Scaling Considerations

### Horizontal Scaling
- Use Redis for session storage
- Implement message queues (Bull, Agenda)
- Load balance across multiple instances
- Use webhooks instead of polling in production

### Database Integration
- Store user preferences across platforms
- Track conversation history
- Analytics and reporting
- Provider management system

Your multi-platform FundiConnect bot system is now ready to serve users across WhatsApp, Telegram, and web simultaneously! 🎉