import React, { useState } from 'react';
import { Star, MapPin, Clock, Calendar, DollarSign, Users, TrendingUp, Settings, Bell, Edit3 } from 'lucide-react';
import { ProviderProfile } from '../types';

interface ProviderDashboardProps {
  provider: ProviderProfile | null;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ provider }) => {
  if (!provider) {
    return <div className="p-8 text-center text-gray-500">No provider profile found.</div>;
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'earnings' | 'profile'>('overview');

  const mockBookings = [
    {
      id: '1',
      clientName: 'John Doe',
      service: 'Pipe Installation',
      date: '2025-01-15',
      time: '10:00 AM',
      status: 'confirmed',
      amount: 3000
    },
    {
      id: '2',
      clientName: 'Jane Smith',
      service: 'Leak Repair',
      date: '2025-01-16',
      time: '2:00 PM',
      status: 'pending',
      amount: 1500
    },
    {
      id: '3',
      clientName: 'Mike Johnson',
      service: 'Drain Cleaning',
      date: '2025-01-17',
      time: '9:00 AM',
      status: 'completed',
      amount: 2000
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatus = () => {
    if (provider.status === 'approved' && provider.documentsVerified) {
      return { text: 'Verified Provider', color: 'text-green-600', bg: 'bg-green-100' };
    } else if (provider.status === 'pending') {
      return { text: 'Verification Pending', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    } else {
      return { text: 'Verification Required', color: 'text-red-600', bg: 'bg-red-100' };
    }
  };

  const verificationStatus = getVerificationStatus();

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">KSh 45,000</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{provider.completedJobs || 23}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">This month: 8 jobs</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{provider.rating}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">{provider.reviews} reviews</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{provider.responseTime}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">Excellent response</span>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Bookings</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {mockBookings.slice(0, 3).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{booking.clientName}</p>
                    <p className="text-sm text-gray-600">{booking.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">KSh {booking.amount.toLocaleString()}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">All Bookings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockBookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{booking.clientName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.service}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {booking.date} at {booking.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  KSh {booking.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-blue-600 hover:text-blue-900">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Verification Status */}
      <div className={`p-4 rounded-lg ${verificationStatus.bg}`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${verificationStatus.color.replace('text-', 'bg-')}`}></div>
          <span className={`font-medium ${verificationStatus.color}`}>{verificationStatus.text}</span>
        </div>
        {provider.status === 'pending' && (
          <p className="text-sm mt-2 text-gray-600">
            Your application is under review. We'll notify you once verification is complete.
          </p>
        )}
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Profile Information</h3>
          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-6">
            <img 
              src={provider.image} 
              alt={provider.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h4 className="text-xl font-semibold">{provider.name}</h4>
              <p className="text-blue-600">{provider.category}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{provider.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {provider.joinDate?.toLocaleDateString() || 'Recently'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <p className="text-gray-900">{provider.email || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <p className="text-gray-900">{provider.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
              <p className="text-gray-900">KSh {provider.hourlyRate.toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
              <p className="text-gray-900">{provider.experience || 'Not specified'} years</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
            <div className="flex flex-wrap gap-2">
              {provider.services.map((service, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {service}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <p className="text-gray-900">{provider.description}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
              <div className={`px-3 py-1 rounded-full text-sm ${verificationStatus.bg} ${verificationStatus.color}`}>
                {verificationStatus.text}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'bookings', label: 'Bookings' },
            { id: 'earnings', label: 'Earnings' },
            { id: 'profile', label: 'Profile' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'earnings' && renderOverview()} {/* Placeholder */}
        {activeTab === 'profile' && renderProfile()}
      </main>
    </div>
  );
};