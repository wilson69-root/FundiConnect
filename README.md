# FundiConnect - AI-Powered Service Marketplace

A modern service marketplace platform that connects customers with trusted service providers using AI-powered matching and real-time location services.

## 🌟 Features

### 🤖 AI-Powered Assistant
- **Natural Language Processing**: Understands complex service requests
- **Friendly Responses**: Uses Groq AI or OpenAI for warm, conversational interactions
- **Local Context**: Understands Kenyan locations and culture
- **Smart Matching**: Intelligent provider recommendations

### 🗺️ Maps Integration
- **Real-time Location**: Google Maps integration for provider locations
- **User Location**: Find nearby providers based on your location
- **Interactive Maps**: Click on providers to see details and book
- **Distance Calculation**: See how far providers are from you

### 📱 Multi-Platform Support
- **Web Application**: Modern React-based interface
- **WhatsApp Bot**: Direct integration with WhatsApp
- **Telegram Bot**: AI-powered Telegram assistant
- **Responsive Design**: Works on all devices

### 🔧 Service Categories
- 🚰 **Plumbing** - Pipes, leaks, installations
- 🧹 **Cleaning** - House, office, deep cleaning
- ⚡ **Electrical** - Wiring, repairs, installations
- 💄 **Beauty** - Makeup, hair, wellness
- 🪚 **Carpentry** - Furniture, repairs, custom work
- 📚 **Tutoring** - Academic subjects, exam prep
- 🏗️ **Masonry** - Construction, stonework, repairs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Groq AI API key (free tier available)
- Google Maps API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/fundiconnect.git
cd fundiconnect
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your API keys:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

4. **Start the development server**
```bash
npm run dev
```

5. **Optional: Start WhatsApp/Telegram bots**
```bash
# WhatsApp bot
npm run whatsapp-bot

# Telegram bot (requires TELEGRAM_BOT_TOKEN)
npm run telegram-bot
```

## 🔑 API Keys Setup

### Groq AI (Recommended - Free Tier)
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for free account
3. Create API key
4. Add to `.env` as `VITE_GROQ_API_KEY`

### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Maps JavaScript API
3. Create API key
4. Add to `.env` as `VITE_GOOGLE_MAPS_API_KEY`

### Alternative: OpenAI API
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## 🤖 AI Features

### Friendly Responses
The AI assistant provides warm, conversational responses:

```
User: "I need a plumber"
AI: "Sawa! I can help you find a great plumber. Let me search for the best options for you! 🔍✨"
```

### Local Context
- Understands Kenyan locations (Westlands, Karen, CBD, etc.)
- Uses local expressions ("Sawa", "Poa")
- Cultural awareness and appropriate responses

### Smart Matching
- Considers location, budget, urgency
- Rates providers based on multiple factors
- Provides personalized recommendations

## 🗺️ Maps Integration

### Features
- **Provider Locations**: See all providers on interactive map
- **User Location**: Find your location and nearby providers
- **Info Windows**: Click providers for details and booking
- **Distance Calculation**: See how far providers are
- **Navigation**: Get directions to providers

### Usage
```typescript
// Enable location services
navigator.geolocation.getCurrentPosition(callback);

// Show providers on map
<ProviderMap 
  providers={providers}
  userLocation={userLocation}
  onProviderSelect={handleSelect}
/>
```

## 📱 Bot Integration

### WhatsApp Bot
```bash
# Start WhatsApp bot
npm run whatsapp-bot

# Scan QR code with your phone
# Send messages to test AI responses
```

### Telegram Bot
```bash
# Set bot token
export TELEGRAM_BOT_TOKEN=your_bot_token

# Start Telegram bot
npm run telegram-bot
```

## 🎨 UI/UX Features

### User-Friendly Design
- **Simple Navigation**: Clear, intuitive interface
- **Non-Technical**: Designed for everyday users
- **Visual Feedback**: Loading states, animations
- **Responsive**: Works on all screen sizes

### Accessibility
- **High Contrast**: Readable text and colors
- **Large Touch Targets**: Easy mobile interaction
- **Clear Icons**: Recognizable symbols
- **Simple Language**: No technical jargon

## 🚀 Deployment

### Netlify (Recommended)
```bash
# Build the project
npm run build

# Deploy to Netlify
# Connect your GitHub repo to Netlify
# Set environment variables in Netlify dashboard
```

### Environment Variables for Production
```env
VITE_GROQ_API_KEY=your_production_groq_key
VITE_GOOGLE_MAPS_API_KEY=your_production_maps_key
```

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
├── services/           # AI and bot services
├── data/              # Mock data and types
├── types/             # TypeScript definitions
└── utils/             # Utility functions

server/                # Bot servers
├── whatsapp-enhanced.cjs
├── telegram-bot.cjs
└── test-bots.cjs
```

### Key Components
- `WhatsAppChat`: AI-powered chat interface
- `ProviderMap`: Google Maps integration
- `ProviderCard`: Service provider display
- `BookingModal`: Service booking interface

### Services
- `aiService`: Groq/OpenAI integration
- `enhancedBotService`: Improved bot logic
- `botService`: Original bot functionality

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Report bugs via GitHub issues
- **Community**: Join our Discord for support
- **Email**: support@fundiconnect.com

## 🎯 Roadmap

- [ ] Real-time chat with providers
- [ ] Payment integration (M-Pesa, Stripe)
- [ ] Provider verification system
- [ ] Advanced search filters
- [ ] Mobile app (React Native)
- [ ] Multi-language support

---

Made with ❤️ in Kenya 🇰🇪