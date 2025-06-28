// Simple debug script to test Telegram bot connection
const dotenv = require('dotenv');
dotenv.config();

console.log('🔍 Telegram Bot Debug Tool');
console.log('========================');

// Check environment
console.log('📋 Environment Check:');
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);

// Check token
const token = process.env.TELEGRAM_BOT_TOKEN;
console.log('\n🔑 Token Check:');
if (!token) {
  console.log('❌ No TELEGRAM_BOT_TOKEN found in environment');
  console.log('💡 Please add it to your .env file');
  process.exit(1);
} else if (token === 'YOUR_BOT_TOKEN_HERE') {
  console.log('❌ Please replace YOUR_BOT_TOKEN_HERE with your actual bot token');
  process.exit(1);
} else {
  console.log('✅ Token found');
  console.log(`📝 Token format: ${token.substring(0, 10)}...${token.substring(token.length - 10)}`);
}

// Test bot connection
console.log('\n🤖 Testing Bot Connection...');

const TelegramBot = require('node-telegram-bot-api');

async function testBot() {
  try {
    // Create bot without polling first
    const bot = new TelegramBot(token, { polling: false });
    
    // Test getMe
    console.log('📡 Calling getMe...');
    const me = await bot.getMe();
    
    console.log('✅ Bot connection successful!');
    console.log(`🤖 Bot Name: ${me.first_name}`);
    console.log(`📱 Username: @${me.username}`);
    console.log(`🆔 Bot ID: ${me.id}`);
    
    // Now start polling
    console.log('\n🔄 Starting polling...');
    bot.startPolling();
    
    console.log('✅ Polling started successfully!');
    console.log('💬 Your bot is now ready to receive messages!');
    console.log(`🔗 Start a chat: https://t.me/${me.username}`);
    
    // Test message handler
    bot.on('message', (msg) => {
      console.log(`📨 Received message from ${msg.from.first_name}: ${msg.text}`);
      bot.sendMessage(msg.chat.id, '✅ Bot is working! I received your message: ' + msg.text);
    });
    
    // Handle errors
    bot.on('polling_error', (error) => {
      console.error('❌ Polling error:', error.message);
    });
    
  } catch (error) {
    console.error('❌ Bot test failed:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n🔧 Troubleshooting 401 Unauthorized:');
      console.log('1. Check if your bot token is correct');
      console.log('2. Make sure you copied the full token from @BotFather');
      console.log('3. Try creating a new bot with @BotFather');
    } else if (error.message.includes('409')) {
      console.log('\n🔧 Troubleshooting 409 Conflict:');
      console.log('1. Another bot instance might be running');
      console.log('2. Stop all Node.js processes: pkill -f node');
      console.log('3. Wait 30 seconds and try again');
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 Troubleshooting Network Error:');
      console.log('1. Check your internet connection');
      console.log('2. Try using a VPN if Telegram is blocked');
      console.log('3. Check firewall settings');
    }
    
    process.exit(1);
  }
}

testBot();