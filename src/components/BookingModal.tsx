import React, { useState } from 'react';
import { X, Star, MapPin, Clock, Calculator, CreditCard } from 'lucide-react';
import { ServiceProvider, BookingData } from '../types';
import { PaymentModal } from './PaymentModal';

interface BookingModalProps {
  provider: ServiceProvider;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: BookingData) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ provider, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 2,
    service: provider.services[0] || '',
    notes: '',
    contactPhone: '',
    contactEmail: ''
  });
  const [showPayment, setShowPayment] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  const calculateCost = () => {
    return provider.hourlyRate * formData.duration;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const booking: BookingData = {
      providerId: provider.id,
      ...formData,
      totalCost: calculateCost()
    };
    setBookingData(booking);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (transactionId: string) => {
    if (bookingData) {
      const finalBooking: BookingData = {
        ...bookingData,
        paymentStatus: 'paid',
        transactionId
      };
      onSubmit(finalBooking);
      setShowPayment(false);
      setBookingData(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Book Service</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {/* Provider Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-4">
                <img 
                  src={provider.image} 
                  alt={provider.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{provider.name}</h3>
                  <p className="text-blue-600">{provider.category}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{provider.rating} ({provider.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{provider.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{provider.responseTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Service and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {provider.services.map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours)
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 8].map(hours => (
                      <option key={hours} value={hours}>{hours} hour{hours > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="+254 700 000 000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Please describe your specific requirements..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Cost Calculation */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Cost Estimate</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Hourly Rate:</span>
                    <span>KSh {provider.hourlyRate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{formData.duration} hour{formData.duration > 1 ? 's' : ''}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">KSh {calculateCost().toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">*Final cost may vary based on actual work required</p>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Proceed to Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={bookingData?.totalCost || 0}
        description={`${provider.name} - ${formData.service}`}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};