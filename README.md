# FundiConnect - AI-Powered Service Marketplace

A modern service marketplace platform that connects customers with trusted service providers using AI-powered matching and real-time location services.

## 🌟 Features

### 🤖 AI-Powered Assistant
- **Natural Language Processing**: Understands complex service requests
- **Friendly Responses**: Uses Groq AI or OpenAI for warm, conversational interactions
- **Local Context**: Understands Kenyan locations and culture
- **Smart Matching**: Intelligent provider recommendations
- **Available to Everyone**: No sign-up required to search and get recommendations

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
- Supabase account (free tier available)

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
# Supabase Configuration (Required for database)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Service Configuration (Required for AI chat)
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Google Maps API (Optional - for maps)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# M-Pesa Configuration (Optional - for payments)
VITE_MPESA_CONSUMER_KEY=your_mpesa_consumer_key
VITE_MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
VITE_MPESA_SHORTCODE=174379
VITE_MPESA_PASSKEY=your_mpesa_passkey
VITE_MPESA_ENVIRONMENT=sandbox

# Bot Configuration (Optional - for WhatsApp/Telegram bots)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
WHATSAPP_SESSION_NAME=fundiconnect-session
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

### Supabase (Required - Database)
1. Visit [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy URL and anon key to `.env`

### Groq AI (Required - AI Chat)
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for free account
3. Create API key
4. Add to `.env` as `VITE_GROQ_API_KEY`

### Google Maps API (Optional - Maps)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Maps JavaScript API
3. Create API key
4. Add to `.env` as `VITE_GOOGLE_MAPS_API_KEY`

## 🎯 **Key User Experience Features**

### ✅ **For Everyone (No Sign-up Required):**
- Browse all service providers
- Search by name, service, location
- Use AI chat to find providers
- Get instant quotations
- View provider details and contact info

### 🔐 **Authentication Required Only For:**
- Booking services
- Joining as a provider
- Accessing provider dashboard

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
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_key
VITE_GROQ_API_KEY=your_production_groq_key
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
- `ProviderCard`: Service provider display
- `BookingModal`: Service booking interface
- `ProviderRegistration`: Simplified provider signup (3 steps)

### Services
- `enhancedBotService`: Advanced bot logic with real-time provider updates
- `aiService`: Groq/OpenAI integration
- `databaseService`: Supabase integration

## 🎯 **Deployment Readiness Checklist**

### ✅ **Core Features Working:**
- [x] Provider registration (simplified, instant approval)
- [x] Provider search (works for everyone)
- [x] AI chat (works for everyone)
- [x] Real-time provider updates
- [x] Booking system (requires auth)
- [x] Payment integration (M-Pesa)

### ✅ **Authentication:**
- [x] Email verification removed
- [x] Instant sign-up without confirmation
- [x] Proper error handling

### ✅ **Database:**
- [x] Supabase integration
- [x] Row Level Security (RLS)
- [x] Proper migrations
- [x] Error handling for deployment

### ✅ **Performance:**
- [x] Optimized queries
- [x] Real-time updates
- [x] Caching strategies
- [x] Error boundaries

### ✅ **Security:**
- [x] Environment variables
- [x] API key protection
- [x] Input validation
- [x] SQL injection protection

## 🚀 **Ready for Production!**

The project is now **deployment-ready** with:

1. **Simplified provider registration** (3 steps, no document uploads)
2. **Universal access** (search and AI work without sign-up)
3. **Real-time updates** (new providers appear immediately)
4. **Robust error handling** (graceful fallbacks)
5. **Scalable architecture** (optimized for production)

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

- [x] Real-time chat with AI assistant
- [x] Payment integration (M-Pesa)
- [x] Provider verification system
- [x] Advanced search filters
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics

---

Made with ❤️ in Kenya 🇰🇪