import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

interface BannersInputProps {
  banners: File[];
  onChange: (banners: File[]) => void;
}

const BannersInput: React.FC<BannersInputProps> = ({ banners, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newBanners = [...banners];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        newBanners.push(file);
      }
      onChange(newBanners);
    }
  };

  const handleRemove = (index: number) => {
    const newBanners = banners.filter((_, i) => i !== index);
    onChange(newBanners);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      {/* <label className="block text-sm font-medium text-gray-700 mb-1">File Upload</label> */}
      <div
        onClick={triggerFileInput}
        className="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 cursor-pointer hover:border-primary focus-within:border-primary max-w-full overflow-hidden"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerFileInput();
          }
        }}
        role="button"
        aria-label="Upload file input"
      >
        <input
          type="text"
          placeholder="File Upload"
          readOnly
          className="flex-grow min-w-0 outline-none cursor-pointer text-gray-600"
          value={banners.length > 0 ? banners.map((b, i) => b.name).join(', ') : ''}
        />
        <UploadCloud className="w-5 h-5 text-gray-500 flex-shrink-0" />
      </div>
      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {banners.map((banner, index) => (
          <div key={index} className="relative w-20 h-20 border rounded overflow-hidden">
            <img
              src={URL.createObjectURL(banner)}
              alt={`Banner ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              title="Remove"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannersInput;
