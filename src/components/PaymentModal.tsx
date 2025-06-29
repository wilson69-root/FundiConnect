import React, { useState } from 'react';
import { X, CreditCard, Smartphone } from 'lucide-react';
import { MpesaPayment } from './MpesaPayment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onPaymentSuccess: (transactionId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  description,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'mpesa' | 'card' | null>(null);

  if (!isOpen) return null;

  const handlePaymentSuccess = (transactionId: string) => {
    onPaymentSuccess(transactionId);
    onClose();
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // You can show a toast notification here
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {!selectedMethod ? (
            // Payment Method Selection
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Payment Method</h3>
                <p className="text-gray-600">Select how you'd like to pay for this service</p>
              </div>

              {/* M-Pesa Option */}
              <button
                onClick={() => setSelectedMethod('mpesa')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Smartphone className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900">M-Pesa</h4>
                    <p className="text-sm text-gray-600">Pay with your M-Pesa mobile money</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-green-600">Recommended</span>
                  </div>
                </div>
              </button>

              {/* Card Payment Option (Coming Soon) */}
              <button
                disabled
                className="w-full p-6 border-2 border-gray-200 rounded-xl opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900">Credit/Debit Card</h4>
                    <p className="text-sm text-gray-600">Pay with Visa, Mastercard, or other cards</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-500">Coming Soon</span>
                  </div>
                </div>
              </button>

              {/* Payment Summary */}
              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-2xl font-bold text-gray-900">KSh {amount.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{description}</p>
              </div>
            </div>
          ) : selectedMethod === 'mpesa' ? (
            // M-Pesa Payment
            <div>
              <button
                onClick={() => setSelectedMethod(null)}
                className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← Back to payment methods
              </button>
              <MpesaPayment
                amount={amount}
                description={description}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={() => setSelectedMethod(null)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};