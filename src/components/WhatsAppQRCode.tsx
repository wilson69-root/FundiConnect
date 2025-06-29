import React, { useState, useEffect } from 'react';
import { QrCode, MessageCircle, Copy, Check, Download, Share2 } from 'lucide-react';

interface WhatsAppQRCodeProps {
  phoneNumber: string;
  message?: string;
  size?: number;
}

export const WhatsAppQRCode: React.FC<WhatsAppQRCodeProps> = ({ 
  phoneNumber, 
  message = "Hi! I found you through FundiConnect and need a service provider.",
  size = 200 
}) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Clean phone number (remove spaces, dashes, etc.)
  const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(message)}`;
  
  // Generate QR code URL using QR Server API (free)
  const generateQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(whatsappUrl)}`;
    setQrCodeUrl(qrUrl);
  };

  useEffect(() => {
    generateQRCode();
  }, [phoneNumber, message, size]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(whatsappUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `whatsapp-qr-${cleanPhoneNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Contact me on WhatsApp',
          text: 'Scan this QR code to message me on WhatsApp',
          url: whatsappUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-gray-100">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp QR Code</h3>
        <p className="text-gray-600">Scan to message me instantly</p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-white rounded-xl shadow-inner border-2 border-gray-100">
          {qrCodeUrl ? (
            <img 
              src={qrCodeUrl} 
              alt="WhatsApp QR Code"
              className="w-48 h-48 rounded-lg"
              onError={() => console.error('Failed to load QR code')}
            />
          ) : (
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Phone Number Display */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 mb-1">WhatsApp Number</p>
        <p className="text-lg font-semibold text-gray-900">{phoneNumber}</p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={copyToClipboard}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          <span>{copied ? 'Copied!' : 'Copy WhatsApp Link'}</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={downloadQRCode}
            className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>

          <button
            onClick={shareQRCode}
            className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
        <h4 className="font-semibold text-green-900 mb-2">How to use:</h4>
        <ol className="text-sm text-green-800 space-y-1">
          <li>1. Open WhatsApp camera or any QR scanner</li>
          <li>2. Point camera at the QR code above</li>
          <li>3. Tap the notification to open WhatsApp</li>
          <li>4. Start chatting instantly!</li>
        </ol>
      </div>
    </div>
  );
};