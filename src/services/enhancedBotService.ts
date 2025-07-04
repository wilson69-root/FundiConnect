import { ServiceProvider, ServiceQuotation, ChatMessage } from '../types';
import { aiService } from './aiService';
import { databaseService } from './databaseService';

export class EnhancedBotService {
  private providers: ServiceProvider[] = [];
  private lastUpdate: number = 0;
  private updateInterval: number = 10000; // 10 seconds for faster updates
  private isLoading: boolean = false;

  constructor() {
    // Load providers on initialization
    this.loadProviders();
    
    // Set up periodic refresh
    setInterval(() => {
      if (!this.isLoading) {
        this.loadProviders();
      }
    }, this.updateInterval);
  }

  async loadProviders() {
    if (this.isLoading) {
      console.log('⏳ Provider loading already in progress, skipping...');
      return;
    }

    this.isLoading = true;
    try {
      console.log('🔄 Loading providers for bot service...');
      const providers = await databaseService.getServiceProviders();
      this.providers = providers;
      this.lastUpdate = Date.now();
      console.log(`✅ Bot service loaded ${providers.length} providers:`, 
        providers.map(p => ({ name: p.name, category: p.category, location: p.location })));
    } catch (error) {
      console.error('❌ Error loading providers for bot service:', error);
      // Don't clear existing providers on error
      if (this.providers.length === 0) {
        this.providers = [];
      }
    } finally {
      this.isLoading = false;
    }
  }

  // Force refresh providers
  async refreshProviders() {
    console.log('🔄 Force refreshing providers...');
    this.isLoading = false; // Reset loading flag
    await this.loadProviders();
  }

  // Get current providers count
  getProvidersCount(): number {
    return this.providers.length;
  }

  // Get providers by category
  getProvidersByCategory(category: string): ServiceProvider[] {
    return this.providers.filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
  }

