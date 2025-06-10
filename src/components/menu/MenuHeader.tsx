import React from 'react';
import { Plus } from 'lucide-react';

interface MenuHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddItem: () => void;
  isSearchLoading?: boolean;
  isAddLoading?: boolean;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({ searchQuery, onSearchChange, onAddItem, isSearchLoading = false, isAddLoading = false }) => {
  return (
    <div className="fixed top-0 left-0 right-0 flex justify-between items-center px-4 py-3 bg-white rounded-md shadow-sm z-50 max-w-7xl mx-auto">
      <div className="flex-1 max-w-lg">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search menu items..."
          disabled={isSearchLoading}
          className="w-full px-6 py-3 border border-gray-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
        />
      </div>
      <button
        onClick={onAddItem}
        disabled={isAddLoading}
        className="ml-4 px-5 py-3 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary-dark disabled:opacity-50"
      >
        <Plus size={20} />
        Add Item
      </button>
    </div>
  );
};

export default MenuHeader;
