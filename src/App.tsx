import React, { useState } from 'react';
import { Search, MessageCircle, Users, Star, CheckCircle, Phone, Mail, MapPin, UserPlus, Menu, X, QrCode } from 'lucide-react';
import { ServiceProvider, BookingData, ProviderRegistrationData, ProviderProfile } from './types';
import { mockProviders, serviceCategories } from './data/mockData';
import { ProviderCard } from './components/ProviderCard';
import { BookingModal } from './components/BookingModal';
import { WhatsAppChat } from './components/WhatsAppChat';
import { CategoryCard } from './components/CategoryCard';
import { ProviderRegistration } from './components/ProviderRegistration';
import { ProviderDashboard } from './components/ProviderDashboard';
import { QRCodeGenerator } from './components/QRCodeGenerator';

function App() {
  const [activeTab, setActiveTab] = useState<'browse' | 'chat' | 'dashboard' | 'qr-generator'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<ProviderProfile | null>(null);
  const [providers, setProviders] = useState<ServiceProvider[]>(mockProviders);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || provider.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleBookProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setIsBookingModalOpen(true);
  };

  const handleBookProviderFromChat = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      setSelectedProvider(provider);
      setIsBookingModalOpen(true);
      setActiveTab('browse');
    }
  };

  const handleCallProvider = (provider: ServiceProvider) => {
    window.open(`tel:+254700000000`, '_self');
  };

  const handleBookingSubmit = (bookingData: BookingData) => {
    console.log('Booking submitted:', bookingData);
    setIsBookingModalOpen(false);
    setSelectedProvider(null);
    alert('Booking request submitted successfully! We will contact you shortly to confirm.');
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? '' : categoryId);
  };

  const handleProviderRegistration = (registrationData: ProviderRegistrationData) => {
    // Create new provider profile
    const newProvider: ProviderProfile = {
      id: `provider_${Date.now()}`,
      name: registrationData.personalInfo.fullName,
      category: registrationData.businessInfo.category,
      rating: 0,
      reviews: 0,
      hourlyRate: registrationData.businessInfo.hourlyRate,
      location: registrationData.personalInfo.location,
      image: registrationData.personalInfo.profileImage || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: false,
      responseTime: registrationData.businessInfo.responseTime,
      description: registrationData.businessInfo.description,
      services: registrationData.businessInfo.services,
      availability: 'offline',
      email: registrationData.personalInfo.email,
      phone: registrationData.personalInfo.phone,
      experience: registrationData.businessInfo.experience,
      certifications: registrationData.credentials.certifications,
      status: 'pending',
      registrationDate: new Date(),
      documentsVerified: false,
      backgroundCheckStatus: 'pending',
      joinDate: new Date(),
      completedJobs: 0
    };

    // Add to providers list (in a real app, this would be sent to backend)
    setProviders(prev => [...prev, newProvider]);
    setCurrentProvider(newProvider);
    setIsRegistrationModalOpen(false);
    setActiveTab('dashboard');
    
    alert('Registration submitted successfully! Your application is under review.');
  };

  const handleProviderUpdate = (updates: Partial<ProviderProfile>) => {
    if (currentProvider) {
      const updatedProvider = { ...currentProvider, ...updates };
      setCurrentProvider(updatedProvider);
      
      // Update in providers list
      setProviders(prev => prev.map(p => 
        p.id === currentProvider.id ? updatedProvider : p
      ));
    }
  };

  // Mock login for demo purposes
  const handleProviderLogin = () => {
    // For demo, use the first provider as logged in user
    const demoProvider: ProviderProfile = {
      ...mockProviders[0],
      status: 'approved',
      registrationDate: new Date('2024-01-15'),
      documentsVerified: true,
      backgroundCheckStatus: 'completed',
      joinDate: new Date('2024-01-15'),
      completedJobs: 23,
      email: 'john.kamau@email.com',
      phone: '+254700000000',
      experience: 8,
      certifications: ['Licensed Plumber', 'Water Systems Specialist']
    };
    
    setCurrentProvider(demoProvider);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                  FundiConnect
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">AI-Powered Service Marketplace</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105">Services</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105">How it Works</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105">About</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105">Contact</a>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('qr-generator')}
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  <QrCode className="w-4 h-4" />
                  <span>QR Generator</span>
                </button>
                <button
                  onClick={() => setIsRegistrationModalOpen(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Join as Provider</span>
                </button>
                <button
                  onClick={handleProviderLogin}
                  className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                >
                  Provider Login
                </button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-lg">
              <div className="flex flex-col space-y-4">
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Services</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">How it Works</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">About</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Contact</a>
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setActiveTab('qr-generator');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR Generator</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsRegistrationModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Join as Provider</span>
                  </button>
                  <button
                    onClick={() => {
                      handleProviderLogin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                  >
                    Provider Login
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Show Dashboard if provider is logged in */}
      {currentProvider && activeTab === 'dashboard' ? (
        <ProviderDashboard 
          provider={currentProvider} 
          onUpdateProfile={handleProviderUpdate}
        />
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 text-white py-24 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="animate-fade-in-up">
                <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                  Find Trusted Service Providers
                  <span className="block text-3xl md:text-4xl mt-4 text-blue-100 font-light">
                    Instantly with AI-Powered Matching
                  </span>
                </h2>
                <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed">
                  Connect with verified professionals for all your service needs. Get instant quotations through our WhatsApp bot or browse our curated marketplace.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="group bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl min-w-[200px]"
                  >
                    <MessageCircle className="w-6 h-6 group-hover:animate-bounce" />
                    <span>Try WhatsApp Bot</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="group bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white px-8 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl min-w-[200px]"
                  >
                    <Search className="w-6 h-6 group-hover:animate-pulse" />
                    <span>Browse Providers</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('qr-generator')}
                    className="group bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl min-w-[200px]"
                  >
                    <QrCode className="w-6 h-6 group-hover:animate-pulse" />
                    <span>QR Code Generator</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Tab Navigation */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-wrap justify-center gap-2 bg-white/80 backdrop-blur-lg p-2 rounded-2xl w-fit mx-auto shadow-lg border border-white/20">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'browse'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Browse Providers</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Bot</span>
              </button>
              <button
                onClick={() => setActiveTab('qr-generator')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'qr-generator'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QR Generator</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            {activeTab === 'browse' ? (
              <div className="space-y-8">
                {/* Search and Filters */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                  <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                      type="text"
                      placeholder="Search by name, service, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg bg-white/50 backdrop-blur-sm"
                    />
                  </div>

                  {/* Categories */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                    {serviceCategories.map((category) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        onClick={handleCategoryClick}
                        isSelected={selectedCategory === category.id}
                      />
                    ))}
                  </div>
                </div>

                {/* Results */}
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    {selectedCategory 
                      ? `${serviceCategories.find(c => c.id === selectedCategory)?.name} Providers`
                      : 'Available Service Providers'
                    }
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                {/* Provider Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProviders.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      onBook={handleBookProvider}
                      onCall={handleCallProvider}
                    />
                  ))}
                </div>

                {filteredProviders.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">No providers found</h3>
                    <p className="text-gray-600 text-lg">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            ) : activeTab === 'chat' ? (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h3 className="text-4xl font-bold text-gray-900 mb-6">AI-Powered WhatsApp Bot</h3>
                  <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
                    Chat with our intelligent bot to get instant service provider recommendations and quotations. 
                    Just describe what you need in natural language!
                  </p>
                </div>
                <div className="max-w-3xl mx-auto">
                  <WhatsAppChat onBookProvider={handleBookProviderFromChat} />
                </div>
              </div>
            ) : activeTab === 'qr-generator' ? (
              <div className="space-y-8">
                <QRCodeGenerator />
              </div>
            ) : null}
          </main>

          {/* How It Works Section */}
          <section className="bg-white py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <h2 className="text-5xl font-bold text-gray-900 mb-6">How FundiConnect Works</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">Simple, fast, and reliable service booking in three easy steps</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                    <Search className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-6">1. Search or Chat</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">Browse our marketplace or use our AI bot to describe your service needs in natural language.</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-6">2. Get Matched</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">Our AI matches you with the best providers based on location, ratings, and availability.</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-6">3. Book & Pay</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">Review quotations, book your preferred provider, and enjoy reliable service delivery.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div>
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">FundiConnect</h3>
                      <p className="text-sm text-gray-300">AI-Powered Marketplace</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Connecting you with trusted service providers across Kenya through AI-powered matching and intelligent automation.
                  </p>
                  <div className="flex space-x-4">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                      <Phone className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                      <Mail className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                      <MapPin className="w-5 h-5 text-gray-300" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xl font-semibold mb-6">Services</h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="hover:text-white transition-colors cursor-pointer">Plumbing</li>
                    <li className="hover:text-white transition-colors cursor-pointer">Cleaning</li>
                    <li className="hover:text-white transition-colors cursor-pointer">Electrical</li>
                    <li className="hover:text-white transition-colors cursor-pointer">Beauty & Wellness</li>
                    <li className="hover:text-white transition-colors cursor-pointer">Carpentry</li>
                    <li className="hover:text-white transition-colors cursor-pointer">Tutoring</li>
                    <li className="hover:text-white transition-colors cursor-pointer">Masonry</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xl font-semibold mb-6">Company</h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="hover:text-white transition-colors cursor-pointer">About Us</li>
                    <li className="hover:text-white transition-colors cursor-pointer">How it Works</li>
                    <li className="hover:text-white transition-colors cursor-pointer">Pricing</li>
                    <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
                    <li className="hover:text-white transition-colors cursor-pointer">Careers</li>
                    <li className="hover:text-white transition-colors cursor-pointer">Blog</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xl font-semibold mb-6">Support</h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="hover:text-white transition-colors cursor-pointer">Help Center</li>
                    <li className="hover:text-white transition-colors cursor-pointer">Safety</li>
                    <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
                    <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
                    <li className="hover:text-white transition-colors cursor-pointer">Trust & Safety</li>
                    <li className="hover:text-white transition-colors cursor-pointer">Become a Provider</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-700 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400">© 2025 FundiConnect. All rights reserved.</p>
                <p className="text-gray-400 mt-4 md:mt-0">Made with ❤️ in Kenya</p>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Booking Modal */}
      {selectedProvider && (
        <BookingModal
          provider={selectedProvider}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedProvider(null);
          }}
          onSubmit={handleBookingSubmit}
        />
      )}

      {/* Provider Registration Modal */}
      {isRegistrationModalOpen && (
        <ProviderRegistration
          onSubmit={handleProviderRegistration}
          onClose={() => setIsRegistrationModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;