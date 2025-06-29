import { ServiceProvider, ServiceCategory } from '../types';

// Empty providers array - real providers will be added through registration
export const mockProviders: ServiceProvider[] = [];

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
    icon: 'HardHat',
    description: 'Construction and stonework',
    gradient: 'from-gray-500 to-gray-600'
  }
];