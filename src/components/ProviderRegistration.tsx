import React, { useState } from 'react';
import { User, Briefcase, Clock, Upload, Plus, X, Check, AlertCircle } from 'lucide-react';
import { ProviderRegistrationData } from '../types';
import { serviceCategories } from '../data/mockData';

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
  const [newServiceArea, setNewServiceArea] = useState('');

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Business Details', icon: Briefcase },
    { id: 3, title: 'Availability', icon: Clock }
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
        [field]: Array.isArray((prev as any)[section]?.[field]) ? [...((prev as any)[section][field] as string[]), value.trim()] : [value.trim()]
      }
    }));
  };

  const handleArrayRemove = (section: keyof ProviderRegistrationData, field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: Array.isArray((prev as any)[section]?.[field]) ? ((prev as any)[section][field] as string[]).filter((_, i) => i !== index) : []
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
        return !!(formData.availability.workingDays.length > 0 && 
                 formData.availability.serviceAreas.length > 0);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(3)) {
      // Add free registration info
      const finalData = {
        ...formData,
        paymentInfo: {
          transactionId: `FREE_${Date.now()}`,
          amount: 0,
          status: 'paid' as const,
          paidAt: new Date()
        }
      };
      
      onSubmit(finalData);
    }
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
                <label htmlFor="provider-full-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="provider-full-name"
                  name="fullName"
                  value={formData.personalInfo.fullName}
                  onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="provider-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="provider-email"
                  name="email"
                  value={formData.personalInfo.email}
                  onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="provider-phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="provider-phone"
                  name="phone"
                  value={formData.personalInfo.phone}
                  onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+254 700 000 000"
                  autoComplete="tel"
                />
              </div>

              <div>
                <label htmlFor="provider-location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="provider-location"
                  name="location"
                  value={formData.personalInfo.location}
                  onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nairobi, Westlands"
                  autoComplete="address-level2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">PNG, JPG up to 5MB (Optional)</p>
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
                <label htmlFor="provider-category" className="block text-sm font-medium text-gray-700 mb-2">
                  Service Category *
                </label>
                <select
                  id="provider-category"
                  name="category"
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
                <label htmlFor="provider-hourly-rate" className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (KSh) *
                </label>
                <input
                  type="number"
                  id="provider-hourly-rate"
                  name="hourlyRate"
                  value={formData.businessInfo.hourlyRate}
                  onChange={(e) => handleInputChange('businessInfo', 'hourlyRate', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1500"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="provider-experience" className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  id="provider-experience"
                  name="experience"
                  value={formData.businessInfo.experience}
                  onChange={(e) => handleInputChange('businessInfo', 'experience', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="provider-response-time" className="block text-sm font-medium text-gray-700 mb-2">
                  Response Time *
                </label>
                <select
                  id="provider-response-time"
                  name="responseTime"
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
              <label htmlFor="new-service-input" className="block text-sm font-medium text-gray-700 mb-2">
                Services Offered *
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  id="new-service-input"
                  name="newService"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a service"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
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
                      aria-label={`Remove ${service}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="provider-description" className="block text-sm font-medium text-gray-700 mb-2">
                Business Description *
              </label>
              <textarea
                id="provider-description"
                name="description"
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
                    aria-pressed={formData.availability.workingDays.includes(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  id="start-time"
                  name="startTime"
                  value={formData.availability.workingHours.start}
                  onChange={(e) => handleInputChange('availability', 'workingHours', {
                    ...formData.availability.workingHours,
                    start: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  id="end-time"
                  name="endTime"
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
              <label htmlFor="new-service-area" className="block text-sm font-medium text-gray-700 mb-2">
                Service Areas *
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  id="new-service-area"
                  name="newServiceArea"
                  value={newServiceArea}
                  onChange={(e) => setNewServiceArea(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a service area (e.g., Westlands, CBD)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
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
                      aria-label={`Remove ${area}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Instant Approval Notice */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-green-900 mb-2">Instant Approval!</h4>
                <p className="text-green-700 text-lg font-medium mb-2">Go live immediately - No waiting!</p>
                <p className="text-green-600 text-sm">Your profile will be active and searchable as soon as you complete registration</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Join as Service Provider - FREE!</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
            aria-label="Close registration modal"
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
            type="button"
          >
            Previous
          </button>
          
          <div className="flex space-x-3 items-center">
            {!validateStep(currentStep) && (
              <div className="flex items-center text-orange-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                Please fill all required fields
              </div>
            )}
            
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!validateStep(currentStep)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                type="button"
              >
                Go Live Instantly - FREE!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};