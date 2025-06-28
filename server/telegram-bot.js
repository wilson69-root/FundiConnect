const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// Enhanced Bot Service for Telegram
class TelegramBotService {
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
        services: ['Pipe Installation', 'Leak Repairs', 'Drain Cleaning', 'Water Heater Service']
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
        services: ['House Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Move-in/out Cleaning']
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
        services: ['Wiring Installation', 'Electrical Repairs', 'Security Systems', 'Solar Installation']
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
        services: ['Bridal Makeup', 'Hair Styling', 'Manicure/Pedicure', 'Facial Treatments']
      },
      {
        id: '5',
        name: 'David Kiprop',
        category: 'Carpentry',
        rating: 4.6,
        reviews: 98,
        hourlyRate: 1800,
        location: 'Nairobi, Kasarani',
        responseTime: '< 1 hour',
        services: ['Custom Furniture', 'Kitchen Cabinets', 'Door Installation', 'Home Repairs']
      },
      {
        id: '6',
        name: 'Sarah Atieno',
        category: 'Tutoring',
        rating: 4.9,
        reviews: 234,
        hourlyRate: 2500,
        location: 'Nairobi, Lavington',
        responseTime: '< 10 mins',
        services: ['Mathematics Tutoring', 'Physics', 'Chemistry', 'KCSE Preparation']
      },
      {
        id: '7',
        name: 'James Muthoni',
        category: 'Masonry',
        rating: 4.7,
        reviews: 142,
        hourlyRate: 2200,
        location: 'Nairobi, Embakasi',
        responseTime: '< 1 hour',
        services: ['Stone Wall Construction', 'Brick Laying', 'Concrete Work', 'Foundation Repair']
      }
    ];
  }

  recognizeIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    const servicePatterns = {
      plumbing: ['plumber', 'pipe', 'leak', 'drain', 'water', 'plumbing', 'toilet', 'sink'],
      cleaning: ['clean', 'cleaning', 'house clean', 'office clean', 'deep clean', 'maid'],
      electrical: ['electrician', 'wiring', 'electrical', 'power', 'socket', 'electric', 'lights'],
      beauty: ['makeup', 'hair', 'beauty', 'manicure', 'facial', 'styling', 'salon'],
      carpentry: ['carpenter', 'furniture', 'wood', 'cabinet', 'door', 'repair', 'woodwork'],
      tutoring: ['tutor', 'teach', 'math', 'science', 'study', 'lesson', 'education'],
      masonry: ['mason', 'stone', 'brick', 'wall', 'foundation', 'concrete', 'masonry', 'stonework']
    };

    // Location extraction
    const locationMatch = lowerMessage.match(/in\s+(\w+)|at\s+(\w+)|(\w+)\s+area/);
    const location = locationMatch ? locationMatch[1] || locationMatch[2] || locationMatch[3] : null;

    // Find matching service category
    let detectedService = null;
    for (const [service, keywords] of Object.entries(servicePatterns)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedService = service;
        break;
      }
    }

    // Determine intent
    let intent = 'general';
    if (detectedService) {
      intent = 'service_request';
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('start')) {
      intent = 'greeting';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate')) {
      intent = 'pricing_inquiry';
    } else if (lowerMessage.includes('help')) {
      intent = 'help';
    }

    return {
      intent,
      entities: {
        service: detectedService,
        location: location
      }
    };
  }

  matchProviders(service, location) {
    let matches = this.providers.filter(provider => 
      provider.category.toLowerCase() === service.toLowerCase()
    );

    if (location) {
      matches = matches.filter(provider =>
        provider.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    return matches.slice(0, 3);
  }

  generateQuotation(provider, serviceType) {
    const baseRate = provider.hourlyRate;
    const complexity = Math.random() * 0.5 + 0.5;
    const estimatedCost = Math.round(baseRate * complexity * (2 + Math.random() * 2));
    
    return {
      id: `quote_${provider.id}_${Date.now()}`,
      providerId: provider.id,
      providerName: provider.name,
      service: serviceType,
      estimatedCost,
      duration: `${Math.ceil(complexity * 3)} hours`,
      responseTime: provider.responseTime,
      rating: provider.rating,
      location: provider.location
    };
  }

  escapeMarkdown(text) {
    return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
  }

  async processMessage(message) {
    const { intent, entities } = this.recognizeIntent(message);
    const responses = [];

    switch (intent) {
      case 'greeting':
        responses.push({
          text: `👋 *Welcome to FundiConnect\\!*\n\n` +
                `I'm your AI assistant ready to help you find trusted service providers in Kenya\\.\n\n` +
                `🔧 *Available Services:*\n` +
                `• Plumbing 🚰\n` +
                `• Cleaning 🧹\n` +
                `• Electrical ⚡\n` +
                `• Beauty 💄\n` +
                `• Carpentry 🪚\n` +
                `• Tutoring 📚\n` +
                `• Masonry 🧱\n\n` +
                `Just tell me what you need\\! For example:\n` +
                `"I need a plumber" or "Looking for house cleaning"`,
          type: 'text',
          keyboard: [
            [
              { text: '🚰 Plumbing', callback_data: 'service_plumbing' },
              { text: '🧹 Cleaning', callback_data: 'service_cleaning' }
            ],
            [
              { text: '⚡ Electrical', callback_data: 'service_electrical' },
              { text: '💄 Beauty', callback_data: 'service_beauty' }
            ],
            [
              { text: '🪚 Carpentry', callback_data: 'service_carpentry' },
              { text: '📚 Tutoring', callback_data: 'service_tutoring' }
            ],
            [
              { text: '🧱 Masonry', callback_data: 'service_masonry' },
              { text: '🌐 Visit Website', url: 'https://fundiconnect.com' }
            ]
          ]
        });
        break;

      case 'service_request':
        const service = entities.service;
        const location = entities.location;
        
        responses.push({
          text: `🔍 *Searching for ${this.escapeMarkdown(service)} providers*${location ? ` in ${this.escapeMarkdown(location)}` : ''}\\.\\.\\.\n\n` +
                `Please wait while I find the best matches for you\\! ⏳`,
          type: 'text'
        });

        const matches = this.matchProviders(service, location);
        
        if (matches.length > 0) {
          const quotations = matches.map(provider => 
            this.generateQuotation(provider, service)
          );

          let quotationText = `✨ *Found ${quotations.length} excellent ${this.escapeMarkdown(service)} providers\\!*\n\n`;
          
          const keyboard = [];
          
          quotations.forEach((q, index) => {
            quotationText += `*${index + 1}\\. ${this.escapeMarkdown(q.providerName)}*\n`;
            quotationText += `💰 KSh ${q.estimatedCost.toLocaleString()} \\(${this.escapeMarkdown(q.duration)}\\)\n`;
            quotationText += `⭐ ${q.rating} rating \\| ${this.escapeMarkdown(q.responseTime)}\n`;
            quotationText += `📍 ${this.escapeMarkdown(q.location)}\n\n`;
            
            keyboard.push([
              { text: `📞 Call ${q.providerName}`, callback_data: `call_${q.providerId}` },
              { text: `📅 Book ${q.providerName}`, callback_data: `book_${q.providerId}` }
            ]);
          });

          keyboard.push([
            { text: '🌐 View All on Website', url: 'https://fundiconnect.com' },
            { text: '🔄 Search Again', callback_data: 'search_again' }
          ]);

          responses.push({
            text: quotationText + `💡 *Tip:* Click the buttons below to contact or book directly\\!`,
            type: 'quotation',
            keyboard: keyboard
          });
        } else {
          responses.push({
            text: `😔 *No ${this.escapeMarkdown(service)} providers found*${location ? ` in ${this.escapeMarkdown(location)}` : ''}\\.\n\n` +
                  `Would you like me to:\n` +
                  `• Expand the search area?\n` +
                  `• Look for a different service?\n` +
                  `• Show all available services?`,
            type: 'text',
            keyboard: [
              [
                { text: '🔍 Expand Search', callback_data: 'expand_search' },
                { text: '🔄 Different Service', callback_data: 'search_again' }
              ],
              [
                { text: '📋 All Services', callback_data: 'show_services' },
                { text: '🌐 Visit Website', url: 'https://fundiconnect.com' }
              ]
            ]
          });
        }
        break;

      case 'pricing_inquiry':
        responses.push({
          text: `💰 *FundiConnect Pricing Information*\n\n` +
                `Our rates vary by service and provider:\n\n` +
                `🚰 *Plumbing:* KSh 1,200 \\- 2,500/hr\n` +
                `🧹 *Cleaning:* KSh 600 \\- 1,500/hr\n` +
                `⚡ *Electrical:* KSh 1,500 \\- 3,000/hr\n` +
                `💄 *Beauty:* KSh 2,000 \\- 5,000/hr\n` +
                `🪚 *Carpentry:* KSh 1,000 \\- 2,500/hr\n` +
                `📚 *Tutoring:* KSh 1,500 \\- 3,500/hr\n` +
                `🧱 *Masonry:* KSh 1,800 \\- 2,800/hr\n\n` +
                `💡 *Get exact quotes by telling me what service you need\\!*`,
          type: 'text',
          keyboard: [
            [
              { text: '🔍 Get Quote', callback_data: 'get_quote' },
              { text: '🌐 View Website', url: 'https://fundiconnect.com' }
            ]
          ]
        });
        break;

      case 'help':
        responses.push({
          text: `🤖 *FundiConnect Help Center*\n\n` +
                `*How to use this bot:*\n` +
                `1\\. Tell me what service you need\n` +
                `2\\. I'll find the best providers\n` +
                `3\\. Get instant quotations\n` +
                `4\\. Contact or book directly\n\n` +
                `*Example messages:*\n` +
                `• "I need a plumber for leak repair"\n` +
                `• "Looking for house cleaning in Karen"\n` +
                `• "Need an electrician urgently"\n\n` +
                `*Features:*\n` +
                `✅ AI\\-powered matching\n` +
                `✅ Instant quotations\n` +
                `✅ Verified providers\n` +
                `✅ Real\\-time availability`,
          type: 'text',
          keyboard: [
            [
              { text: '🔍 Find Service', callback_data: 'search_again' },
              { text: '💰 View Pricing', callback_data: 'pricing' }
            ],
            [
              { text: '🌐 Visit Website', url: 'https://fundiconnect.com' }
            ]
          ]
        });
        break;

      default:
        responses.push({
          text: `🤖 *I'm here to help you find service providers\\!*\n\n` +
                `Try asking for services like:\n` +
                `• "I need a plumber"\n` +
                `• "Looking for house cleaning"\n` +
                `• "Need an electrician"\n` +
                `• "Want a makeup artist"\n` +
                `• "Need a carpenter"\n` +
                `• "Looking for a tutor"\n` +
                `• "Need a mason"\n\n` +
                `What service can I help you find today? 🔍`,
          type: 'text',
          keyboard: [
            [
              { text: '🚰 Plumbing', callback_data: 'service_plumbing' },
              { text: '🧹 Cleaning', callback_data: 'service_cleaning' }
            ],
            [
              { text: '⚡ Electrical', callback_data: 'service_electrical' },
              { text: '💄 Beauty', callback_data: 'service_beauty' }
            ],
            [
              { text: '📚 Tutoring', callback_data: 'service_tutoring' },
              { text: '🧱 Masonry', callback_data: 'service_masonry' }
            ]
          ]
        });
    }

    return responses;
  }
}

// Initialize bot service
const botService = new TelegramBotService();

// Get bot token from environment or use placeholder
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token || token === 'YOUR_TELEGRAM_BOT_TOKEN') {
  console.log('❌ Please set TELEGRAM_BOT_TOKEN environment variable');
  console.log('📱 Get your token from @BotFather on Telegram');
  console.log('💡 Example: export TELEGRAM_BOT_TOKEN="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"');
  process.exit(1);
}

