const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Enhanced WhatsApp Bot Service
class WhatsAppBotService {
  constructor() {
    this.providers = [
      {
        id: '1',
        name: 'John Kamau',
        category: 'Plumbing',
        rating: 4.8,
        reviews: 124,
        hourlyRate: 1500,
        location: 'Nairobi, Westlands',
        responseTime: '< 30 mins',
        services: ['Pipe Installation', 'Leak Repairs', 'Drain Cleaning', 'Water Heater Service'],
        phone: '+254700123456',
        image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
      },
      {
        id: '2',
        name: 'Mary Wanjiku',
        category: 'Cleaning',
        rating: 4.9,
        reviews: 89,
        hourlyRate: 800,
        location: 'Nairobi, Karen',
        responseTime: '< 15 mins',
        services: ['House Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Move-in/out Cleaning'],
        phone: '+254700234567',
        image: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg'
      },
      {
        id: '3',
        name: 'Peter Mwangi',
        category: 'Electrical',
        rating: 4.7,
        reviews: 156,
        hourlyRate: 2000,
        location: 'Nairobi, CBD',
        responseTime: '< 45 mins',
        services: ['Wiring Installation', 'Electrical Repairs', 'Security Systems', 'Solar Installation'],
        phone: '+254700345678',
        image: 'https://images.pexels.com/photos/1472443/pexels-photo-1472443.jpeg'
      },
      {
        id: '4',
        name: 'Grace Nyambura',
        category: 'Beauty',
        rating: 5.0,
        reviews: 67,
        hourlyRate: 3000,
        location: 'Nairobi, Kilimani',
        responseTime: '< 20 mins',
        services: ['Bridal Makeup', 'Hair Styling', 'Manicure/Pedicure', 'Facial Treatments'],
        phone: '+254700456789',
        image: 'https://images.pexels.com/photos/3373714/pexels-photo-3373714.jpeg'
      },
      {
        id: '5',
        name: 'James Muthoni',
        category: 'Masonry',
        rating: 4.7,
        reviews: 142,
        hourlyRate: 2200,
        location: 'Nairobi, Embakasi',
        responseTime: '< 1 hour',
        services: ['Stone Wall Construction', 'Brick Laying', 'Concrete Work', 'Foundation Repair'],
        phone: '+254700567890',
        image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg'
      }
    ];

    this.userSessions = new Map(); // Store user conversation state
  }

  // Advanced intent recognition
  recognizeIntent(message, userId) {
    const lowerMessage = message.toLowerCase();
    
    const servicePatterns = {
      plumbing: ['plumber', 'pipe', 'leak', 'drain', 'water', 'plumbing', 'toilet', 'sink', 'faucet', 'bathroom'],
      cleaning: ['clean', 'cleaning', 'house clean', 'office clean', 'deep clean', 'maid', 'housekeeping'],
      electrical: ['electrician', 'wiring', 'electrical', 'power', 'socket', 'electric', 'lights', 'electricity'],
      beauty: ['makeup', 'hair', 'beauty', 'manicure', 'facial', 'styling', 'salon', 'spa', 'nails'],
      carpentry: ['carpenter', 'furniture', 'wood', 'cabinet', 'door', 'repair', 'woodwork', 'table', 'chair'],
      tutoring: ['tutor', 'teach', 'math', 'science', 'study', 'lesson', 'education', 'homework'],
      masonry: ['mason', 'stone', 'brick', 'wall', 'foundation', 'concrete', 'masonry', 'stonework', 'construction']
    };

    // Location extraction (improved)
    const locationPatterns = [
      /(?:in|at|near|around)\s+([a-zA-Z\s]+?)(?:\s|$|,|\.|!|\?)/i,
      /([a-zA-Z\s]+?)\s+area/i,
      /(westlands|karen|cbd|kilimani|kasarani|embakasi|lavington|kileleshwa|runda|muthaiga|gigiri|spring valley|riverside|parklands|eastleigh|south c|south b|langata|adams arcade|ngong road|thika road|mombasa road)/i
    ];

    let location = null;
    for (const pattern of locationPatterns) {
      const match = lowerMessage.match(pattern);
      if (match) {
        location = match[1] ? match[1].trim() : match[0].trim();
        break;
      }
    }

    // Service detection
    let detectedService = null;
    let confidence = 0;
    
    for (const [service, keywords] of Object.entries(servicePatterns)) {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
      if (matches.length > 0) {
        const currentConfidence = matches.length / keywords.length;
        if (currentConfidence > confidence) {
          confidence = currentConfidence;
          detectedService = service;
        }
      }
    }

    // Urgency detection
    const urgencyKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'now', 'today', 'quick'];
    const isUrgent = urgencyKeywords.some(keyword => lowerMessage.includes(keyword));

