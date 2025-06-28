import React from 'react';
import { Star, MapPin, Clock, Shield, Phone, Calendar, Zap } from 'lucide-react';
import { ServiceProvider } from '../types';

interface ProviderCardProps {
  provider: ServiceProvider;
  onBook: (provider: ServiceProvider) => void;
  onCall: (provider: ServiceProvider) => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onBook, onCall }) => {
  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case 'online': return 'Available';
      case 'busy': return 'Busy';
      default: return 'Offline';
    }
  };

  return (
    <div className="group bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-white/20">
      <div className="relative overflow-hidden">
        <img 
          src={provider.image} 
          alt={provider.name}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-4 right-4 flex flex-col items-end space-y-2">
          {provider.verified && (
            <div className="bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center space-x-1 text-sm font-medium shadow-lg">
              <Shield size={14} />
              <span>Verified</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(provider.availability)} shadow-lg`}></div>
            <span className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-sm font-medium">
              {getAvailabilityText(provider.availability)}
            </span>
          </div>
        </div>

        {/* Quick Response Badge */}
        <div className="absolute bottom-4 left-4 bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center space-x-1 text-sm font-medium shadow-lg">
          <Zap size={14} />
          <span>{provider.responseTime}</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {provider.name}
            </h3>
            <p className="text-blue-600 font-semibold text-lg">{provider.category}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 mb-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-lg">{provider.rating}</span>
            </div>
            <p className="text-sm text-gray-500">({provider.reviews} reviews)</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{provider.description}</p>

        {/* Info */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
            <span>{provider.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-emerald-500" />
            <span>Responds {provider.responseTime}</span>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {provider.services.slice(0, 2).map((service, index) => (
              <span 
                key={index}
                className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
              >
                {service}
              </span>
            ))}
            {provider.services.length > 2 && (
              <span className="text-gray-500 text-xs font-medium bg-gray-100 px-3 py-1 rounded-full">
                +{provider.services.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-3xl font-bold text-gray-900">KSh {provider.hourlyRate.toLocaleString()}</span>
              <span className="text-gray-500 text-sm ml-1">/hour</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Starting from</p>
              <p className="text-sm font-semibold text-green-600">Negotiable</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            onClick={() => onCall(provider)}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl"
          >
            <Phone size={18} />
            <span>Call</span>
          </button>
          <button
            onClick={() => onBook(provider)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl"
          >
            <Calendar size={18} />
            <span>Book Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};