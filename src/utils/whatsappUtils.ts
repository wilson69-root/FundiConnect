// WhatsApp utility functions

export interface WhatsAppLinkOptions {
  phoneNumber: string;
  message?: string;
  encode?: boolean;
}

export interface QRCodeOptions {
  size?: number;
  format?: 'png' | 'svg';
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Clean and format phone number for WhatsApp
 */
export const cleanPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ensure it starts with + if it doesn't
  if (cleaned && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(cleanPhoneNumber(phoneNumber));
};

/**
 * Generate WhatsApp URL
 */
export const generateWhatsAppURL = ({ 
  phoneNumber, 
  message = '', 
  encode = true 
}: WhatsAppLinkOptions): string => {
  const cleanNumber = cleanPhoneNumber(phoneNumber);
  const encodedMessage = encode ? encodeURIComponent(message) : message;
  
  return `https://wa.me/${cleanNumber}${message ? `?text=${encodedMessage}` : ''}`;
};

/**
 * Generate QR code URL using QR Server API
 */
export const generateQRCodeURL = (
  data: string, 
  options: QRCodeOptions = {}
): string => {
  const {
    size = 200,
    format = 'png',
    errorCorrectionLevel = 'M',
    margin = 0,
    color = { dark: '000000', light: 'ffffff' }
  } = options;

  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: data,
    format: format,
    ecc: errorCorrectionLevel,
    margin: margin.toString(),
    color: color.dark || '000000',
    bgcolor: color.light || 'ffffff'
  });

  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
};

/**
 * Generate WhatsApp QR code URL
 */
export const generateWhatsAppQRCode = (
  phoneNumber: string,
  message?: string,
  qrOptions?: QRCodeOptions
): string => {
  const whatsappURL = generateWhatsAppURL({ phoneNumber, message });
  return generateQRCodeURL(whatsappURL, qrOptions);
};

/**
 * Download QR code as image
 */
export const downloadQRCode = (
  qrCodeURL: string,
  filename: string = 'whatsapp-qr-code.png'
): void => {
  const link = document.createElement('a');
  link.href = qrCodeURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Share WhatsApp link (Web Share API)
 */
export const shareWhatsAppLink = async (
  phoneNumber: string,
  message?: string,
  title: string = 'Contact me on WhatsApp'
): Promise<void> => {
  const whatsappURL = generateWhatsAppURL({ phoneNumber, message });
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: 'Scan this QR code or click the link to message me on WhatsApp',
        url: whatsappURL
      });
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to clipboard
      await navigator.clipboard.writeText(whatsappURL);
    }
  } else {
    // Fallback to clipboard
    await navigator.clipboard.writeText(whatsappURL);
  }
};

/**
 * Generate short URL for WhatsApp link (using a URL shortener)
 */
export const generateShortURL = async (longURL: string): Promise<string> => {
  // This is a placeholder - you would integrate with a URL shortening service
  // like bit.ly, tinyurl.com, or your own shortener
  
  try {
    // Example using a hypothetical shortener API
    const response = await fetch('https://api.short.io/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'your-api-key' // Replace with actual API key
      },
      body: JSON.stringify({
        originalURL: longURL,
        domain: 'short.io' // Your domain
      })
    });
    
    const data = await response.json();
    return data.shortURL || longURL;
  } catch (error) {
    console.error('Error creating short URL:', error);
    return longURL; // Return original URL if shortening fails
  }
};

/**
 * Create a redirect page URL
 */
export const createRedirectPageURL = (
  phoneNumber: string,
  message?: string,
  providerName?: string
): string => {
  const params = new URLSearchParams({
    phone: cleanPhoneNumber(phoneNumber),
    ...(message && { message }),
    ...(providerName && { provider: providerName })
  });
  
  return `/whatsapp-redirect?${params.toString()}`;
};

/**
 * Preset messages for different services
 */
export const presetMessages = {
  general: "Hi! I found you through FundiConnect and need a service provider.",
  plumbing: "Hi! I need help with plumbing work. Are you available?",
  cleaning: "Hello! I'm looking for cleaning services. Can you help?",
  electrical: "Hi! I need an electrician for some electrical work.",
  beauty: "Hello! I'm interested in your beauty services.",
  carpentry: "Hi! I need help with carpentry work.",
  tutoring: "Hello! I'm looking for tutoring services.",
  masonry: "Hi! I need help with masonry/construction work.",
  urgent: "Hi! I have an urgent service request. Are you available now?",
  quote: "Hello! Can you provide a quote for your services?"
};

/**
 * Get preset message by service category
 */
export const getPresetMessage = (category: string): string => {
  return presetMessages[category as keyof typeof presetMessages] || presetMessages.general;
};