    // Budget detection
    const budgetMatch = lowerMessage.match(/(?:budget|price|cost|pay|spend).*?(\d+)/i);
    const budget = budgetMatch ? parseInt(budgetMatch[1]) : null;

    // Intent classification
    let intent = 'general';
    if (detectedService) {
      intent = 'service_request';
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('start')) {
      intent = 'greeting';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate')) {
      intent = 'pricing_inquiry';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      intent = 'help';
    } else if (lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
      intent = 'booking';
    } else if (/^\d+$/.test(message.trim())) {
      intent = 'selection';
    }

    return {
      intent,
      entities: {
        service: detectedService,
        location: location,
        urgent: isUrgent,
        budget: budget,
        confidence: confidence
      }
    };
  }

  // Enhanced provider matching with scoring
  matchProviders(service, location, budget, urgent = false) {
    try {
      let matches = this.providers.filter(provider => 
        provider.category.toLowerCase() === service.toLowerCase()
      );

      // Location filtering
      if (location) {
        const locationMatches = matches.filter(provider =>
          provider.location.toLowerCase().includes(location.toLowerCase())
        );
        if (locationMatches.length > 0) {
          matches = locationMatches;
        }
      }

      // Budget filtering
      if (budget) {
        matches = matches.filter(provider => provider.hourlyRate <= budget * 1.2); // 20% tolerance
      }

      // Scoring and sorting
      matches = matches.map(provider => ({
        ...provider,
        score: this.calculateProviderScore(provider, urgent, budget)
      })).sort((a, b) => b.score - a.score);

      return matches.slice(0, 3);
    } catch (error) {
      console.error('Error matching providers:', error);
      return [];
    }
  }

  calculateProviderScore(provider, urgent, budget) {
    let score = 0;
    
    // Rating weight (40%)
    score += provider.rating * 8;
    
    // Reviews weight (20%)
    score += Math.min(provider.reviews / 10, 10);
    
    // Response time weight (30% - higher for urgent)
    const responseWeight = urgent ? 20 : 10;
    if (provider.responseTime.includes('< 15')) score += responseWeight;
    else if (provider.responseTime.includes('< 30')) score += responseWeight * 0.8;
    else if (provider.responseTime.includes('< 1 hour')) score += responseWeight * 0.6;
    else score += responseWeight * 0.4;
    
    // Budget compatibility (10%)
    if (budget && provider.hourlyRate <= budget) {
      score += 5;
    }
    
    return score;
  }

  // Generate detailed quotations
  generateQuotation(provider, serviceType, urgent = false) {
    try {
      const baseRate = provider.hourlyRate;
      const urgencyMultiplier = urgent ? 1.2 : 1;
      const complexity = Math.random() * 0.5 + 0.5;
      const hours = Math.ceil(complexity * 3);
      const estimatedCost = Math.round(baseRate * urgencyMultiplier * hours);
      
      return {
        id: `quote_${provider.id}_${Date.now()}`,
        providerId: provider.id,
        providerName: provider.name,
        service: serviceType,
        estimatedCost,
        baseRate: baseRate,
        hours: hours,
        urgencyFee: urgent ? Math.round(baseRate * 0.2 * hours) : 0,
        responseTime: provider.responseTime,
        rating: provider.rating,
        location: provider.location,
        phone: provider.phone,
        services: provider.services
      };
    } catch (error) {
      console.error('Error generating quotation:', error);
      return null;
    }
  }

  // Process messages with context awareness
  async processMessage(message, userId, userName = 'User') {
    try {
      const { intent, entities } = this.recognizeIntent(message, userId);
      const responses = [];

      // Get or create user session
      if (!this.userSessions.has(userId)) {
        this.userSessions.set(userId, {
          lastService: null,
          lastProviders: [],
          conversationStep: 'initial'
        });
      }

      const session = this.userSessions.get(userId);

      switch (intent) {
        case 'greeting':
          responses.push({
            text: `👋 Hello ${userName}! Welcome to *FundiConnect*!\n\n` +
                  `I'm your AI assistant ready to help you find trusted service providers in Kenya. 🇰🇪\n\n` +
                  `🔧 *Available Services:*\n` +
                  `• 🚰 Plumbing\n` +
                  `• 🧹 Cleaning\n` +
                  `• ⚡ Electrical\n` +
                  `• 💄 Beauty & Wellness\n` +
                  `• 🪚 Carpentry\n` +
                  `• 📚 Tutoring\n` +
                  `• 🧱 Masonry\n\n` +
                  `Just tell me what you need! For example:\n` +
                  `_"I need a plumber for a leaking pipe"_\n` +
                  `_"Looking for house cleaning in Westlands"_`,
            type: 'text'
          });
          session.conversationStep = 'service_selection';
          break;

        case 'service_request':
          const service = entities.service;
          const location = entities.location;
          const urgent = entities.urgent;
          const budget = entities.budget;
          
          if (!service) {
            responses.push({
              text: `🤔 I'd love to help! Could you please specify what service you need?\n\n` +
                    `For example:\n` +
                    `• "I need a plumber"\n` +
                    `• "Looking for cleaning service"\n` +
                    `• "Need an electrician"`,
              type: 'text'
            });
            break;
          }

          // Store service in session
          session.lastService = service;
          session.conversationStep = 'showing_providers';

          responses.push({
            text: `🔍 Searching for ${service} providers${location ? ` in ${location}` : ''}${urgent ? ' (URGENT)' : ''}...\n\n` +
                  `Please wait while I find the best matches for you! ⏳`,
            type: 'text'
          });

          // Find matching providers
          const matches = this.matchProviders(service, location, budget, urgent);
          
          if (matches.length > 0) {
            const quotations = matches.map(provider => 
              this.generateQuotation(provider, service, urgent)
            ).filter(q => q !== null);

            session.lastProviders = quotations;

            if (quotations.length > 0) {
              let quotationText = `✨ *Found ${quotations.length} excellent ${service} providers!*\n\n`;
              
              quotations.forEach((q, index) => {
                quotationText += `*${index + 1}. ${q.providerName}*\n`;
                quotationText += `💰 KSh ${q.estimatedCost.toLocaleString()} (${q.hours} hours)\n`;
                quotationText += `⭐ ${q.rating} rating | ${q.responseTime}\n`;
                quotationText += `📍 ${q.location}\n`;
                if (q.urgencyFee > 0) {
                  quotationText += `🚨 Urgency fee: KSh ${q.urgencyFee.toLocaleString()}\n`;
                }
                quotationText += `\n`;
              });

              quotationText += `💡 *Reply with a number (1-${quotations.length}) to get contact details*\n`;
              quotationText += `📱 Or type "book [number]" to schedule an appointment`;

              responses.push({
                text: quotationText,
                type: 'quotation',
                data: quotations
              });
            }
          } else {
            responses.push({
              text: `😔 No ${service} providers found${location ? ` in ${location}` : ''}.\n\n` +
                    `Would you like me to:\n` +
                    `• Expand the search area?\n` +
                    `• Look for a different service?\n` +
                    `• Show all available services?`,
              type: 'text'
            });
          }
          break;

        case 'selection':
          const selection = parseInt(message.trim());
          if (session.lastProviders && selection >= 1 && selection <= session.lastProviders.length) {
            const selectedProvider = session.lastProviders[selection - 1];
            
            responses.push({
              text: `📞 *Contact ${selectedProvider.providerName}*\n\n` +
                    `📱 Phone: ${selectedProvider.phone}\n` +
                    `⭐ Rating: ${selectedProvider.rating}/5.0\n` +
                    `📍 Location: ${selectedProvider.location}\n` +
                    `⏰ Response Time: ${selectedProvider.responseTime}\n\n` +
                    `🔧 *Services offered:*\n` +
                    selectedProvider.services.map(s => `• ${s}`).join('\n') + '\n\n' +
                    `💡 *To book:* Call directly or type "book ${selection}" for appointment scheduling`,
              type: 'contact'
            });
          } else {
            responses.push({
              text: `❌ Invalid selection. Please choose a number between 1 and ${session.lastProviders?.length || 0}`,
              type: 'text'
            });
          }
          break;

        case 'booking':
          responses.push({
            text: `📅 *Booking Assistant*\n\n` +
                  `To complete your booking, I'll need:\n` +
                  `• Your preferred date and time\n` +
                  `• Service location address\n` +
                  `• Brief description of the work needed\n\n` +
                  `🌐 For instant booking, visit: https://fundiconnect.com\n` +
                  `📱 Or continue here by providing the details above`,
            type: 'text'
          });
          session.conversationStep = 'booking_details';
          break;

        case 'pricing_inquiry':
          responses.push({
            text: `💰 *FundiConnect Pricing Guide*\n\n` +
                  `Our rates vary by service and provider:\n\n` +
                  `🚰 *Plumbing:* KSh 1,200 - 2,500/hr\n` +
                  `🧹 *Cleaning:* KSh 600 - 1,500/hr\n` +
                  `⚡ *Electrical:* KSh 1,500 - 3,000/hr\n` +
                  `💄 *Beauty:* KSh 2,000 - 5,000/hr\n` +
                  `🪚 *Carpentry:* KSh 1,000 - 2,500/hr\n` +
                  `📚 *Tutoring:* KSh 1,500 - 3,500/hr\n` +
                  `🧱 *Masonry:* KSh 1,800 - 2,800/hr\n\n` +
                  `💡 *Get exact quotes by telling me what service you need!*`,
            type: 'text'
          });
          break;

        case 'help':
          responses.push({
            text: `🆘 *FundiConnect Help Center*\n\n` +
                  `*How to use this service:*\n` +
                  `1️⃣ Tell me what service you need\n` +
                  `2️⃣ I'll find the best providers\n` +
                  `3️⃣ Get instant quotations\n` +
                  `4️⃣ Contact or book directly\n\n` +
                  `*Example messages:*\n` +
                  `• "I need a plumber for leak repair"\n` +
                  `• "Looking for house cleaning in Karen"\n` +
                  `• "Need an electrician urgently"\n\n` +
                  `*Features:*\n` +
                  `✅ AI-powered matching\n` +
                  `✅ Instant quotations\n` +
                  `✅ Verified providers\n` +
                  `✅ Real-time availability\n\n` +
                  `Need more help? Visit: https://fundiconnect.com/help`,
            type: 'text'
          });
          break;

        default:
          responses.push({
            text: `🤖 I'm here to help you find service providers!\n\n` +
                  `Try asking for services like:\n` +
                  `• "I need a plumber"\n` +
                  `• "Looking for house cleaning"\n` +
                  `• "Need an electrician"\n` +
                  `• "Want a makeup artist"\n\n` +
                  `What service can I help you find today? 🔍`,
            type: 'text'
          });
      }

      // Update session
      this.userSessions.set(userId, session);
      
      return responses;
    } catch (error) {
      console.error('Error processing message:', error);
      return [{
        text: `🤖 Sorry, I encountered an error. Please try again or visit our website: https://fundiconnect.com`,
        type: 'text'
      }];
    }
  }

  // Generate follow-up messages
  generateFollowUp(userId) {
    const session = this.userSessions.get(userId);
    if (session && session.lastService) {
      return {
        text: `👋 Hi! How did your ${session.lastService} service go? We'd love to hear your feedback! ⭐\n\n` +
              `Reply with a rating (1-5) and any comments.`,
        type: 'followup'
      };
    }
    return null;
  }
}