  async processMessage(message: string): Promise<ChatMessage[]> {
    try {
      console.log(`🤖 Processing message: "${message}"`);
      console.log(`📊 Current providers available: ${this.providers.length}`);

      // Always refresh providers to get latest data (especially for non-authenticated users)
      if (Date.now() - this.lastUpdate > 5000) { // Refresh every 5 seconds
        console.log('🔄 Refreshing providers for latest data...');
        await this.loadProviders();
      }

      // Get AI-powered response
      console.log('🧠 Getting AI response...');
      const aiResponse = await aiService.generateFriendlyResponse(message);
      console.log('✅ AI response received:', aiResponse);
      
      const responses: ChatMessage[] = [];

      // Add the friendly AI response
      responses.push({
        id: `bot_${Date.now()}`,
        text: aiResponse.text,
        isBot: true,
        timestamp: new Date(),
        type: 'text'
      });

      // If it's a service request
      if (aiResponse.intent === 'service_request' && aiResponse.entities.service) {
        console.log(`🔍 Service request detected: ${aiResponse.entities.service}`);
        console.log(`📊 Available providers for matching:`, this.providers.map(p => ({ 
          name: p.name, 
          category: p.category, 
          location: p.location,
          services: p.services 
        })));

        if (this.providers.length === 0) {
          // Force refresh one more time
          console.log('⚠️ No providers found, forcing refresh...');
          await this.refreshProviders();
          
          if (this.providers.length === 0) {
            console.log('❌ Still no providers after refresh');
            responses.push({
              id: `bot_${Date.now() + 1}`,
              text: `I understand you're looking for ${aiResponse.entities.service} services! 🔍 

Unfortunately, we don't have any providers registered yet in our marketplace. But here's the exciting part - you can be among the first to experience our platform! 🌟

✨ **What you can do:**
• Try our AI matching system (it's pretty smart!)
• See how our quotation system works
• Experience our user-friendly interface

We're actively recruiting service providers, so check back soon! In the meantime, feel free to explore and see how FundiConnect will revolutionize finding service providers in Kenya! 🚀

💡 **Want to join as a provider?** Click "Join FREE" to register instantly!`,
              isBot: true,
              timestamp: new Date(),
              type: 'text'
            });
          }
        } else {
          console.log(`✅ Found ${this.providers.length} providers, starting matching...`);
          
          // Match providers with the service request
          const matches = this.matchProviders(
            aiResponse.entities.service,
            aiResponse.entities.location,
            aiResponse.entities.budget,
            aiResponse.entities.urgent
          );

          console.log(`🎯 Found ${matches.length} matching providers:`, matches.map(p => ({
            name: p.name,
            category: p.category,
            services: p.services
          })));

          if (matches.length > 0) {
            const quotations = matches.map(provider => 
              this.generateQuotation(provider, aiResponse.entities.service!, aiResponse.entities.urgent)
            ).filter(q => q !== null);

            console.log(`💰 Generated ${quotations.length} quotations`);

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
          } else {
            // No matches found - provide helpful alternatives
            const availableCategories = [...new Set(this.providers.map(p => p.category))];
            const availableServices = [...new Set(this.providers.flatMap(p => p.services))];
            
            let suggestionText = `I couldn't find any ${aiResponse.entities.service} providers`;
            if (aiResponse.entities.location) {
              suggestionText += ` in ${aiResponse.entities.location}`;
            }
            suggestionText += ` right now. 😔\n\n`;

            if (availableCategories.length > 0) {
              suggestionText += `**Currently available services:**\n`;
              availableCategories.forEach(cat => {
                suggestionText += `• ${cat}\n`;
              });
              suggestionText += `\n`;
            }

            if (availableServices.length > 0) {
              suggestionText += `**Specific services available:**\n`;
              availableServices.slice(0, 8).forEach(service => {
                suggestionText += `• ${service}\n`;
              });
              if (availableServices.length > 8) {
                suggestionText += `• And ${availableServices.length - 8} more...\n`;
              }
              suggestionText += `\n`;
            }

            suggestionText += `**What you can do:**\n`;
            suggestionText += `• Try searching for one of the available services above\n`;
            suggestionText += `• Expand your search area\n`;
            suggestionText += `• Check back later as new providers join daily\n\n`;
            suggestionText += `Would you like me to show you providers for any of these services? 🔍`;

            responses.push({
              id: `bot_${Date.now() + 2}`,
              text: suggestionText,
              isBot: true,
              timestamp: new Date(),
              type: 'text'
            });
          }
        }
      }

      console.log(`✅ Returning ${responses.length} responses`);
      return responses;
    } catch (error) {
      console.error('❌ Enhanced bot service error:', error);
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
    console.log('🔄 Updating bot service providers:', providers.length);
    this.providers = providers;
    this.lastUpdate = Date.now();
  }

  private matchProviders(service: string, location?: string, budget?: number, urgent?: boolean): ServiceProvider[] {
    try {
      console.log(`🔍 Matching providers for service: "${service}", location: "${location}"`);
      console.log(`📊 Total providers to search: ${this.providers.length}`);
      
      // Enhanced matching logic
      let matches: ServiceProvider[] = [];

      // 1. Exact category match
      matches = this.providers.filter(provider => 
        provider.category.toLowerCase() === service.toLowerCase()
      );
      console.log(`🎯 Exact category matches: ${matches.length}`);

      // 2. If no exact match, try partial category matches
      if (matches.length === 0) {
        matches = this.providers.filter(provider => 
          provider.category.toLowerCase().includes(service.toLowerCase()) ||
          service.toLowerCase().includes(provider.category.toLowerCase())
        );
        console.log(`🎯 Partial category matches: ${matches.length}`);
      }

      // 3. If still no matches, try service-specific matches
      if (matches.length === 0) {
        matches = this.providers.filter(provider => 
          provider.services.some(s => 
            s.toLowerCase().includes(service.toLowerCase()) ||
            service.toLowerCase().includes(s.toLowerCase())
          )
        );
        console.log(`🎯 Service-specific matches: ${matches.length}`);
      }

      // 4. If still no matches, try broader keyword matching
      if (matches.length === 0) {
        const serviceKeywords = service.toLowerCase().split(' ');
        matches = this.providers.filter(provider => {
          const providerText = `${provider.category} ${provider.services.join(' ')} ${provider.description}`.toLowerCase();
          return serviceKeywords.some(keyword => 
            keyword.length > 2 && providerText.includes(keyword)
          );
        });
        console.log(`🎯 Keyword matches: ${matches.length}`);
      }

      console.log(`📋 All matches found:`, matches.map(p => ({ 
        name: p.name, 
        category: p.category, 
        services: p.services 
      })));

      // Location filtering
      if (location && matches.length > 0) {
        const locationMatches = matches.filter(provider =>
          provider.location.toLowerCase().includes(location.toLowerCase())
        );
        if (locationMatches.length > 0) {
          matches = locationMatches;
          console.log(`📍 After location filter "${location}": ${matches.length} matches`);
        } else {
          console.log(`📍 No location matches for "${location}", keeping all matches`);
        }
      }

      // Budget filtering
      if (budget && matches.length > 0) {
        const budgetMatches = matches.filter(provider => provider.hourlyRate <= budget * 1.2);
        if (budgetMatches.length > 0) {
          matches = budgetMatches;
          console.log(`💰 After budget filter (${budget}): ${matches.length} matches`);
        }
      }

      // Scoring and sorting
      matches = matches.map(provider => ({
        ...provider,
        score: this.calculateProviderScore(provider, urgent, budget)
      })).sort((a, b) => b.score - a.score);

      const finalMatches = matches.slice(0, 3);
      console.log(`✅ Final matches (top 3):`, finalMatches.map(p => ({ 
        name: p.name, 
        category: p.category, 
        score: p.score 
      })));

      return finalMatches;
    } catch (error) {
      console.error('❌ Error matching providers:', error);
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
      console.error('❌ Error generating quotation:', error);
      return null;
    }
  }
}

export const enhancedBotService = new EnhancedBotService();