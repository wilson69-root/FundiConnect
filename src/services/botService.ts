import { ServiceProvider, ServiceQuotation, ChatMessage } from '../types';
import { mockProviders } from '../data/mockData';

export class WhatsAppBotService {
  private providers: ServiceProvider[] = mockProviders;

  // Intent recognition for understanding user messages
  recognizeIntent(message: string): { intent: string; entities: any } {
    const lowerMessage = message.toLowerCase();
    
    // Service request patterns
    const servicePatterns = {
      plumbing: ['plumber', 'pipe', 'leak', 'drain', 'water', 'plumbing'],
      cleaning: ['clean', 'cleaning', 'house clean', 'office clean', 'deep clean'],
      electrical: ['electrician', 'wiring', 'electrical', 'power', 'socket', 'electric'],
      beauty: ['makeup', 'hair', 'beauty', 'manicure', 'facial', 'styling'],
      carpentry: ['carpenter', 'furniture', 'wood', 'cabinet', 'door', 'repair'],
      tutoring: ['tutor', 'teach', 'math', 'science', 'study', 'lesson'],
      masonry: ['mason', 'stone', 'brick', 'wall', 'foundation', 'concrete', 'masonry', 'stonework', 'brickwork']
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
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      intent = 'greeting';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      intent = 'pricing_inquiry';
    }

    return {
      intent,
      entities: {
        service: detectedService,
        location: location
      }
    };
  }

  // Match providers based on service and location
  matchProviders(service: string, location?: string): ServiceProvider[] {
    let matches = this.providers.filter(provider => 
      provider.category.toLowerCase() === service.toLowerCase()
    );

    if (location) {
      matches = matches.filter(provider =>
        provider.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    return matches.slice(0, 3); // Return top 3 matches
  }

  // Generate dynamic quotations
  generateQuotation(provider: ServiceProvider, serviceType: string): ServiceQuotation {
    const baseRate = provider.hourlyRate;
    const complexity = Math.random() * 0.5 + 0.5; // 0.5 to 1.0 complexity factor
    const estimatedCost = Math.round(baseRate * complexity * (2 + Math.random() * 2));
    
    return {
      id: `quote_${provider.id}_${Date.now()}`,
      providerId: provider.id,
      providerName: provider.name,
      service: serviceType,
      estimatedCost,
      duration: `${Math.ceil(complexity * 3)} hours`,
      responseTime: provider.responseTime,
      rating: provider.rating
    };
  }

  // Process user message and generate bot response
  async processMessage(message: string): Promise<ChatMessage[]> {
    const { intent, entities } = this.recognizeIntent(message);
    const responses: ChatMessage[] = [];

    switch (intent) {
      case 'greeting':
        responses.push({
          id: `bot_${Date.now()}`,
          text: "Hello! 👋 Welcome to FundiConnect. I'm here to help you find the perfect service provider. What service are you looking for today?",
          isBot: true,
          timestamp: new Date(),
          type: 'text'
        });
        break;

      case 'service_request':
        const service = entities.service;
        const location = entities.location;
        
        responses.push({
          id: `bot_${Date.now()}`,
          text: `Great! I found some excellent ${service} providers for you${location ? ` in ${location}` : ''}. Let me get you some quotations...`,
          isBot: true,
          timestamp: new Date(),
          type: 'text'
        });

        // Find matching providers
        const matches = this.matchProviders(service, location);
        
        if (matches.length > 0) {
          const quotations = matches.map(provider => 
            this.generateQuotation(provider, service)
          );

          responses.push({
            id: `quotes_${Date.now()}`,
            text: `Here are ${quotations.length} quotations from top-rated providers:`,
            isBot: true,
            timestamp: new Date(),
            type: 'quotation',
            data: quotations
          });
        } else {
          responses.push({
            id: `bot_${Date.now()}`,
            text: "I couldn't find any providers for that service in your area right now. Would you like me to expand the search or look for a different service?",
            isBot: true,
            timestamp: new Date(),
            type: 'text'
          });
        }
        break;

      case 'pricing_inquiry':
        responses.push({
          id: `bot_${Date.now()}`,
          text: "I'd be happy to help with pricing! Could you please tell me what specific service you need? For example: 'I need a plumber for pipe repair' or 'Looking for house cleaning service'.",
          isBot: true,
          timestamp: new Date(),
          type: 'text'
        });
        break;

      default:
        responses.push({
          id: `bot_${Date.now()}`,
          text: "I'm here to help you find service providers! Try asking for services like:\n• Plumbing repairs\n• House cleaning\n• Electrical work\n• Beauty services\n• Carpentry\n• Tutoring\n• Masonry work\n\nWhat can I help you find today?",
          isBot: true,
          timestamp: new Date(),
          type: 'text'
        });
    }

    return responses;
  }

  // Simulate follow-up after 24 hours
  generateFollowUp(): ChatMessage {
    return {
      id: `followup_${Date.now()}`,
      text: "Hi! This is FundiConnect customer care. How did your service experience go? We'd love to hear your feedback! 😊",
      isBot: true,
      timestamp: new Date(),
      type: 'text'
    };
  }
}

export const botService = new WhatsAppBotService();