import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Phone, Star, Clock } from 'lucide-react';
import { ServiceProvider } from '../types';

interface ProviderMapProps {
  providers: ServiceProvider[];
  selectedProvider?: ServiceProvider | null;
  onProviderSelect?: (provider: ServiceProvider) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export const ProviderMap: React.FC<ProviderMapProps> = ({
  providers,
  selectedProvider,
  onProviderSelect,
  userLocation
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock coordinates for Nairobi areas
  const locationCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'westlands': { lat: -1.2676, lng: 36.8108 },
    'karen': { lat: -1.3197, lng: 36.6859 },
    'cbd': { lat: -1.2864, lng: 36.8172 },
    'kilimani': { lat: -1.2921, lng: 36.7856 },
    'kasarani': { lat: -1.2258, lng: 36.8906 },
    'embakasi': { lat: -1.3031, lng: 36.8929 },
    'lavington': { lat: -1.2833, lng: 36.7667 },
    'kileleshwa': { lat: -1.2833, lng: 36.7833 },
    'runda': { lat: -1.2167, lng: 36.8167 },
    'muthaiga': { lat: -1.2500, lng: 36.8333 }
  };

  const getProviderCoordinates = (provider: ServiceProvider) => {
    const locationKey = provider.location.toLowerCase().split(',')[1]?.trim() || 
                       provider.location.toLowerCase().split(' ')[1] || 
                       'cbd';
    
    return locationCoordinates[locationKey] || locationCoordinates['cbd'];
  };

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      // Center on Nairobi
      const nairobiCenter = { lat: -1.2921, lng: 36.8219 };
      
      const mapInstance = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: userLocation || nairobiCenter,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);
      setIsLoading(false);
    };

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [userLocation]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];

    // Add user location marker
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12)
        }
      });
      newMarkers.push(userMarker);
    }

    // Add provider markers
    providers.forEach((provider, index) => {
      const position = getProviderCoordinates(provider);
      
      const marker = new google.maps.Marker({
        position,
        map: map,
        title: provider.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C11.6 2 8 5.6 8 10c0 6 8 18 8 18s8-12 8-18c0-4.4-3.6-8-8-8z" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
              <circle cx="16" cy="10" r="3" fill="#FFFFFF"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32)
        }
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <div class="flex items-center space-x-3 mb-2">
              <img src="${provider.image}" alt="${provider.name}" class="w-12 h-12 rounded-full object-cover">
              <div>
                <h3 class="font-semibold text-gray-900">${provider.name}</h3>
                <p class="text-blue-600 text-sm">${provider.category}</p>
              </div>
            </div>
            <div class="space-y-1 text-sm text-gray-600">
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span>${provider.rating} (${provider.reviews} reviews)</span>
              </div>
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>${provider.location}</span>
              </div>
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Responds ${provider.responseTime}</span>
              </div>
              <div class="mt-2 pt-2 border-t border-gray-200">
                <p class="font-semibold text-green-600">KSh ${provider.hourlyRate.toLocaleString()}/hour</p>
              </div>
            </div>
            <button 
              onclick="window.selectProvider('${provider.id}')"
              class="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Select Provider
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Global function for info window button
    (window as any).selectProvider = (providerId: string) => {
      const provider = providers.find(p => p.id === providerId);
      if (provider && onProviderSelect) {
        onProviderSelect(provider);
      }
    };

  }, [map, providers, userLocation, onProviderSelect]);

  // Focus on selected provider
  useEffect(() => {
    if (selectedProvider && map) {
      const position = getProviderCoordinates(selectedProvider);
      map.setCenter(position);
      map.setZoom(15);
    }
  }, [selectedProvider, map]);

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-96 rounded-xl shadow-lg" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => {
            if (navigator.geolocation && map) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const userPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  };
                  map.setCenter(userPos);
                  map.setZoom(14);
                },
                (error) => {
                  console.error('Geolocation error:', error);
                }
              );
            }
          }}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Find my location"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Service Providers</span>
          </div>
        </div>
      </div>
    </div>
  );
};