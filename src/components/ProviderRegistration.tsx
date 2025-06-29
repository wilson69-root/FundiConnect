import React, { useState } from 'react';
import { User, Briefcase, Shield, Clock, Upload, Plus, X, Check, AlertCircle, CreditCard } from 'lucide-react';
import { ProviderRegistrationData } from '../types';
import { serviceCategories } from '../data/mockData';
import { PaymentModal } from './PaymentModal';

interface ProviderRegistrationProps {
  onSubmit: (data: ProviderRegistrationData) => void;
  onClose: () => void;
}

export const ProviderRegistration: React.FC<ProviderRegistrationProps> = ({ onSubmit, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProviderRegistrationData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      profileImage: ''
    },
    businessInfo: {
      category: '',
      services: [],
      hourlyRate: 0,
      experience: 0,
      description: '',
      responseTime: '< 1 hour'
    },
    credentials: {
      certifications: [],
      portfolio: [],
      idDocument: '',
      businessLicense: ''
    },
    availability: {
      workingDays: [],
      workingHours: {
        start: '08:00',
        end: '18:00'
      },
      serviceAreas: []
    }
  });

  const [newService, setNewService] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newServiceArea, setNewServiceArea] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [registrationFee] = useState(100); // KSh 100 registration fee

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Business Details', icon: Briefcase },
    { id: 3, title: 'Credentials', icon: Shield },
    { id: 4, title: 'Availability', icon: Clock },
    { id: 5, title: 'Payment', icon: CreditCard }
  ];

  const workingDaysOptions = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const responseTimeOptions = [
    '< 15 mins', '< 30 mins', '< 1 hour', '< 2 hours', '< 4 hours', 'Same day'
  ];

  const handleInputChange = (section: keyof ProviderRegistrationData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayAdd = (section: keyof ProviderRegistrationData, field: string, value: string) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section][field] as string[]), value.trim()]
      }
    }));
  };

  const handleArrayRemove = (section: keyof ProviderRegistrationData, field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: (prev[section][field] as string[]).filter((_, i) => i !== index)
      }
    }));
  };

  const handleWorkingDayToggle = (day: string) => {
    const currentDays = formData.availability.workingDays;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    handleInputChange('availability', 'workingDays', newDays);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.personalInfo.fullName && formData.personalInfo.email && 
                 formData.personalInfo.phone && formData.personalInfo.location);
      case 2:
        return !!(formData.businessInfo.category && formData.businessInfo.services.length > 0 && 
                 formData.businessInfo.hourlyRate > 0 && formData.businessInfo.description);
      case 3:
        return true; // Optional step
      case 4:
        return !!(formData.availability.workingDays.length > 0 && 
                 formData.availability.serviceAreas.length > 0);
      case 5:
        return true; // Payment step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 4) {
        // Show payment step
        setCurrentStep(5);
      } else {
        setCurrentStep(prev => Math.min(prev + 1, 5));
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePaymentSuccess = (transactionId: string) => {
    // Add payment info to form data
    const finalData = {
      ...formData,
      paymentInfo: {
        transactionId,
        amount: registrationFee,
        status: 'paid',
        paidAt: new Date()
      }
    };
    
    onSubmit(finalData);
    setShowPayment(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
              <p className="text-gray-600">Tell us about yourself</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.fullName}
                  onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+254 700 000 000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.location}
                  onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nairobi, Westlands"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Business Details</h3>
              <p className="text-gray-600">Tell us about your services</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Category *
                </label>
                <select
                  value={formData.businessInfo.category}
                  onChange={(e) => handleInputChange('businessInfo', 'category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {serviceCategories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (KSh) *
                </label>
                <input
                  type="number"
                  value={formData.businessInfo.hourlyRate}
                  onChange={(e) => handleInputChange('businessInfo', 'hourlyRate', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  value={formData.businessInfo.experience}
                  onChange={(e) => handleInputChange('businessInfo', 'experience', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Time *
                </label>
                <select
                  value={formData.businessInfo.responseTime}
                  onChange={(e) => handleInputChange('businessInfo', 'responseTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {responseTimeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Services Offered *
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a service"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleArrayAdd('businessInfo', 'services', newService);
                      setNewService('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleArrayAdd('businessInfo', 'services', newService);
                    setNewService('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.businessInfo.services.map((service, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{service}</span>
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('businessInfo', 'services', index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description *
              </label>
              <textarea
                value={formData.businessInfo.description}
                onChange={(e) => handleInputChange('businessInfo', 'description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe your business and what makes you unique..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Credentials & Portfolio</h3>
              <p className="text-gray-600">Build trust with your credentials</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certifications
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a certification"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleArrayAdd('credentials', 'certifications', newCertification);
                      setNewCertification('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleArrayAdd('credentials', 'certifications', newCertification);
                    setNewCertification('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.credentials.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{cert}</span>
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('credentials', 'certifications', index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Document
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload ID copy</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business License (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload license</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Upload your work samples</p>
                <p className="text-sm text-gray-500">Multiple images allowed</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Availability</h3>
              <p className="text-gray-600">Set your working schedule</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Working Days *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {workingDaysOptions.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleWorkingDayToggle(day)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.availability.workingDays.includes(day)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.availability.workingHours.start}
                  onChange={(e) => handleInputChange('availability', 'workingHours', {
                    ...formData.availability.workingHours,
                    start: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.availability.workingHours.end}
                  onChange={(e) => handleInputChange('availability', 'workingHours', {
                    ...formData.availability.workingHours,
                    end: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Areas *
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newServiceArea}
                  onChange={(e) => setNewServiceArea(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a service area (e.g., Westlands, CBD)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleArrayAdd('availability', 'serviceAreas', newServiceArea);
                      setNewServiceArea('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleArrayAdd('availability', 'serviceAreas', newServiceArea);
                    setNewServiceArea('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.availability.serviceAreas.map((area, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{area}</span>
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('availability', 'serviceAreas', index)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Payment</h3>
              <p className="text-gray-600">Complete your registration with a one-time payment</p>
            </div>

            {/* Registration Fee Information */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-green-900 mb-2">Registration Fee</h4>
                <p className="text-3xl font-bold text-green-600 mb-2">KSh {registrationFee.toLocaleString()}</p>
                <p className="text-green-700 text-sm">One-time payment to join FundiConnect</p>
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">What's included in your registration:</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Profile verification and approval</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Access to customer bookings</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">AI-powered customer matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">WhatsApp and Telegram bot integration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Provider dashboard and analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">24/7 customer support</span>
                </div>
              </div>
            </div>

            {/* Payment Notice */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Secure Payment</p>
                  <p>Your payment will be processed securely through M-Pesa. After successful payment, your application will be reviewed and approved within 24 hours.</p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={() => setShowPayment(true)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>Pay KSh {registrationFee} & Complete Registration</span>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Join as Service Provider</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center space-x-2 ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-blue-100' : isCompleted ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                      <span className="font-medium hidden sm:block">{step.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-3 items-center">
              {!validateStep(currentStep) && currentStep < 5 && (
                <div className="flex items-center text-orange-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Please fill all required fields
                </div>
              )}
              
              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStep === 4 ? 'Proceed to Payment' : 'Next'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={registrationFee}
        description={`FundiConnect Provider Registration - ${formData.personalInfo.fullName}`}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};