// Create bot instance
const bot = new TelegramBot(token, { polling: true });

console.log('🚀 Starting FundiConnect Telegram Bot...');

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'there';
  
  console.log(`👋 New user started: ${firstName} (${chatId})`);
  
  try {
    const responses = await botService.processMessage('/start');
    
    for (const response of responses) {
      const options = { 
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true
      };
      
      if (response.keyboard) {
        options.reply_markup = {
          inline_keyboard: response.keyboard
        };
      }
      
      await bot.sendMessage(chatId, response.text, options);
    }
  } catch (error) {
    console.error('❌ Error in /start:', error);
    await bot.sendMessage(chatId, 'Welcome to FundiConnect! How can I help you find a service provider today?');
  }
});

// Handle /help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const responses = await botService.processMessage('help');
    
    for (const response of responses) {
      const options = { 
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true
      };
      
      if (response.keyboard) {
        options.reply_markup = {
          inline_keyboard: response.keyboard
        };
      }
      
      await bot.sendMessage(chatId, response.text, options);
    }
  } catch (error) {
    console.error('❌ Error in /help:', error);
    await bot.sendMessage(chatId, 'I can help you find service providers. Just tell me what you need!');
  }
});

// Handle all text messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const firstName = msg.from.first_name || 'User';
  
  // Skip commands
  if (!text || text.startsWith('/')) {
    return;
  }
  
  console.log(`📨 Message from ${firstName}: ${text}`);
  
  try {
    // Show typing indicator
    await bot.sendChatAction(chatId, 'typing');
    
    // Add small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Process with bot service
    const responses = await botService.processMessage(text);
    
    // Send responses
    for (const response of responses) {
      const options = { 
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true
      };
      
      if (response.keyboard) {
        options.reply_markup = {
          inline_keyboard: response.keyboard
        };
      }
      
      await bot.sendMessage(chatId, response.text, options);
      
      // Small delay between messages
      if (responses.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`✅ Responded to ${firstName}`);
    
  } catch (error) {
    console.error('❌ Error processing message:', error);
    
    try {
      await bot.sendMessage(chatId, 
        '🤖 Sorry, I encountered an error\\. Please try again or visit our website: https://fundiconnect\\.com',
        { parse_mode: 'MarkdownV2' }
      );
    } catch (replyError) {
      console.error('❌ Error sending error message:', replyError);
      // Fallback without markdown
      await bot.sendMessage(chatId, 
        '🤖 Sorry, I encountered an error. Please try again or visit our website: https://fundiconnect.com'
      );
    }
  }
});

