import { ServiceProvider, ServiceCategory } from '../types';

export const mockProviders: ServiceProvider[] = [
  {
    id: '1',
    name: 'John Kamau',
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
    availability: 'online'
  },
  {
    id: '2',
    name: 'Mary Wanjiku',
    category: 'Cleaning',
    rating: 4.9,
    reviews: 89,
    hourlyRate: 800,
    location: 'Nairobi, Karen',
    image: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true,
    responseTime: '< 15 mins',
    description: 'Professional cleaning service with eco-friendly products and attention to detail.',
    services: ['House Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Move-in/out Cleaning'],
    availability: 'online'
  },
  {
    id: '3',
    name: 'Peter Mwangi',
    category: 'Electrical',
    rating: 4.7,
    reviews: 156,
    hourlyRate: 2000,
    location: 'Nairobi, CBD',
    image: 'https://images.pexels.com/photos/1472443/pexels-photo-1472443.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true,
    responseTime: '< 45 mins',
    description: 'Licensed electrician specializing in residential and commercial electrical work.',
    services: ['Wiring Installation', 'Electrical Repairs', 'Security Systems', 'Solar Installation'],
    availability: 'busy'
  },
  {
    id: '4',
    name: 'Grace Nyambura',
    category: 'Beauty',
    rating: 5.0,
    reviews: 67,
    hourlyRate: 3000,
    location: 'Nairobi, Kilimani',
    image: 'https://images.pexels.com/photos/3373714/pexels-photo-3373714.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true,
    responseTime: '< 20 mins',
    description: 'Professional makeup artist and hairstylist for all occasions.',
    services: ['Bridal Makeup', 'Hair Styling', 'Manicure/Pedicure', 'Facial Treatments'],
    availability: 'online'
  },
  {
    id: '5',
    name: 'David Kiprop',
    category: 'Carpentry',
    rating: 4.6,
    reviews: 98,
    hourlyRate: 1800,
    location: 'Nairobi, Kasarani',
    image: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true,
    responseTime: '< 1 hour',
    description: 'Skilled carpenter with expertise in custom furniture and home renovations.',
    services: ['Custom Furniture', 'Kitchen Cabinets', 'Door Installation', 'Home Repairs'],
    availability: 'online'
  },
  {
    id: '6',
    name: 'Sarah Atieno',
    category: 'Tutoring',
    rating: 4.9,
    reviews: 234,
    hourlyRate: 2500,
    location: 'Nairobi, Lavington',
    image: 'https://images.pexels.com/photos/3184632/pexels-photo-3184632.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true,
    responseTime: '< 10 mins',
    description: 'Experienced mathematics and science tutor for all levels.',
    services: ['Mathematics Tutoring', 'Physics', 'Chemistry', 'KCSE Preparation'],
    availability: 'online'
  },
  {
    id: '7',
    name: 'James Muthoni',
    category: 'Masonry',
    rating: 4.7,
    reviews: 142,
    hourlyRate: 2200,
    location: 'Nairobi, Embakasi',
    image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true,
    responseTime: '< 1 hour',
    description: 'Professional mason with 12+ years experience in construction and stonework.',
    services: ['Stone Wall Construction', 'Brick Laying', 'Concrete Work', 'Foundation Repair', 'Retaining Walls'],
    availability: 'online'
  },
  {
    id: '8',
    name: 'Michael Ochieng',
    category: 'Masonry',
    rating: 4.5,
    reviews: 87,
    hourlyRate: 1900,
    location: 'Nairobi, Kahawa',
    image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true,
    responseTime: '< 2 hours',
    description: 'Skilled mason specializing in decorative stonework and residential construction.',
    services: ['Decorative Stone Work', 'Paving', 'Chimney Construction', 'Block Work', 'Plastering'],
    availability: 'busy'
  }
];

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: 'Wrench',
    description: 'Professional plumbing services',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: 'Sparkles',
    description: 'Home and office cleaning',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: 'Zap',
    description: 'Electrical installations and repairs',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'beauty',
    name: 'Beauty',
    icon: 'Sparkles',
    description: 'Beauty and wellness services',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    icon: 'Hammer',
    description: 'Furniture and woodwork',
    gradient: 'from-amber-600 to-orange-600'
  },
  {
    id: 'tutoring',
    name: 'Tutoring',
    icon: 'BookOpen',
    description: 'Educational tutoring services',
    gradient: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'masonry',
    name: 'Masonry',
    icon: 'Building',
    description: 'Stone and brick construction',
    gradient: 'from-gray-500 to-gray-600'
  }
];