import React from 'react';
import * as Icons from 'lucide-react';
import { ServiceCategory } from '../types';

interface CategoryCardProps {
  category: ServiceCategory;
  onClick: (categoryId: string) => void;
  isSelected: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick, isSelected }) => {
  const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<any>;
  
  return (
    <button
      onClick={() => onClick(category.id)}
      className={`group w-full p-6 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 ${
        isSelected 
          ? 'bg-gradient-to-br ' + category.gradient + ' text-white shadow-2xl scale-105 rotate-1' 
          : 'bg-white/80 backdrop-blur-lg hover:shadow-xl border-2 border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className={`p-4 rounded-2xl transition-all duration-300 ${
          isSelected 
            ? 'bg-white/20 backdrop-blur-sm shadow-lg' 
            : 'bg-gradient-to-br ' + category.gradient + ' text-white group-hover:shadow-lg group-hover:scale-110'
        }`}>
          <IconComponent className="w-8 h-8" />
        </div>
        <div className="text-center">
          <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-900'}`}>
            {category.name}
          </h3>
          <p className={`text-sm mt-1 ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
            {category.description}
          </p>
        </div>
      </div>
    </button>
  );
};