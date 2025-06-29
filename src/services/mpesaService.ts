export interface MpesaPaymentRequest {
  amount: number;
  phoneNumber: string;
  accountReference: string;
  transactionDesc: string;
}

export interface MpesaPaymentResponse {
  merchantRequestID: string;
  checkoutRequestID: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

export interface MpesaCallbackData {
  merchantRequestID: string;
  checkoutRequestID: string;
  resultCode: number;
  resultDesc: string;
  amount?: number;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
}

export class MpesaService {
  private consumerKey: string;
  private consumerSecret: string;
  private businessShortCode: string;
  private passkey: string;
  private environment: 'sandbox' | 'production';
  private baseUrl: string;

  constructor() {
    this.consumerKey = import.meta.env.VITE_MPESA_CONSUMER_KEY || '';
    this.consumerSecret = import.meta.env.VITE_MPESA_CONSUMER_SECRET || '';
    this.businessShortCode = import.meta.env.VITE_MPESA_SHORTCODE || '174379';
    this.passkey = import.meta.env.VITE_MPESA_PASSKEY || '';
    this.environment = (import.meta.env.VITE_MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
    
    this.baseUrl = this.environment === 'sandbox' 
      ? 'https://sandbox.safaricom.co.ke' 
      : 'https://api.safaricom.co.ke';
  }

  private async getAccessToken(): Promise<string> {
    try {
      const auth = btoa(`${this.consumerKey}:${this.consumerSecret}`);
      
      const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting M-Pesa access token:', error);
      throw error;
    }
  }

  private generatePassword(): string {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = btoa(`${this.businessShortCode}${this.passkey}${timestamp}`);
    return password;
  }

  private getTimestamp(): string {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    }
    
    // If it doesn't start with 254, add it
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  }

  async initiateSTKPush(paymentRequest: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword();
      const formattedPhone = this.formatPhoneNumber(paymentRequest.phoneNumber);

      const requestBody = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: paymentRequest.amount,
        PartyA: formattedPhone,
        PartyB: this.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${window.location.origin}/api/mpesa/callback`,
        AccountReference: paymentRequest.accountReference,
        TransactionDesc: paymentRequest.transactionDesc
      };

      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to initiate M-Pesa payment');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error initiating M-Pesa STK Push:', error);
      throw error;
    }
  }

  async queryPaymentStatus(checkoutRequestID: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword();

      const requestBody = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      };

      const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to query payment status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error querying M-Pesa payment status:', error);
      throw error;
    }
  }

  // Simulate payment for demo purposes (when API keys are not available)
  async simulatePayment(paymentRequest: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          merchantRequestID: `DEMO_${Date.now()}`,
          checkoutRequestID: `ws_CO_${Date.now()}`,
          responseCode: '0',
          responseDescription: 'Success. Request accepted for processing',
          customerMessage: 'Success. Request accepted for processing'
        });
      }, 1000);
    });
  }

  // Check if M-Pesa is properly configured
  isConfigured(): boolean {
    return !!(this.consumerKey && this.consumerSecret && this.businessShortCode && this.passkey);
  }
}

export const mpesaService = new MpesaService();