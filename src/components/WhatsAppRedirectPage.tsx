import React, { useEffect, useState } from 'react';
import { MessageCircle, ExternalLink, Copy, Check, Smartphone } from 'lucide-react';

interface WhatsAppRedirectPageProps {
  phoneNumber: string;
  message?: string;
  providerName?: string;
}

export const WhatsAppRedirectPage: React.FC<WhatsAppRedirectPageProps> = ({
  phoneNumber,
  message = "Hi! I found you through FundiConnect and need a service provider.",
  providerName = "Service Provider"
}) => {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Clean phone number and create WhatsApp URL
  const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsRedirecting(true);
          window.open(whatsappUrl, '_blank');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [whatsappUrl]);

  const handleManualRedirect = () => {
    setIsRedirecting(true);
    window.open(whatsappUrl, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(whatsappUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          {/* WhatsApp Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>

          {/* Header */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Connect with {providerName}
          </h1>
          <p className="text-gray-600 mb-6">
            You're being redirected to WhatsApp to start a conversation
          </p>

          {/* Phone Number Display */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">WhatsApp Number</p>
            <p className="text-lg font-semibold text-gray-900">{phoneNumber}</p>
          </div>

          {/* Message Preview */}
          <div className="bg-green-50 rounded-2xl p-4 mb-6 border border-green-200">
            <p className="text-sm text-green-700 mb-2">Your message will be:</p>
            <p className="text-green-800 italic">"{message}"</p>
          </div>

          {/* Countdown or Redirect Button */}
          {!isRedirecting ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Auto-redirecting in</p>
                <div className="text-3xl font-bold text-green-600">{countdown}</div>
              </div>
              
              <button
                onClick={handleManualRedirect}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Open WhatsApp Now</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Opening WhatsApp...</span>
              </div>
              
              <p className="text-sm text-gray-500">
                If WhatsApp doesn't open automatically, click the button below
              </p>
              
              <button
                onClick={handleManualRedirect}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open WhatsApp Manually</span>
              </button>
            </div>
          )}

          {/* Copy Link Button */}
          <button
            onClick={copyToClipboard}
            className="w-full mt-4 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy WhatsApp Link'}</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <span>How to use WhatsApp:</span>
          </h3>
          <ol className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start space-x-2">
              <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
              <span>WhatsApp will open with a pre-filled message</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
              <span>You can edit the message before sending</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
              <span>Tap send to start the conversation</span>
            </li>
          </ol>
        </div>

        {/* Back to FundiConnect */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
          >
            ← Back to FundiConnect
          </a>
        </div>
      </div>
    </div>
  );
};