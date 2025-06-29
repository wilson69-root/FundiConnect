import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, User, CheckCheck, Bot, Sparkles, MapPin, Navigation } from 'lucide-react';
import { ChatMessage, ServiceQuotation, ServiceProvider } from '../types';
import { enhancedBotService } from '../services/enhancedBotService';
import { ProviderMap } from './ProviderMap';
import { mockProviders } from '../data/mockData';

interface WhatsAppChatProps {
  onBookProvider: (providerId: string) => void;
}

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ onBookProvider }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: "Habari! 👋 Welcome to FundiConnect! I'm your friendly AI assistant, and I'm super excited to help you find the perfect service provider today! 🌟\n\nJust tell me what you need - like 'I need a plumber' or 'looking for house cleaning' - and I'll work my magic to find you amazing options! ✨",
      isBot: true,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: inputText,
      isBot: false,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate realistic typing delay
    setTimeout(async () => {
      const botResponses = await enhancedBotService.processMessage(inputText);
      setMessages(prev => [...prev, ...botResponses]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setShowMap(true);
          
          // Add location confirmation message
          setMessages(prev => [...prev, {
            id: `location_${Date.now()}`,
            text: "Perfect! 📍 I've got your location. Now I can show you providers nearby on the map! This will help you see exactly where they are and choose the most convenient option for you! 🗺️✨",
            isBot: true,
            timestamp: new Date(),
            type: 'text'
          }]);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setMessages(prev => [...prev, {
            id: `location_error_${Date.now()}`,
            text: "No worries! I couldn't access your location, but I can still help you find great providers. Just let me know which area you're in (like Westlands, Karen, CBD) and I'll find options nearby! 😊",
            isBot: true,
            timestamp: new Date(),
            type: 'text'
          }]);
        }
      );
    }
  };

  const QuotationCard: React.FC<{ quotation: ServiceQuotation }> = ({ quotation }) => (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-4 rounded-xl mb-3 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-green-900 text-lg">{quotation.providerName}</h4>
          <p className="text-green-700 font-medium">{quotation.service}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-green-900 text-xl">KSh {quotation.estimatedCost.toLocaleString()}</p>
          <p className="text-green-600 text-sm">{quotation.duration}</p>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm text-green-600 mb-3">
        <span className="flex items-center space-x-1">
          <span>⭐ {quotation.rating}</span>
          <span>•</span>
          <span>Responds {quotation.responseTime}</span>
        </span>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onBookProvider(quotation.providerId)}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Book Now
        </button>
        <button
          onClick={() => {
            const provider = mockProviders.find(p => p.id === quotation.providerId);
            if (provider) {
              setSelectedProvider(provider);
              setShowMap(true);
            }
          }}
          className="flex items-center space-x-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-full text-sm font-medium transition-colors"
        >
          <MapPin className="w-4 h-4" />
          <span>Map</span>
        </button>
      </div>
    </div>
  );

  const suggestedMessages = [
    "I need a plumber for pipe repair 🔧",
    "Looking for house cleaning service 🏠",
    "Need an electrician for wiring ⚡",
    "Want a makeup artist for wedding 💄",
    "Need a mason for construction work 🧱"
  ];

  return (
    <div className="space-y-6">
      {/* Map Section */}
      {showMap && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Provider Locations</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleLocationRequest}
                className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>My Location</span>
              </button>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-500 hover:text-gray-700 px-2"
              >
                ✕
              </button>
            </div>
          </div>
          <ProviderMap
            providers={mockProviders}
            selectedProvider={selectedProvider}
            onProviderSelect={(provider) => {
              setSelectedProvider(provider);
              onBookProvider(provider.id);
            }}
            userLocation={userLocation}
          />
        </div>
      )}

      {/* Chat Interface */}
      <div className="h-[700px] bg-white/90 backdrop-blur-lg rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/20">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white p-6 flex items-center space-x-4 shadow-lg">
          <div className="relative">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-green-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">FundiConnect AI Assistant</h3>
            <p className="text-green-100 text-sm flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
              <span>Online • Powered by Advanced AI</span>
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowMap(!showMap)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
              title="Show map"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <button
              onClick={handleLocationRequest}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
              title="Share location"
            >
              <Navigation className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-xs lg:max-w-md ${
                message.isBot 
                  ? 'bg-white shadow-lg border border-gray-100' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
              } px-6 py-4 rounded-2xl ${
                message.isBot ? 'rounded-bl-md' : 'rounded-br-md'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">{message.text}</div>
                
                {message.type === 'quotation' && message.data && (
                  <div className="mt-4 space-y-3">
                    {message.data.map((quotation: ServiceQuotation) => (
                      <QuotationCard key={quotation.id} quotation={quotation} />
                    ))}
                  </div>
                )}
                
                <div className={`text-xs mt-3 flex items-center justify-end space-x-1 ${
                  message.isBot ? 'text-gray-500' : 'text-green-100'
                }`}>
                  <span>{formatTime(message.timestamp)}</span>
                  {!message.isBot && <CheckCheck className="w-4 h-4" />}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white shadow-lg px-6 py-4 rounded-2xl rounded-bl-md border border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Messages */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-500 mb-3 font-medium">Try these popular requests:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedMessages.map((msg, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(msg.replace(/[🔧🏠⚡💄🧱]/g, '').trim())}
                  className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="bg-white/80 backdrop-blur-lg p-6 border-t border-gray-200">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message... (e.g., 'I need a plumber')"
              className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg bg-white/70 backdrop-blur-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};