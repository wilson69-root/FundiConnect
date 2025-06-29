import React, { useState } from 'react';
import { Search, MessageCircle, Users, Star, CheckCircle, Phone, Mail, MapPin, UserPlus, Menu, X, Home, Info, HelpCircle, ChevronDown } from 'lucide-react';
import { ServiceProvider, BookingData, ProviderRegistrationData, ProviderProfile } from './types';
import { mockProviders, serviceCategories } from './data/mockData';
import { ProviderCard } from './components/ProviderCard';
import { BookingModal } from './components/BookingModal';
import { WhatsAppChat } from './components/WhatsAppChat';
import { CategoryCard } from './components/CategoryCard';
import { ProviderRegistration } from './components/ProviderRegistration';
import { ProviderDashboard } from './components/ProviderDashboard';

function App() {
  const [activeTab, setActiveTab] = useState<'browse' | 'chat' | 'dashboard'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<ProviderProfile | null>(null);
  const [providers, setProviders] = useState<ServiceProvider[]>(mockProviders);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);

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
    
    if (bookingData.paymentStatus === 'paid') {
      alert('Booking confirmed! Payment successful. We will contact you shortly to confirm the appointment.');
    } else {
      alert('Booking request submitted! Please complete payment to confirm your appointment.');
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? '' : categoryId);
    setActiveTab('browse');
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
      completedJobs: 0,
      registrationPayment: registrationData.paymentInfo
    };

    // Add to providers list (in a real app, this would be sent to backend)
    setProviders(prev => [...prev, newProvider]);
    setCurrentProvider(newProvider);
    setIsRegistrationModalOpen(false);
    setActiveTab('dashboard');
    
    alert('Registration and payment successful! Your application is under review. You will receive confirmation within 24 hours.');
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
    // For demo, create a sample provider profile
    const demoProvider: ProviderProfile = {
      id: 'demo_provider_1',
      name: 'Demo Provider',
      category: 'Plumbing',
      rating: 4.8,
      reviews: 124,
      hourlyRate: 1500,
      location: 'Nairobi, Westlands',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: true,
      responseTime: '< 30 mins',
      description: 'Expert plumber with 8+ years experience in residential and commercial plumbing.',
      services: ['Pipe Installation', 'Leak Repairs', 'Drain Cleaning', 'Water Heater Service'],
      availability: 'online',
      status: 'approved',
      registrationDate: new Date('2024-01-15'),
      documentsVerified: true,
      backgroundCheckStatus: 'completed',
      joinDate: new Date('2024-01-15'),
      completedJobs: 23,
      email: 'demo.provider@email.com',
      phone: '+254700000000',
      experience: 8,
      certifications: ['Licensed Plumber', 'Water Systems Specialist'],
      registrationPayment: {
        transactionId: 'DEMO_12345',
        amount: 100,
        status: 'paid',
        paidAt: new Date('2024-01-15')
      }
    };
    
    setCurrentProvider(demoProvider);
    setActiveTab('dashboard');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50">
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
            <nav className="hidden lg:flex items-center space-x-6">
              <div className="relative">
                <button
                  onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105 px-3 py-2 rounded-lg hover:bg-blue-50"
                >
                  <span>Services</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showServicesDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showServicesDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 text-sm font-semibold text-gray-500 border-b border-gray-100">
                      Available Services
                    </div>
                    {serviceCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          handleCategoryClick(category.id);
                          setShowServicesDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center space-x-3"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                          <span className="text-white text-sm">🔧</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-500">{category.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105 px-3 py-2 rounded-lg hover:bg-blue-50"
              >
                How it Works
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105 px-3 py-2 rounded-lg hover:bg-blue-50"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105 px-3 py-2 rounded-lg hover:bg-blue-50"
              >
                Contact
              </button>
              
              <div className="flex items-center space-x-3 ml-6 border-l border-gray-200 pl-6">
                <button
                  onClick={() => setIsRegistrationModalOpen(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Join as Provider</span>
                </button>
                <button
                  onClick={handleProviderLogin}
                  className="text-blue-600 hover:text-blue-700 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-blue-50"
                >
                  Provider Login
                </button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-lg">
              <div className="flex flex-col space-y-3">
                <div className="border-b border-gray-100 pb-3 mb-3">
                  <p className="text-sm font-semibold text-gray-500 mb-2">Services</p>
                  <div className="grid grid-cols-2 gap-2">
                    {serviceCategories.slice(0, 4).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          handleCategoryClick(category.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-left p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-left text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                >
                  How it Works
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-left text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-left text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                >
                  Contact
                </button>
                
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
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
                    className="text-blue-600 hover:text-blue-700 transition-colors font-medium py-2"
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
          <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 text-white py-20 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="animate-fade-in-up">
                <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  Find Trusted Service Providers
                  <span className="block text-2xl md:text-3xl mt-4 text-blue-100 font-light">
                    Instantly with AI-Powered Matching
                  </span>
                </h2>
                <p className="text-lg md:text-xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
                  Connect with verified professionals for all your service needs. Get instant quotations through our AI assistant or browse our curated marketplace.
                </p>
                
                {/* Simple Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="group bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl min-w-[200px] text-lg"
                  >
                    <Search className="w-6 h-6 group-hover:animate-pulse" />
                    <span>Find Providers</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="group bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl min-w-[200px] text-lg"
                  >
                    <MessageCircle className="w-6 h-6 group-hover:animate-bounce" />
                    <span>Chat with AI</span>
                  </button>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => setIsRegistrationModalOpen(true)}
                    className="text-blue-100 hover:text-white transition-colors font-medium text-lg underline decoration-2 underline-offset-4"
                  >
                    Are you a service provider? Join us for just KSh 100 →
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Navigation Tabs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap justify-center gap-3 bg-white/80 backdrop-blur-lg p-3 rounded-2xl w-fit mx-auto shadow-lg border border-white/20">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'browse'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Browse</span>
                <span className="sm:hidden">Find</span>
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
                <span className="hidden sm:inline">AI Chat</span>
                <span className="sm:hidden">Chat</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            {activeTab === 'browse' ? (
              <div className="space-y-8">
                {/* Search and Filters */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
                  <div className="relative mb-6">
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
                {filteredProviders.length > 0 ? (
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
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">No providers found</h3>
                    <p className="text-gray-600 text-lg mb-6">
                      {providers.length === 0 
                        ? "Be the first to join our marketplace! Register as a service provider to get started."
                        : "Try adjusting your search or filters, or check back later for new providers."
                      }
                    </p>
                    <button
                      onClick={() => setIsRegistrationModalOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Join as Service Provider
                    </button>
                  </div>
                )}
              </div>
            ) : activeTab === 'chat' ? (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h3 className="text-4xl font-bold text-gray-900 mb-6">AI-Powered Assistant</h3>
                  <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
                    Chat with our intelligent assistant to get instant service provider recommendations and quotations. 
                    Just describe what you need in simple language!
                  </p>
                </div>
                <div className="max-w-3xl mx-auto">
                  <WhatsAppChat onBookProvider={handleBookProviderFromChat} />
                </div>
              </div>
            ) : null}
          </main>

          {/* How It Works Section */}
          <section id="how-it-works" className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">How FundiConnect Works</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">Simple, fast, and reliable service booking in three easy steps</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                    <Search className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-6">1. Search or Chat</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">Browse our marketplace or use our AI assistant to describe your service needs in natural language.</p>
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
                  <p className="text-gray-600 text-lg leading-relaxed">Review quotations, pay securely with M-Pesa, and enjoy reliable service delivery.</p>
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">About FundiConnect</h2>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    FundiConnect is Kenya's leading AI-powered service marketplace, connecting customers with trusted, verified service providers across the country.
                  </p>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Our intelligent matching system ensures you find the right professional for your needs, whether it's plumbing, cleaning, electrical work, or any other service.
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{providers.length}+</div>
                      <div className="text-gray-600">Registered Providers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600 mb-2">24/7</div>
                      <div className="text-gray-600">AI Assistant Available</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-semibold mb-6">Why Choose FundiConnect?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">Verified Professionals</h4>
                        <p className="text-gray-600">All providers are background-checked and verified</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">AI-Powered Matching</h4>
                        <p className="text-gray-600">Smart algorithms find the perfect provider for your needs</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">Secure Payments</h4>
                        <p className="text-gray-600">Pay safely with M-Pesa integration</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">24/7 Support</h4>
                        <p className="text-gray-600">Our AI assistant is always available to help</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Have questions? Need support? We're here to help you connect with the right service providers.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Call Us</h3>
                  <p className="text-gray-300 mb-2">+254 700 000 000</p>
                  <p className="text-gray-400 text-sm">Mon-Fri 8AM-6PM</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Email Us</h3>
                  <p className="text-gray-300 mb-2">support@fundiconnect.com</p>
                  <p className="text-gray-400 text-sm">We reply within 24 hours</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Chat with AI</h3>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    Start conversation →
                  </button>
                  <p className="text-gray-400 text-sm mt-2">Available 24/7</p>
                </div>
              </div>
              
              <div className="border-t border-gray-700 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400">© 2025 FundiConnect. All rights reserved.</p>
                <p className="text-gray-400 mt-4 md:mt-0">Made with ❤️ in Kenya</p>
              </div>
            </div>
          </section>
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

      {/* Click outside to close dropdowns */}
      {showServicesDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowServicesDropdown(false)}
        />
      )}
    </div>
  );
}

export default App;