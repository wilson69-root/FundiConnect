import { ServiceProvider, ServiceQuotation, ChatMessage } from '../types';

export interface AIResponse {
  text: string;
  intent: string;
  entities: {
    service?: string;
    location?: string;
    urgent?: boolean;
    budget?: number;
  };
}

export class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Using Groq AI for faster inference
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  }

  async generateFriendlyResponse(userMessage: string, providers: ServiceProvider[] = []): Promise<AIResponse> {
    if (!this.apiKey) {
      return this.fallbackResponse(userMessage);
    }

    try {
      const systemPrompt = `You are a friendly AI assistant for FundiConnect, a service marketplace in Kenya. 
      Your role is to help customers find service providers in a warm, conversational way.

      Guidelines:
      - Be friendly, helpful, and use emojis appropriately
      - Speak like a helpful Kenyan friend
      - Use local context (Nairobi areas, Kenyan culture)
      - Be encouraging and positive
      - Keep responses concise but warm
      - Use "Sawa" or "Poa" occasionally for local flavor
      - Always end with a helpful question or next step

      Available services: Plumbing, Cleaning, Electrical, Beauty, Carpentry, Tutoring, Masonry
      Common Nairobi areas: Westlands, Karen, CBD, Kilimani, Kasarani, Embakasi, Lavington

      Extract these entities from user messages:
      - service: type of service needed
      - location: area mentioned
      - urgent: if it's urgent/emergency
      - budget: any budget mentioned`;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192', // Fast Groq model
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error('AI API request failed');
      }

      const data = await response.json();
      const aiText = data.choices[0]?.message?.content || '';

      // Extract entities using simple pattern matching as backup
      const entities = this.extractEntities(userMessage);

      return {
        text: aiText,
        intent: this.determineIntent(userMessage, entities),
        entities
      };

    } catch (error) {
      console.error('AI API Error:', error);
      return this.fallbackResponse(userMessage);
    }
  }

  private fallbackResponse(userMessage: string): AIResponse {
    const entities = this.extractEntities(userMessage);
    const intent = this.determineIntent(userMessage, entities);

    let text = '';
    
    switch (intent) {
      case 'greeting':
        text = "Hello there! 👋 Welcome to FundiConnect! I'm here to help you find amazing service providers. What can I help you with today? 😊";
        break;
      case 'service_request':
        text = `Sawa! I can help you find a great ${entities.service} provider${entities.location ? ` in ${entities.location}` : ''}. Let me search for the best options for you! 🔍✨`;
        break;
      case 'pricing_inquiry':
        text = "No worries! I'll help you understand the pricing. What specific service are you looking for? I can get you personalized quotes from our top providers! 💰";
        break;
      default:
        text = "Hey there! 😊 I'm here to help you find trusted service providers in Kenya. Just tell me what you need - like 'I need a plumber' or 'looking for house cleaning' - and I'll find the perfect match for you! 🏠✨";
    }

    return { text, intent, entities };
  }

  private extractEntities(message: string) {
    const lowerMessage = message.toLowerCase();
    
    const servicePatterns = {
      plumbing: ['plumber', 'pipe', 'leak', 'drain', 'water', 'plumbing', 'toilet', 'sink'],
      cleaning: ['clean', 'cleaning', 'house clean', 'office clean', 'deep clean', 'maid'],
      electrical: ['electrician', 'wiring', 'electrical', 'power', 'socket', 'electric', 'lights'],
      beauty: ['makeup', 'hair', 'beauty', 'manicure', 'facial', 'styling', 'salon'],
      carpentry: ['carpenter', 'furniture', 'wood', 'cabinet', 'door', 'repair', 'woodwork'],
      tutoring: ['tutor', 'teach', 'math', 'science', 'study', 'lesson', 'education'],
      masonry: ['mason', 'stone', 'brick', 'wall', 'foundation', 'concrete', 'construction']
    };

    const locationPatterns = [
      'westlands', 'karen', 'cbd', 'kilimani', 'kasarani', 'embakasi', 'lavington',
      'kileleshwa', 'runda', 'muthaiga', 'gigiri', 'riverside', 'parklands'
    ];

    let service = null;
    for (const [serviceType, keywords] of Object.entries(servicePatterns)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        service = serviceType;
        break;
      }
    }

    const location = locationPatterns.find(loc => lowerMessage.includes(loc));
    const urgent = ['urgent', 'emergency', 'asap', 'immediately', 'now'].some(word => lowerMessage.includes(word));
    const budgetMatch = lowerMessage.match(/(\d+)/);
    const budget = budgetMatch ? parseInt(budgetMatch[1]) : null;

    return { service, location, urgent, budget };
  }

  private determineIntent(message: string, entities: any): string {
    const lowerMessage = message.toLowerCase();
    
    if (entities.service) return 'service_request';
    if (['hello', 'hi', 'hey', 'start'].some(word => lowerMessage.includes(word))) return 'greeting';
    if (['price', 'cost', 'rate', 'charge'].some(word => lowerMessage.includes(word))) return 'pricing_inquiry';
    if (['help', 'support'].some(word => lowerMessage.includes(word))) return 'help';
    
    return 'general';
  }
}

export const aiService = new AIService();