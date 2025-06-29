import React, { useState } from 'react';
import { Phone, MessageCircle, Settings, Palette, Download, Eye } from 'lucide-react';
import { WhatsAppQRCode } from './WhatsAppQRCode';

export const QRCodeGenerator: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('+254700000000');
  const [customMessage, setCustomMessage] = useState('Hi! I found you through FundiConnect and need a service provider.');
  const [qrSize, setQrSize] = useState(200);
  const [showPreview, setShowPreview] = useState(false);

  const presetMessages = [
    "Hi! I found you through FundiConnect and need a service provider.",
    "Hello! I'm interested in your services. Can we discuss?",
    "Hi! I need help with a service. Are you available?",
    "Hello! I saw your profile on FundiConnect. Can you help me?",
    "Hi! I need a quote for your services. When can we talk?"
  ];

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with + if it doesn't
    if (cleaned && !cleaned.startsWith('+')) {
      return '+' + cleaned;
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const isValidPhoneNumber = (phone: string) => {
    // Basic validation: should start with + and have 10-15 digits
    const phoneRegex = /^\+\d{10,15}$/;
    return phoneRegex.test(phone);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">WhatsApp QR Code Generator</h2>
        <p className="text-xl text-gray-600">Create a QR code that redirects directly to your WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Configuration</h3>
            </div>

            {/* Phone Number Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                WhatsApp Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="+254700000000"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                  isValidPhoneNumber(phoneNumber) ? 'border-green-300' : 'border-gray-300'
                }`}
              />
              <p className="text-sm text-gray-500 mt-2">
                Include country code (e.g., +254 for Kenya)
              </p>
              {!isValidPhoneNumber(phoneNumber) && phoneNumber && (
                <p className="text-sm text-red-500 mt-1">
                  Please enter a valid phone number with country code
                </p>
              )}
            </div>

            {/* Custom Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Pre-filled Message (Optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                placeholder="Enter the message that will appear when someone scans the QR code..."
              />
              
              {/* Preset Messages */}
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Quick presets:</p>
                <div className="flex flex-wrap gap-2">
                  {presetMessages.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setCustomMessage(preset)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full transition-colors"
                    >
                      Preset {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* QR Code Size */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette className="w-4 h-4 inline mr-2" />
                QR Code Size: {qrSize}px
              </label>
              <input
                type="range"
                min="150"
                max="400"
                step="50"
                value={qrSize}
                onChange={(e) => setQrSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>150px</span>
                <span>400px</span>
              </div>
            </div>

            {/* Preview Button */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              disabled={!isValidPhoneNumber(phoneNumber)}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Eye className="w-5 h-5" />
              <span>{showPreview ? 'Hide Preview' : 'Generate QR Code'}</span>
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">How it works:</h4>
            <ol className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                <span>Enter your WhatsApp phone number with country code</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                <span>Customize the pre-filled message (optional)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                <span>Generate and download your QR code</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                <span>Share it anywhere - business cards, flyers, websites!</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {showPreview && isValidPhoneNumber(phoneNumber) ? (
            <WhatsAppQRCode 
              phoneNumber={phoneNumber}
              message={customMessage}
              size={qrSize}
            />
          ) : (
            <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">QR Code Preview</h3>
              <p className="text-gray-500">
                {!isValidPhoneNumber(phoneNumber) 
                  ? 'Enter a valid phone number to generate QR code'
                  : 'Click "Generate QR Code" to see preview'
                }
              </p>
            </div>
          )}

          {/* Usage Examples */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4">Usage Ideas:</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📄</span>
                </div>
                <span className="text-green-800">Business cards & flyers</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🌐</span>
                </div>
                <span className="text-blue-800">Website & social media</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🏪</span>
                </div>
                <span className="text-purple-800">Shop windows & displays</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📧</span>
                </div>
                <span className="text-orange-800">Email signatures</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};