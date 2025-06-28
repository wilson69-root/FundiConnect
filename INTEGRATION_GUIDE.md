# WhatsApp & Telegram Bot Integration Guide

## Overview
This guide explains how to integrate the FundiConnect AI bot with actual WhatsApp and Telegram platforms for real-world deployment.

## 🚀 WhatsApp Integration

### Option 1: WhatsApp Business API (Recommended for Production)

#### Prerequisites
- WhatsApp Business Account
- Facebook Business Manager Account
- Verified Business Phone Number
- SSL Certificate for webhook endpoints

#### Setup Steps

1. **Create WhatsApp Business Account**
   ```bash
   # Visit: https://business.whatsapp.com/
   # Register your business and verify phone number
   ```

2. **Set up Facebook App**
   ```bash
   # Go to: https://developers.facebook.com/
   # Create new app → Business → WhatsApp
   # Add WhatsApp product to your app
   ```

3. **Configure Webhook**
   ```javascript
   // webhook-handler.js
   const express = require('express');
   const { botService } = require('./src/services/botService');
   
   const app = express();
   app.use(express.json());
   
   // Webhook verification
   app.get('/webhook', (req, res) => {
     const mode = req.query['hub.mode'];
     const token = req.query['hub.verify_token'];
     const challenge = req.query['hub.challenge'];
     
     if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
       res.status(200).send(challenge);
     } else {
       res.sendStatus(403);
     }
   });
   
   // Handle incoming messages
   app.post('/webhook', async (req, res) => {
     const body = req.body;
     
     if (body.object === 'whatsapp_business_account') {
       body.entry.forEach(async (entry) => {
         const changes = entry.changes;
         changes.forEach(async (change) => {
           if (change.field === 'messages') {
             const message = change.value.messages[0];
             const from = message.from;
             const text = message.text.body;
             
             // Process with our bot service
             const responses = await botService.processMessage(text);
             
             // Send responses back to WhatsApp
             for (const response of responses) {
               await sendWhatsAppMessage(from, response);
             }
           }
         });
       });
     }
     
     res.status(200).send('EVENT_RECEIVED');
   });
   
   async function sendWhatsAppMessage(to, message) {
     const url = `https://graph.facebook.com/v17.0/${process.env.PHONE_NUMBER_ID}/messages`;
     
     const payload = {
       messaging_product: 'whatsapp',
       to: to,
       type: 'text',
       text: { body: message.text }
     };
     
     // Handle quotations
     if (message.type === 'quotation' && message.data) {
       payload.type = 'template';
       payload.template = {
         name: 'service_quotation',
         language: { code: 'en' },
         components: [
           {
             type: 'body',
             parameters: message.data.map(q => ({
               type: 'text',
               text: `${q.providerName}: KSh ${q.estimatedCost}`
             }))
           }
         ]
       };
     }
     
     await fetch(url, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify(payload)
     });
   }
   
   app.listen(process.env.PORT || 3000);
   ```

4. **Environment Variables**
   ```bash
   # .env
   WHATSAPP_TOKEN=your_whatsapp_access_token
   PHONE_NUMBER_ID=your_phone_number_id
   VERIFY_TOKEN=your_webhook_verify_token
   WEBHOOK_URL=https://yourdomain.com/webhook
   ```

### Option 2: WhatsApp Web API (Alternative)

```javascript
// Using whatsapp-web.js library
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
});

client.on('message', async (message) => {
  const responses = await botService.processMessage(message.body);
  
  for (const response of responses) {
    if (response.type === 'quotation') {
      // Format quotations for WhatsApp
      let quotationText = response.text + '\n\n';
      response.data.forEach(q => {
        quotationText += `🔧 *${q.providerName}*\n`;
        quotationText += `💰 KSh ${q.estimatedCost.toLocaleString()}\n`;
        quotationText += `⭐ ${q.rating} | ${q.responseTime}\n\n`;
      });
      await message.reply(quotationText);
    } else {
      await message.reply(response.text);
    }
  }
});

