const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

// Import your bot service (you'll need to adapt this for Node.js)
// For now, we'll create a simplified version
class SimpleBotService {
  async processMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // Simple intent recognition
    if (lowerMessage.includes('plumber') || lowerMessage.includes('plumbing')) {
      return [{
        text: `🔧 *Plumbing Services Available*\n\n` +
              `I found these top plumbers for you:\n\n` +
              `1. *John Kamau* - KSh 1,500/hr\n` +
              `   ⭐ 4.8 rating | Westlands\n` +
              `   📱 Responds in < 30 mins\n\n` +
              `2. *Peter Mwangi* - KSh 1,800/hr\n` +
              `   ⭐ 4.7 rating | CBD\n` +
              `   📱 Responds in < 45 mins\n\n` +
              `Reply with the number to book or visit: https://fundiconnect.com`
      }];
    }
    
    if (lowerMessage.includes('clean') || lowerMessage.includes('cleaning')) {
      return [{
        text: `🧹 *Cleaning Services Available*\n\n` +
              `I found these top cleaners for you:\n\n` +
              `1. *Mary Wanjiku* - KSh 800/hr\n` +
              `   ⭐ 4.9 rating | Karen\n` +
              `   📱 Responds in < 15 mins\n\n` +
              `2. *Grace Nyambura* - KSh 1,000/hr\n` +
              `   ⭐ 4.8 rating | Kilimani\n` +
              `   📱 Responds in < 20 mins\n\n` +
              `Reply with the number to book or visit: https://fundiconnect.com`
      }];
    }
    
    if (lowerMessage.includes('electric') || lowerMessage.includes('electrical')) {
      return [{
        text: `⚡ *Electrical Services Available*\n\n` +
              `I found these top electricians for you:\n\n` +
              `1. *Peter Mwangi* - KSh 2,000/hr\n` +
              `   ⭐ 4.7 rating | CBD\n` +
              `   📱 Responds in < 45 mins\n\n` +
              `2. *David Kiprop* - KSh 1,800/hr\n` +
              `   ⭐ 4.6 rating | Kasarani\n` +
              `   📱 Responds in < 1 hour\n\n` +
              `Reply with the number to book or visit: https://fundiconnect.com`
      }];
    }
    
    if (lowerMessage.includes('mason') || lowerMessage.includes('masonry') || lowerMessage.includes('stone')) {
      return [{
        text: `🧱 *Masonry Services Available*\n\n` +
              `I found these top masons for you:\n\n` +
              `1. *James Muthoni* - KSh 2,200/hr\n` +
              `   ⭐ 4.7 rating | Embakasi\n` +
              `   📱 Responds in < 1 hour\n\n` +
              `2. *Michael Ochieng* - KSh 1,900/hr\n` +
              `   ⭐ 4.5 rating | Kahawa\n` +
              `   📱 Responds in < 2 hours\n\n` +
              `Reply with the number to book or visit: https://fundiconnect.com`
      }];
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage === '/start') {
      return [{
        text: `👋 *Welcome to FundiConnect!*\n\n` +
              `I'm your AI assistant ready to help you find trusted service providers in Kenya.\n\n` +
              `🔧 Just tell me what you need:\n` +
              `• "I need a plumber"\n` +
              `• "Looking for house cleaning"\n` +
              `• "Need an electrician"\n` +
              `• "Want a mason for stonework"\n\n` +
              `I'll find the best providers with instant quotations! 🚀`
      }];
    }
    
    // Default response
    return [{
      text: `🤖 *FundiConnect AI Assistant*\n\n` +
            `I can help you find:\n` +
            `🔧 Plumbers\n` +
            `🧹 Cleaners\n` +
            `⚡ Electricians\n` +
            `💄 Beauty services\n` +
            `🪚 Carpenters\n` +
            `📚 Tutors\n` +
            `🧱 Masons\n\n` +
            `Just describe what service you need!`
    }];
  }
}

const botService = new SimpleBotService();

// Initialize WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});

// Generate QR code for authentication
client.on('qr', (qr) => {
  console.log('\n🔗 Scan this QR code with your WhatsApp to connect:');
  qrcode.generate(qr, { small: true });
  console.log('\n📱 Open WhatsApp → Settings → Linked Devices → Link a Device');
});

// Client ready
client.on('ready', () => {
  console.log('✅ FundiConnect WhatsApp Bot is ready!');
  console.log('🤖 Users can now message your WhatsApp number to get service provider recommendations');
});

// Handle authentication
client.on('authenticated', () => {
  console.log('🔐 WhatsApp client authenticated successfully');
});

// Handle authentication failure
client.on('auth_failure', (msg) => {
  console.error('❌ Authentication failed:', msg);
});

// Handle disconnection
client.on('disconnected', (reason) => {
  console.log('📱 WhatsApp client disconnected:', reason);
});

// Handle incoming messages
client.on('message', async (message) => {
  try {
    // Skip group messages and status updates
    if (message.from.includes('@g.us') || message.from.includes('status@broadcast')) {
      return;
    }
    
    // Skip messages from self
    if (message.fromMe) {
      return;
    }
    
    console.log(`📨 Message from ${message.from}: ${message.body}`);
    
    // Process message with bot service
    const responses = await botService.processMessage(message.body);
    
    // Send responses
    for (const response of responses) {
      await message.reply(response.text);
      
      // Add small delay between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`✅ Responded to ${message.from}`);
    
  } catch (error) {
    console.error('❌ Error handling message:', error);
    
    // Send error message to user
    try {
      await message.reply(
        '🤖 Sorry, I encountered an error. Please try again or visit our website: https://fundiconnect.com'
      );
    } catch (replyError) {
      console.error('❌ Error sending error message:', replyError);
    }
  }
});

// Initialize the client
console.log('🚀 Starting FundiConnect WhatsApp Bot...');
client.initialize();

// Optional: Create a simple web server for health checks
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.json({ 
    status: 'running', 
    service: 'FundiConnect WhatsApp Bot',
    timestamp: new Date().toISOString()
  });
});

app.get('/status', (req, res) => {
  res.json({
    whatsapp_connected: client.info ? true : false,
    uptime: process.uptime(),
    memory_usage: process.memoryUsage()
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Health check server running on port ${PORT}`);
  console.log(`📊 Visit http://localhost:${PORT}/health for status`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down FundiConnect WhatsApp Bot...');
  await client.destroy();
  process.exit(0);
});