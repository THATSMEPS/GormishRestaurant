// import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { MenuItem } from '../../types/menu'; // Assuming MenuItem type is defined here
import Card from '../ui/Card';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
  isEditLoading?: boolean;
  isDeleteLoading?: boolean;
  isToggleLoading?: boolean;
}
const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleAvailability,
  isEditLoading = false,
  isDeleteLoading = false,
  isToggleLoading = false,
}) => {
  // Destructure discountedPrice along with other item properties
  const { name, description, price, isAvailable, addons, packagingCharges, cuisine, discountedPrice } = item;

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
            <p className="text-sm text-gray-600 mt-1 italic">Cuisine: {cuisine}</p>
          </div>
          <button
            onClick={onToggleAvailability}
            aria-label={isAvailable ? 'Mark as unavailable' : 'Mark as available'}
            disabled={isToggleLoading}
            className={`p-2 rounded-full ${
              isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            } disabled:opacity-50`}
          >
            <Eye size={20} />
          </button>
        </div>
        <div className="space-y-1 text-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">₹</span>
            <span className="font-medium">Price:</span>
            {/* Conditional rendering for price */}
            {discountedPrice ? (
              <>
                <span className="text-lg font-semibold line-through text-gray-500">₹{price}</span>
                <span className="text-lg font-semibold text-green-600 ml-1">₹{discountedPrice}</span>
              </>
            ) : (
              <span className="text-lg font-semibold">₹{price}</span>
            )}
          </div>

        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={onEdit}
            disabled={isEditLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50"
          >
            <Edit2 size={16} />
            Edit
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleteLoading}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 disabled:opacity-50"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
        {addons && addons.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Add-ons:</h4>
            <div className="space-y-2">
              {addons.map((addon, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className={addon.available ? 'text-gray-600' : 'text-gray-400'}>
                    {addon.name}
                    {!addon.available && ' (Unavailable)'}
                  </span>
                  <span className="text-gray-600">+₹{addon.extraPrice}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MenuItemCard;