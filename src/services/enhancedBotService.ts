import { ServiceProvider, ServiceQuotation, ChatMessage } from '../types';
import { aiService } from './aiService';

export class EnhancedBotService {
  private providers: ServiceProvider[] = []; // Start with empty array

  async processMessage(message: string): Promise<ChatMessage[]> {
    try {
      // Get AI-powered response
      const aiResponse = await aiService.generateFriendlyResponse(message, this.providers);
      const responses: ChatMessage[] = [];

      // Add the friendly AI response
      responses.push({
        id: `bot_${Date.now()}`,
        text: aiResponse.text,
        isBot: true,
        timestamp: new Date(),
        type: 'text'
      });

      // If it's a service request but no providers available
      if (aiResponse.intent === 'service_request' && aiResponse.entities.service) {
        if (this.providers.length === 0) {
          responses.push({
            id: `bot_${Date.now() + 1}`,
            text: `I understand you're looking for ${aiResponse.entities.service} services! 🔍 Unfortunately, we don't have any providers registered yet in our marketplace. \n\nBut here's the exciting part - you can be among the first to experience our platform! 🌟\n\n✨ **What you can do:**\n• Try our AI matching system (it's pretty smart!)\n• See how our quotation system works\n• Experience our user-friendly interface\n\nWe're actively recruiting service providers, so check back soon! In the meantime, feel free to explore and see how FundiConnect will revolutionize finding service providers in Kenya! 🚀`,
            isBot: true,
            timestamp: new Date(),
            type: 'text'
          });
        } else {
          // If we have providers, do normal matching
          const matches = this.matchProviders(
            aiResponse.entities.service,
            aiResponse.entities.location,
            aiResponse.entities.budget,
            aiResponse.entities.urgent
          );

          if (matches.length > 0) {
            const quotations = matches.map(provider => 
              this.generateQuotation(provider, aiResponse.entities.service!, aiResponse.entities.urgent)
            ).filter(q => q !== null);

            if (quotations.length > 0) {
              responses.push({
                id: `quotes_${Date.now()}`,
                text: `Poa! Here are ${quotations.length} fantastic options I found for you! 🌟 Each provider is verified and highly rated:`,
                isBot: true,
                timestamp: new Date(),
                type: 'quotation',
                data: quotations
              });
            }
          }
        }
      }

      return responses;
    } catch (error) {
      console.error('Enhanced bot service error:', error);
      return [{
        id: `bot_${Date.now()}`,
        text: "Oops! Something went wrong on my end. 😅 But I'm still here to help! Could you please try again? I'm ready to find you the perfect service provider! 💪",
        isBot: true,
        timestamp: new Date(),
        type: 'text'
      }];
    }
  }

  // Update providers list when new ones register
  updateProviders(providers: ServiceProvider[]) {
    this.providers = providers;
  }

  private matchProviders(service: string, location?: string, budget?: number, urgent?: boolean): ServiceProvider[] {
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
        matches = matches.filter(provider => provider.hourlyRate <= budget * 1.2);
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

  private calculateProviderScore(provider: ServiceProvider, urgent?: boolean, budget?: number): number {
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

  private generateQuotation(provider: ServiceProvider, serviceType: string, urgent?: boolean): ServiceQuotation | null {
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
        duration: `${hours} hours`,
        responseTime: provider.responseTime,
        rating: provider.rating
      };
    } catch (error) {
      console.error('Error generating quotation:', error);
      return null;
    }
  }
}

export const enhancedBotService = new EnhancedBotService();