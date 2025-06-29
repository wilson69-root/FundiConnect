// WhatsApp Business API Integration (Free Tier)
const express = require('express');
const axios = require('axios');
require('dotenv').config();

class WhatsAppBusinessAPI {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    this.baseURL = 'https://graph.facebook.com/v18.0';
  }

  // Send text message
  async sendMessage(to, message) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      throw error;
    }
  }

  // Send template message (for notifications)
  async sendTemplate(to, templateName, languageCode = 'en') {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error sending template:', error.response?.data || error.message);
      throw error;
    }
  }

  // Send interactive buttons
  async sendButtons(to, bodyText, buttons) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: bodyText },
            action: {
              buttons: buttons.map((btn, index) => ({
                type: 'reply',
                reply: {
                  id: `btn_${index}`,
                  title: btn
                }
              }))
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error sending buttons:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Express server for webhooks
const app = express();
app.use(express.json());

const businessAPI = new WhatsAppBusinessAPI();

// Webhook verification (required by Meta)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === businessAPI.webhookVerifyToken) {
    console.log('✅ Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.sendStatus(403);
  }
});

// Webhook for incoming messages
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      body.entry.forEach(async (entry) => {
        const changes = entry.changes;
        
        changes.forEach(async (change) => {
          if (change.field === 'messages') {
            const value = change.value;
            
            if (value.messages) {
              for (const message of value.messages) {
                const from = message.from;
                const messageBody = message.text?.body;
                
                if (messageBody) {
                  console.log(`📨 Business API message from ${from}: ${messageBody}`);
                  
                  // Process with your bot service
                  const { botService } = require('./whatsapp-enhanced.cjs');
                  const responses = await botService.processMessage(messageBody, from);
                  
                  // Send responses
                  for (const response of responses) {
                    if (response.type === 'quotation' && response.data) {
                      // Send as interactive buttons
                      const buttons = response.data.slice(0, 3).map(q => 
                        `${q.providerName} - KSh ${q.estimatedCost.toLocaleString()}`
                      );
                      
                      await businessAPI.sendButtons(from, response.text, buttons);
                    } else {
                      await businessAPI.sendMessage(from, response.text);
                    }
                  }
                }
              }
            }
          }
        });
      });
    }

    res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).send('ERROR');
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'running',
    service: 'WhatsApp Business API',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.WHATSAPP_BUSINESS_PORT || 3004;

app.listen(PORT, () => {
  console.log(`🌐 WhatsApp Business API server running on port ${PORT}`);
  console.log(`📊 Webhook URL: http://localhost:${PORT}/webhook`);
});

module.exports = { WhatsAppBusinessAPI };