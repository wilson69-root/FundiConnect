import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, User, CheckCheck, Bot, Sparkles, MapPin, Navigation } from 'lucide-react';
import { ChatMessage, ServiceQuotation, ServiceProvider } from '../types';
import { enhancedBotService } from '../services/enhancedBotService';

interface WhatsAppChatProps {
  onBookProvider: (providerId: string) => void;
}

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ onBookProvider }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: "Habari! 👋 Welcome to FundiConnect! I'm your friendly AI assistant, and I'm super excited to help you find the perfect service provider today! 🌟\n\nJust tell me what you need - like 'I need a plumber' or 'looking for house cleaning' - and I'll work my magic to find you amazing options! ✨\n\nNote: Since we're just getting started, we don't have many providers yet, but you can still see how our AI matching works!",
      isBot: true,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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