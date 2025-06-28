// Test script for both WhatsApp and Telegram bots
const express = require('express');

// Simple test service to verify bot functionality
class BotTester {
  constructor() {
    this.testMessages = [
      "Hello",
      "I need a plumber",
      "Looking for house cleaning in Westlands",
      "Need an electrician urgently",
      "Want a makeup artist for wedding",
      "Need a carpenter for furniture",
      "Looking for a math tutor",
      "Need a mason for stone wall",
      "How much does plumbing cost?",
      "Help me find services"
    ];
  }

  async testBotService() {
    console.log('🧪 Testing Bot Service Logic...\n');
    
    // Import the bot service (you'll need to adapt this)
    const { TelegramBotService } = require('./telegram-bot.js');
    const botService = new TelegramBotService();
    
    for (const message of this.testMessages) {
      console.log(`👤 User: ${message}`);
      
      try {
        const responses = await botService.processMessage(message);
        
        responses.forEach((response, index) => {
          console.log(`🤖 Bot Response ${index + 1}:`);
          console.log(response.text.replace(/\\/g, ''));
          
          if (response.keyboard) {
            console.log('📱 Buttons:', response.keyboard.map(row => 
              row.map(btn => btn.text).join(' | ')
            ).join('\n         '));
          }
          console.log('');
        });
        
      } catch (error) {
        console.error(`❌ Error processing "${message}":`, error.message);
      }
      
      console.log('─'.repeat(50));
    }
  }

  startTestServer() {
    const app = express();
    const PORT = 3003;

    app.use(express.json());

    // Test endpoint for bot responses
    app.post('/test-bot', async (req, res) => {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      try {
        // You can test your bot logic here
        const response = {
          message: message,
          response: `Bot would respond to: ${message}`,
          timestamp: new Date().toISOString()
        };
        
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'running',
        service: 'FundiConnect Bot Tester',
        timestamp: new Date().toISOString()
      });
    });

    // Test interface
    app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>FundiConnect Bot Tester</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .chat { border: 1px solid #ddd; height: 400px; overflow-y: auto; padding: 10px; margin: 10px 0; }
            .message { margin: 10px 0; padding: 10px; border-radius: 10px; }
            .user { background: #007bff; color: white; text-align: right; }
            .bot { background: #f1f1f1; }
            input { width: 70%; padding: 10px; }
            button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1>🤖 FundiConnect Bot Tester</h1>
          <div id="chat" class="chat"></div>
          <input type="text" id="messageInput" placeholder="Type a message..." onkeypress="if(event.key==='Enter') sendMessage()">
          <button onclick="sendMessage()">Send</button>
          
          <script>
            function addMessage(text, isUser) {
              const chat = document.getElementById('chat');
              const message = document.createElement('div');
              message.className = 'message ' + (isUser ? 'user' : 'bot');
              message.textContent = text;
              chat.appendChild(message);
              chat.scrollTop = chat.scrollHeight;
            }
            
            async function sendMessage() {
              const input = document.getElementById('messageInput');
              const message = input.value.trim();
              if (!message) return;
              
              addMessage(message, true);
              input.value = '';
              
              try {
                const response = await fetch('/test-bot', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message })
                });
                
                const data = await response.json();
                addMessage(data.response, false);
              } catch (error) {
                addMessage('Error: ' + error.message, false);
              }
            }
            
            // Add welcome message
            addMessage('Welcome to FundiConnect Bot Tester! Type a message to test the bot.', false);
          </script>
        </body>
        </html>
      `);
    });

    app.listen(PORT, () => {
      console.log(`🧪 Bot Tester running on http://localhost:${PORT}`);
      console.log(`📊 Test the bot interface in your browser`);
    });
  }
}

// Run tests
const tester = new BotTester();

if (process.argv.includes('--test-logic')) {
  tester.testBotService();
} else if (process.argv.includes('--server')) {
  tester.startTestServer();
} else {
  console.log('🧪 FundiConnect Bot Tester\n');
  console.log('Usage:');
  console.log('  node test-bots.js --test-logic    # Test bot response logic');
  console.log('  node test-bots.js --server        # Start test web interface');
  console.log('  node test-bots.js                 # Show this help');
}