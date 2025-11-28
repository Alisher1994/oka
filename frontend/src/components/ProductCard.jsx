import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store/cartStore';

function ProductCard({ product }) {
  const { t, i18n } = useTranslation();
  const [quantity, setQuantity] = useState(product.unit === 'kg' ? 0.5 : 1);
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const addItem = useCartStore(state => state.addItem);
  const items = useCartStore(state => state.items);

  const itemInCart = items.find(item => item.id === product.id);
  const name = i18n.language === 'ru' ? product.name_ru : product.name_en;
  const description = i18n.language === 'ru' ? product.description_ru : product.description_en;
  
  const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
  const imageUrl = product.image_url 
    ? `${API_BASE_URL}${product.image_url}` 
    : 'https://via.placeholder.com/300x200?text=No+Image';

  const handleAddToCart = () => {
    if (product.unit === 'kg' && !showQuantityInput) {
      setShowQuantityInput(true);
      return;
    }
    
    addItem(product, quantity);
    setShowQuantityInput(false);
    
    // Анимация успеха
    const btn = document.getElementById(`add-btn-${product.id}`);
    if (btn) {
      btn.classList.add('scale-110');
      setTimeout(() => btn.classList.remove('scale-110'), 200);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  return (
    <div className="card hover:shadow-lg transition-all duration-200 animate-fade-in">
      {/* Image */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              {t('unavailable')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[3rem]">
          {name}
        </h3>
        
        {description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-primary">
            {product.price.toLocaleString('ru-RU')} {t('sum')}
          </span>
          <span className="text-sm text-gray-500">
            / {t(product.unit)}
          </span>
        </div>

        {/* Quantity Input for weighted products */}
        {showQuantityInput && product.unit === 'kg' && (
          <div className="mb-3 animate-slide-up">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('enter_quantity')} ({t('kg')}):
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={handleQuantityChange}
              className="input text-center"
              autoFocus
            />
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          id={`add-btn-${product.id}`}
          onClick={handleAddToCart}
          disabled={!product.is_available}
          className={`btn-primary w-full transition-transform ${
            itemInCart ? 'bg-green-500 hover:bg-green-600' : ''
          }`}
        >
          {itemInCart ? (
            <>
              ✓ {t('in_cart')} ({itemInCart.quantity} {t(product.unit)})
            </>
          ) : (
            <>
              {showQuantityInput ? '✓ ' + t('add_to_cart') : '+ ' + t('add_to_cart')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