// Initialize bot service
const botService = new WhatsAppBotService();

// WhatsApp Client Configuration
const sessionName = process.env.WHATSAPP_SESSION_NAME || 'fundiconnect-session';
const debugMode = process.env.WHATSAPP_DEBUG === 'true';

console.log('🚀 Initializing FundiConnect WhatsApp Bot...');
console.log(`📱 Session: ${sessionName}`);
console.log(`🔍 Debug mode: ${debugMode ? 'ON' : 'OFF'}`);

// Create WhatsApp client with enhanced configuration
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: sessionName,
    dataPath: './whatsapp-sessions'
  }),
  puppeteer: {
    headless: !debugMode,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  }
});

// QR Code Generation
client.on('qr', (qr) => {
  console.log('\n🔗 WhatsApp QR Code:');
  console.log('=====================================');
  qrcode.generate(qr, { small: true });
  console.log('=====================================');
  console.log('📱 Steps to connect:');
  console.log('1. Open WhatsApp on your phone');
  console.log('2. Go to Settings → Linked Devices');
  console.log('3. Tap "Link a Device"');
  console.log('4. Scan the QR code above');
  console.log('=====================================\n');
});

// Authentication Events
client.on('authenticated', () => {
  console.log('✅ WhatsApp authentication successful!');
});