// Handle callback queries (button presses)
bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;
  const chatId = message.chat.id;
  const firstName = callbackQuery.from.first_name || 'User';
  
  console.log(`🔘 Button pressed by ${firstName}: ${data}`);
  
  try {
    if (data.startsWith('service_')) {
      const service = data.replace('service_', '');
      const serviceMessage = `I need ${service}`;
      
      const responses = await botService.processMessage(serviceMessage);
      
      for (const response of responses) {
        const options = { 
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: true
        };
        
        if (response.keyboard) {
          options.reply_markup = {
            inline_keyboard: response.keyboard
          };
        }
        
        await bot.sendMessage(chatId, response.text, options);
      }
      
    } else if (data.startsWith('call_')) {
      const providerId = data.replace('call_', '');
      const provider = botService.providers.find(p => p.id === providerId);
      
      if (provider) {
        await bot.sendMessage(chatId,
          `📞 *Contact ${botService.escapeMarkdown(provider.name)}*\n\n` +
          `📱 Phone: \\+254 700 000 000\n` +
          `📍 Location: ${botService.escapeMarkdown(provider.location)}\n` +
          `⏰ Response Time: ${botService.escapeMarkdown(provider.responseTime)}\n\n` +
          `💡 *Or book online for instant confirmation:*`,
          { 
            parse_mode: 'MarkdownV2',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '📅 Book Online', url: `https://fundiconnect.com/book/${providerId}` },
                  { text: '🌐 View Profile', url: `https://fundiconnect.com/provider/${providerId}` }
                ],
                [
                  { text: '🔍 Find Other Providers', callback_data: 'search_again' }
                ]
              ]
            }
          }
        );
      }
      
    } else if (data.startsWith('book_')) {
      const providerId = data.replace('book_', '');
      const provider = botService.providers.find(p => p.id === providerId);
      
      if (provider) {
        await bot.sendMessage(chatId,
          `📅 *Book ${botService.escapeMarkdown(provider.name)}*\n\n` +
          `✨ *Quick Booking Options:*\n\n` +
          `🌐 *Online Booking* \\(Recommended\\)\n` +
          `• Instant confirmation\n` +
          `• Secure payment\n` +
          `• Calendar integration\n\n` +
          `📱 *Call Direct*\n` +
          `• Immediate response\n` +
          `• Custom arrangements\n` +
          `• Personal consultation`,
          { 
            parse_mode: 'MarkdownV2',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🌐 Book Online Now', url: `https://fundiconnect.com/book/${providerId}` }
                ],
                [
                  { text: '📞 Call Provider', callback_data: `call_${providerId}` },
                  { text: '💬 Chat Support', url: 'https://wa.me/254700000000' }
                ],
                [
                  { text: '🔍 Find Other Providers', callback_data: 'search_again' }
                ]
              ]
            }
          }
        );
      }
      
    } else if (data === 'search_again') {
      await bot.sendMessage(chatId,
        `🔍 *What service are you looking for?*\n\n` +
        `Just tell me what you need, for example:\n` +
        `• "I need a plumber for leak repair"\n` +
        `• "Looking for house cleaning in Westlands"\n` +
        `• "Need an electrician urgently"\n\n` +
        `Or use the buttons below:`,
        { 
          parse_mode: 'MarkdownV2',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🚰 Plumbing', callback_data: 'service_plumbing' },
                { text: '🧹 Cleaning', callback_data: 'service_cleaning' }
              ],
              [
                { text: '⚡ Electrical', callback_data: 'service_electrical' },
                { text: '💄 Beauty', callback_data: 'service_beauty' }
              ],
              [
                { text: '🪚 Carpentry', callback_data: 'service_carpentry' },
                { text: '📚 Tutoring', callback_data: 'service_tutoring' }
              ],
              [
                { text: '🧱 Masonry', callback_data: 'service_masonry' }
              ]
            ]
          }
        }
      );
      
    } else if (data === 'get_quote') {
      await bot.sendMessage(chatId,
        `💰 *Get Instant Quote*\n\n` +
        `Tell me what service you need and I'll get you personalized quotes from top providers\\!\n\n` +
        `Example: "I need a plumber to fix a leaking pipe in my kitchen"`,
        { parse_mode: 'MarkdownV2' }
      );
      
    } else if (data === 'pricing') {
      const responses = await botService.processMessage('pricing');
      
      for (const response of responses) {
        const options = { 
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: true
        };
        
        if (response.keyboard) {
          options.reply_markup = {
            inline_keyboard: response.keyboard
          };
        }
        
        await bot.sendMessage(chatId, response.text, options);
      }
    }
    
    // Answer the callback query
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '✅ Processing your request...'
    });
    
  } catch (error) {
    console.error('❌ Error handling callback:', error);
    
    try {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '❌ Error occurred. Please try again.',
        show_alert: true
      });
    } catch (answerError) {
      console.error('❌ Error answering callback:', answerError);
    }
  }
});

// Handle polling errors
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error);
});

// Optional: Create health check server
const app = express();
const PORT = process.env.PORT || 3002;

app.get('/health', (req, res) => {
  res.json({ 
    status: 'running', 
    service: 'FundiConnect Telegram Bot',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/status', (req, res) => {
  res.json({
    telegram_connected: bot.isPolling(),
    uptime: process.uptime(),
    memory_usage: process.memoryUsage()
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Health check server running on port ${PORT}`);
  console.log(`📊 Visit http://localhost:${PORT}/health for status`);
});

console.log('✅ FundiConnect Telegram Bot is ready!');
console.log('🤖 Users can now message your bot to get service provider recommendations');
console.log('💡 Bot username: Search for your bot on Telegram');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down FundiConnect Telegram Bot...');
  await bot.stopPolling();
  process.exit(0);
});