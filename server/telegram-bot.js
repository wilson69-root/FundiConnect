const TelegramBot = require('node-telegram-bot-api');

// Replace with your bot token from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';

// Create bot instance
const bot = new TelegramBot(token, { polling: true });

// Simple bot service (same as WhatsApp)
class SimpleBotService {
  async processMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('plumber') || lowerMessage.includes('plumbing')) {
      return [{
        text: `🔧 *Plumbing Services Available*\n\n` +
              `I found these top plumbers for you:\n\n` +
              `1\\. *John Kamau* \\- KSh 1,500/hr\n` +
              `   ⭐ 4\\.8 rating \\| Westlands\n` +
              `   📱 Responds in \\< 30 mins\n\n` +
              `2\\. *Peter Mwangi* \\- KSh 1,800/hr\n` +
              `   ⭐ 4\\.7 rating \\| CBD\n` +
              `   📱 Responds in \\< 45 mins\n\n` +
              `Visit: https://fundiconnect\\.com`,
        keyboard: [
          [{ text: '📞 Call John Kamau', callback_data: 'call_john' }],
          [{ text: '📞 Call Peter Mwangi', callback_data: 'call_peter' }],
          [{ text: '🌐 Visit Website', url: 'https://fundiconnect.com' }]
        ]
      }];
    }
    
    // Add other service responses...
    
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
            `Just describe what service you need\\!`
    }];
  }
}

const botService = new SimpleBotService();

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  await bot.sendMessage(chatId, 
    `👋 *Welcome to FundiConnect\\!*\n\n` +
    `I'm your AI assistant ready to help you find trusted service providers in Kenya\\.\n\n` +
    `🔧 Just tell me what you need:\n` +
    `• "I need a plumber"\n` +
    `• "Looking for house cleaning"\n` +
    `• "Need an electrician"\n` +
    `• "Want a mason for stonework"\n\n` +
    `I'll find the best providers with instant quotations\\! 🚀`,
    { parse_mode: 'MarkdownV2' }
  );
});

// Handle all messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Skip commands
  if (text && text.startsWith('/')) {
    return;
  }
  
  if (!text) return;
  
  try {
    // Show typing indicator
    await bot.sendChatAction(chatId, 'typing');
    
    // Process with bot service
    const responses = await botService.processMessage(text);
    
    // Send responses
    for (const response of responses) {
      const options = { parse_mode: 'MarkdownV2' };
      
      // Add inline keyboard if available
      if (response.keyboard) {
        options.reply_markup = {
          inline_keyboard: response.keyboard
        };
      }
      
      await bot.sendMessage(chatId, response.text, options);
    }
    
  } catch (error) {
    console.error('Error:', error);
    await bot.sendMessage(chatId, 
      '🤖 Sorry, I encountered an error\\. Please try again or visit our website: https://fundiconnect\\.com',
      { parse_mode: 'MarkdownV2' }
    );
  }
});

// Handle callback queries (button presses)
bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;
  
  if (data.startsWith('call_')) {
    await bot.sendMessage(message.chat.id,
      `📞 *Contact Information*\n\n` +
      `Please call: \\+254 700 000 000\n` +
      `Or visit our website to book online: https://fundiconnect\\.com`,
      { parse_mode: 'MarkdownV2' }
    );
  }
  
  // Answer the callback query
  await bot.answerCallbackQuery(callbackQuery.id);
});

console.log('🤖 FundiConnect Telegram Bot is running...');