client.initialize();
```

## 📱 Telegram Integration

### Setup Steps

1. **Create Telegram Bot**
   ```bash
   # Message @BotFather on Telegram
   # Use /newbot command
   # Get your bot token
   ```

2. **Set up Telegram Bot Handler**
   ```javascript
   // telegram-bot.js
   const TelegramBot = require('node-telegram-bot-api');
   const { botService } = require('./src/services/botService');
   
   const token = process.env.TELEGRAM_BOT_TOKEN;
   const bot = new TelegramBot(token, { polling: true });
   
   bot.on('message', async (msg) => {
     const chatId = msg.chat.id;
     const text = msg.text;
     
     if (text === '/start') {
       await bot.sendMessage(chatId, 
         'Welcome to FundiConnect! 🔧\n\n' +
         'I can help you find service providers. Just tell me what you need!\n\n' +
         'Examples:\n' +
         '• "I need a plumber"\n' +
         '• "Looking for house cleaning"\n' +
         '• "Need an electrician"'
       );
       return;
     }
     
     // Show typing indicator
     await bot.sendChatAction(chatId, 'typing');
     
     try {
       const responses = await botService.processMessage(text);
       
       for (const response of responses) {
         if (response.type === 'quotation' && response.data) {
           // Send quotations as inline keyboard
           const keyboard = {
             inline_keyboard: response.data.map(q => [{
               text: `${q.providerName} - KSh ${q.estimatedCost.toLocaleString()}`,
               callback_data: `book_${q.providerId}`
             }])
           };
           
           await bot.sendMessage(chatId, response.text, {
             reply_markup: keyboard
           });
         } else {
           await bot.sendMessage(chatId, response.text);
         }
       }
     } catch (error) {
       await bot.sendMessage(chatId, 
         'Sorry, I encountered an error. Please try again.'
       );
     }
   });
   
   // Handle booking callbacks
   bot.on('callback_query', async (callbackQuery) => {
     const message = callbackQuery.message;
     const data = callbackQuery.data;
     
     if (data.startsWith('book_')) {
       const providerId = data.replace('book_', '');
       
       await bot.sendMessage(message.chat.id,
         `Great! I'll help you book this provider. Please visit our website to complete the booking: https://fundiconnect.com/book/${providerId}`
       );
     }
     
     await bot.answerCallbackQuery(callbackQuery.id);
   });
   ```

3. **Environment Variables**
   ```bash
   # .env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

## 🔧 Enhanced Bot Service for Multi-Platform

```javascript
// enhanced-bot-service.js
export class EnhancedBotService extends WhatsAppBotService {
  constructor() {
    super();
    this.platform = 'web'; // 'whatsapp', 'telegram', 'web'
  }
  
  setPlatform(platform) {
    this.platform = platform;
  }
  
  async processMessage(message, platform = this.platform) {
    const responses = await super.processMessage(message);
    
    // Format responses based on platform
    return responses.map(response => {
      switch (platform) {
        case 'whatsapp':
          return this.formatForWhatsApp(response);
        case 'telegram':
          return this.formatForTelegram(response);
        default:
          return response;
      }
    });
  }
  
  formatForWhatsApp(response) {
    if (response.type === 'quotation') {
      let formatted = response.text + '\n\n';
      response.data.forEach((q, index) => {
        formatted += `*${index + 1}. ${q.providerName}*\n`;
        formatted += `💰 KSh ${q.estimatedCost.toLocaleString()}\n`;
        formatted += `⭐ ${q.rating} (${q.responseTime})\n`;
        formatted += `📱 Reply with *${index + 1}* to book\n\n`;
      });
      return { ...response, text: formatted };
    }
    return response;
  }
  
  formatForTelegram(response) {
    if (response.type === 'quotation') {
      // Telegram will use inline keyboards
      return response;
    }
    return response;
  }
}
```

## 🚀 Deployment Options

### 1. Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Create Heroku app
heroku create fundiconnect-bot

# Set environment variables
heroku config:set WHATSAPP_TOKEN=your_token
heroku config:set TELEGRAM_BOT_TOKEN=your_token

# Deploy
git push heroku main
```

### 2. Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 3. Vercel Deployment (Serverless)
```javascript
// api/webhook.js
import { botService } from '../src/services/botService';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Handle WhatsApp/Telegram webhooks
    const responses = await botService.processMessage(req.body.message);
    res.json({ responses });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

## 📊 Analytics & Monitoring

```javascript
// analytics.js
export class BotAnalytics {
  static trackMessage(platform, userId, message) {
    // Track user interactions
    console.log(`[${platform}] User ${userId}: ${message}`);
  }
  
  static trackBooking(providerId, userId, platform) {
    // Track successful bookings
    console.log(`Booking: Provider ${providerId} by User ${userId} via ${platform}`);
  }
  
  static trackError(error, platform) {
    // Track errors for debugging
    console.error(`[${platform}] Error:`, error);
  }
}
```

## 🔐 Security Considerations

1. **Webhook Security**
   - Verify webhook signatures
   - Use HTTPS endpoints
   - Implement rate limiting

2. **Data Privacy**
   - Don't store sensitive user data
   - Implement data retention policies
   - Comply with GDPR/local regulations

3. **API Security**
   - Secure API tokens
   - Use environment variables
   - Implement proper authentication

## 📱 Testing

```javascript
// test-bot.js
const { botService } = require('./src/services/botService');

async function testBot() {
  const testMessages = [
    "I need a plumber",
    "Looking for house cleaning in Westlands",
    "How much does electrical work cost?"
  ];
  
  for (const message of testMessages) {
    console.log(`\nUser: ${message}`);
    const responses = await botService.processMessage(message);
    responses.forEach(response => {
      console.log(`Bot: ${response.text}`);
    });
  }
}

testBot();
```

This integration guide provides everything needed to deploy the FundiConnect AI bot to real WhatsApp and Telegram platforms, enabling users to interact with your service marketplace through their preferred messaging apps.