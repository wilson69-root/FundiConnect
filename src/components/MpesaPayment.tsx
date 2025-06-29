import React, { useState } from 'react';
import { CreditCard, Phone, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';
import { mpesaService, MpesaPaymentRequest } from '../services/mpesaService';

interface MpesaPaymentProps {
  amount: number;
  description: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const MpesaPayment: React.FC<MpesaPaymentProps> = ({
  amount,
  description,
  onSuccess,
  onError,
  onCancel
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiated' | 'pending' | 'success' | 'failed'>('idle');
  const [checkoutRequestID, setCheckoutRequestID] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as 0XXX XXX XXX
    if (cleaned.length <= 10) {
      const formatted = cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
      return formatted;
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 && (cleaned.startsWith('07') || cleaned.startsWith('01'));
  };

  const handlePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      onError('Please enter a valid M-Pesa phone number (07XX XXX XXX or 01XX XXX XXX)');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('initiated');
    setStatusMessage('Initiating M-Pesa payment...');

    try {
      const paymentRequest: MpesaPaymentRequest = {
        amount: amount,
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        accountReference: `FUNDI_${Date.now()}`,
        transactionDesc: description
      };

      let response;
      
      // Use simulation if M-Pesa is not configured (for demo)
      if (!mpesaService.isConfigured()) {
        response = await mpesaService.simulatePayment(paymentRequest);
        setStatusMessage('Demo mode: Simulating M-Pesa payment...');
      } else {
        response = await mpesaService.initiateSTKPush(paymentRequest);
      }

      if (response.responseCode === '0') {
        setCheckoutRequestID(response.checkoutRequestID);
        setPaymentStatus('pending');
        setStatusMessage('Payment request sent to your phone. Please check your M-Pesa menu and enter your PIN.');
        
        // Start polling for payment status
        pollPaymentStatus(response.checkoutRequestID);
      } else {
        throw new Error(response.responseDescription || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setStatusMessage('Payment failed. Please try again.');
      onError(error instanceof Error ? error.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (requestID: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)

    const poll = async () => {
      attempts++;
      
      try {
        let status;
        
        if (!mpesaService.isConfigured()) {
          // Simulate successful payment after 5 seconds in demo mode
          if (attempts >= 3) {
            status = { resultCode: 0, resultDesc: 'The service request is processed successfully.' };
          } else {
            status = { resultCode: 1032, resultDesc: 'Request cancelled by user' };
          }
        } else {
          status = await mpesaService.queryPaymentStatus(requestID);
        }

        if (status.resultCode === 0) {
          // Payment successful
          setPaymentStatus('success');
          setStatusMessage('Payment completed successfully!');
          setIsProcessing(false);
          onSuccess(requestID);
          return;
        } else if (status.resultCode === 1032) {
          // Payment cancelled by user
          setPaymentStatus('failed');
          setStatusMessage('Payment was cancelled.');
          setIsProcessing(false);
          onError('Payment was cancelled by user');
          return;
        } else if (status.resultCode === 1037) {
          // Timeout
          setPaymentStatus('failed');
          setStatusMessage('Payment timed out. Please try again.');
          setIsProcessing(false);
          onError('Payment timed out');
          return;
        }

        // Continue polling if still pending
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          // Max attempts reached
          setPaymentStatus('failed');
          setStatusMessage('Payment verification timed out. Please contact support.');
          setIsProcessing(false);
          onError('Payment verification timed out');
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        } else {
          setPaymentStatus('failed');
          setStatusMessage('Unable to verify payment. Please contact support.');
          setIsProcessing(false);
          onError('Payment verification failed');
        }
      }
    };

    // Start polling after 5 seconds
    setTimeout(poll, 5000);
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'initiated':
      case 'pending':
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-8 h-8 text-red-600" />;
      default:
        return <CreditCard className="w-8 h-8 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'initiated':
      case 'pending':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <img 
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwQUY1NCIvPgo8cGF0aCBkPSJNMTIgMjBIMjhNMjAgMTJWMjhNMTYgMTZIMjRNMTYgMjRIMjQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo="
            alt="M-Pesa"
            className="w-10 h-10"
          />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Pay with M-Pesa</h3>
        <p className="text-gray-600">Secure payment powered by Safaricom</p>
      </div>

      {/* Payment Amount */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
        <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
        <p className="text-3xl font-bold text-gray-900">KSh {amount.toLocaleString()}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      {/* Status Display */}
      {paymentStatus !== 'idle' && (
        <div className={`rounded-xl p-4 mb-6 border-2 ${getStatusColor()}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div className="flex-1">
              <p className="font-medium text-gray-900">{statusMessage}</p>
              {paymentStatus === 'pending' && (
                <p className="text-sm text-gray-600 mt-1">
                  Check your phone for the M-Pesa prompt
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phone Number Input */}
      {paymentStatus === 'idle' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            M-Pesa Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="0712 345 678"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all text-lg"
            maxLength={12}
          />
          <p className="text-sm text-gray-500 mt-2">
            Enter your M-Pesa registered phone number
          </p>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Secure Payment</p>
            <p>Your payment is processed securely through Safaricom M-Pesa. We never store your PIN or personal information.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {paymentStatus === 'idle' && (
          <button
            onClick={handlePayment}
            disabled={!validatePhoneNumber(phoneNumber) || isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              `Pay KSh ${amount.toLocaleString()}`
            )}
          </button>
        )}

        {paymentStatus === 'success' && (
          <button
            onClick={() => onSuccess(checkoutRequestID)}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
          >
            Continue
          </button>
        )}

        {(paymentStatus === 'failed' || paymentStatus === 'idle') && (
          <button
            onClick={onCancel}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Need help? Contact our support team
        </p>
      </div>
    </div>
  );
};