client.on('auth_failure', (msg) => {
  console.error('❌ WhatsApp authentication failed:', msg);
  console.log('💡 Try deleting the session folder and scanning QR again');
});

client.on('ready', async () => {
  console.log('🎉 FundiConnect WhatsApp Bot is ready!');
  
  try {
    const info = client.info;
    console.log(`📱 Connected as: ${info.pushname}`);
    console.log(`📞 Phone: ${info.wid.user}`);
    console.log(`🤖 Bot is now active and ready to help users!`);
  } catch (error) {
    console.log('✅ Bot is ready (info not available yet)');
  }
});

// Disconnection handling
client.on('disconnected', (reason) => {
  console.log('📱 WhatsApp disconnected:', reason);
  console.log('🔄 Attempting to reconnect...');
});

// Message handling with enhanced features
client.on('message', async (message) => {
  try {
    // Skip group messages, status updates, and own messages
    if (message.from.includes('@g.us') || 
        message.from.includes('status@broadcast') || 
        message.fromMe) {
      return;
    }

    const contact = await message.getContact();
    const userName = contact.pushname || contact.name || 'User';
    const userId = message.from;

    console.log(`📨 Message from ${userName} (${userId}): ${message.body}`);

    // Handle different message types
    if (message.type === 'chat') {
      // Process text message
      const responses = await botService.processMessage(message.body, userId, userName);
      
      // Send responses with typing indicator
      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        
        // Show typing indicator
        await message.reply('⏳ _Typing..._');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Send actual response
        await message.reply(response.text);
        
        // Small delay between messages
        if (i < responses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
      
      console.log(`✅ Responded to ${userName}`);
      
    } else if (message.type === 'location') {
      // Handle location sharing
      const location = message.location;
      await message.reply(
        `📍 Thanks for sharing your location!\n\n` +
        `Latitude: ${location.latitude}\n` +
        `Longitude: ${location.longitude}\n\n` +
        `I'll find service providers near you. What service do you need?`
      );
      
    } else if (message.hasMedia) {
      // Handle media messages
      await message.reply(
        `📎 I received your ${message.type}. For service requests, please send a text message describing what you need.\n\n` +
        `Example: "I need a plumber for a leaking pipe"`
      );
    }
    
  } catch (error) {
    console.error('❌ Error handling message:', error);
    
    try {
      await message.reply(
        '🤖 Sorry, I encountered an error. Please try again or visit our website: https://fundiconnect.com'
      );
    } catch (replyError) {
      console.error('❌ Error sending error message:', replyError);
    }
  }
});

// Group message handling (optional)
client.on('message', async (message) => {
  if (message.from.includes('@g.us') && message.body.includes('@fundiconnect')) {
    try {
      await message.reply(
        '👋 Hi! I\'m the FundiConnect assistant. For personalized service recommendations, please message me directly.\n\n' +
        '🔗 Visit: https://fundiconnect.com'
      );
    } catch (error) {
      console.error('Error responding to group mention:', error);
    }
  }
});

// Initialize client
console.log('🔄 Starting WhatsApp client...');
client.initialize();

// Health check server
const app = express();
const PORT = process.env.WHATSAPP_PORT || 3001;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  const clientState = client.info ? 'connected' : 'disconnected';
  
  res.json({
    status: 'running',
    service: 'FundiConnect WhatsApp Bot',
    whatsapp_status: clientState,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    session: sessionName,
    active_sessions: botService.userSessions.size
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    whatsapp_connected: client.info ? true : false,
    uptime: process.uptime(),
    memory_usage: process.memoryUsage(),
    active_users: botService.userSessions.size,
    session_name: sessionName
  });
});

// Send message endpoint (for testing)
app.post('/send-message', async (req, res) => {
  try {
    const { number, message } = req.body;
    
    if (!number || !message) {
      return res.status(400).json({ error: 'Number and message are required' });
    }
    
    const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
    await client.sendMessage(chatId, message);
    
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Health check server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Status: http://localhost:${PORT}/status`);
});

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down WhatsApp Bot...`);
  
  try {
    console.log('💾 Saving user sessions...');
    // Save sessions to file if needed
    
    console.log('📱 Closing WhatsApp client...');
    await client.destroy();
    
    console.log('✅ Shutdown complete');
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  }
  
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

console.log('✅ FundiConnect WhatsApp Bot initialized successfully!');