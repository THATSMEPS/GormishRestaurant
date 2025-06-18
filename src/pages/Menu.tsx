import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import MenuHeader from '../components/menu/MenuHeader';
import MenuItemCard from '../components/menu/MenuItemCard';
import MenuItemForm from '../components/menu/MenuItemForm';
import BaseModal from '../components/ui/BaseModal';
import CardGrid from '../components/ui/CardGrid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import api from '../utils/api';
import { MenuItem, FormData, Addon, GstCategory, ApiResponse } from '../types/menu';

interface MenuProps {
  restaurantId: string;
}

const gstCategories: GstCategory[] = [
  { value: '0', label: '0% (Exempt)' },
  { value: '5', label: '5% GST' },
  { value: '12', label: '12% GST' },
  { value: '18', label: '18% GST' },
  { value: '28', label: '28% GST' },
];

const Menu: React.FC<MenuProps> = ({ restaurantId }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loading states for buttons and actions
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: 0,
    discountedPrice: null,
    gstCategory: '5',
    isAvailable: true,
    addons: [],
    isVeg: true,
    packagingCharges: 0,
    cuisine: '',
  });

  const [addonDraft, setAddonDraft] = useState<Addon>({
    name: '',
    extraPrice: 0,
    available: true,
  });

  const [addonEditIndex, setAddonEditIndex] = useState<number | null>(null);

  // Fetch menu items from backend
  useEffect(() => {
    const fetchMenu = async () => {
      if (!restaurantId) {
        setError('Invalid restaurant ID');
        setMenuItems([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
      const response = await api.get<ApiResponse<MenuItem[]>>(`/menu/restaurant/${restaurantId}`);
      setMenuItems(response.data?.data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load menu items';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [restaurantId, isModalOpen]); // Refetch when modal closes or restaurantId changes

  // Wrap search query setter to add loading state
  const handleSearchChange = (query: string) => {
    setIsSearchLoading(true);
    setSearchQuery(query);
    setIsSearchLoading(false);
  };

  // Remove duplicate handleAddItem declaration

  // Filtered items for display
  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      discountedPrice: null,
      gstCategory: '5',
      isAvailable: true,
      addons: [],
      isVeg: true,
      packagingCharges: 0,
      cuisine: '',
    });
    setAddonDraft({ name: '', extraPrice: 0, available: true });
    setAddonEditIndex(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setIsEditLoading(true);
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      discountedPrice: item.discountedPrice || null,
      gstCategory: '5', // Backend doesn't store gstCategory; adjust if needed
      isAvailable: item.isAvailable,
      addons: item.addons || [],
      isVeg: item.isVeg,
      packagingCharges: item.packagingCharges,
      cuisine: item.cuisine,
    });
    setAddonDraft({ name: '', extraPrice: 0, available: true });
    setAddonEditIndex(null);
    setIsModalOpen(true);
    setIsEditLoading(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    setIsDeleteLoading(true);
    try {
      await api.delete(`/menu/${itemId}`);
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item deleted successfully');
    } catch (err) {
      console.log(err);
      // Error handled by Axios interceptor
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    setIsToggleLoading(true);
    try {
      const updatedItem = {
        name: item.name,
        description: item.description,
        price: item.price,
        discountedPrice: item.discountedPrice || null,
        isVeg: item.isVeg,
        packagingCharges: item.packagingCharges,
        cuisine: item.cuisine,
        restaurantId: item.restaurantId,
        isAvailable: !item.isAvailable,
        addons: item.addons,
      };
      await api.put(`/menu/${itemId}`, updatedItem);
      setMenuItems(prev =>
        prev.map(i =>
          i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i
        )
      );
      toast.success('Availability updated');
    } catch (err) {
      // Error handled by Axios interceptor
    } finally {
      setIsToggleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        discountedPrice: formData.discountedPrice,
        isVeg: formData.isVeg,
        packagingCharges: formData.packagingCharges,
        cuisine: formData.cuisine,
        restaurantId,
        isAvailable: formData.isAvailable,
        addons: formData.addons,
      };

      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, payload);
        toast.success('Item updated successfully');
      } else {
        await api.post('/menu', payload);
        toast.success('Item added successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      // Error handled by Axios interceptor
    } finally {
      setIsSubmitLoading(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-medium">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto pt-20 pb-12 px-4"
      >
        <MenuHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onAddItem={handleAddItem}
          isSearchLoading={isSearchLoading}
          isAddLoading={isAddLoading}
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <CardGrid columns={{ sm: 1, lg: 2, xl: 3 }}>
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onEdit={() => handleEditItem(item)}
                onDelete={() => handleDeleteItem(item.id)}
                onToggleAvailability={() => handleToggleAvailability(item.id)}
                isEditLoading={isEditLoading}
                isDeleteLoading={isDeleteLoading}
                isToggleLoading={isToggleLoading}
              />
            ))}
          </CardGrid>
        )}

        <BaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}>
          <MenuItemForm
            formData={formData}
            setFormData={setFormData}
            addonDraft={addonDraft}
            setAddonDraft={setAddonDraft}
            addonEditIndex={addonEditIndex}
            setAddonEditIndex={setAddonEditIndex}
            gstCategories={gstCategories}
            onSubmit={handleSubmit}
            isEditing={!!editingItem}
            isSubmitLoading={isSubmitLoading}
          />
        </BaseModal>
      </motion.div>
    </ErrorBoundary>
  );
};

export default Menu;