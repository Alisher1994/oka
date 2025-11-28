import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store/cartStore';

function CartPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();

  const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart_empty')}</h2>
        <p className="text-gray-500 mb-6">{t('add_products_to_cart')}</p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          {t('continue_shopping')}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('cart')}</h1>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-red-600 font-medium text-sm"
        >
          {t('clear_cart')}
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {items.map((item) => {
          const name = i18n.language === 'ru' ? item.name_ru : item.name_en;
          const imageUrl = item.image_url 
            ? `${API_BASE_URL}${item.image_url}` 
            : 'https://via.placeholder.com/100';

          return (
            <div key={item.id} className="card p-4 animate-slide-up">
              <div className="flex gap-4">
                {/* Image */}
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-20 h-20 object-cover rounded-lg"
                />

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {item.price.toLocaleString('ru-RU')} {t('sum')} / {t(item.unit)}
                  </p>

                  <div className="flex items-center gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - (item.unit === 'kg' ? 0.1 : 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-200 transition-colors font-bold text-primary"
                      >
                        −
                      </button>
                      
                      <span className="font-semibold min-w-[3rem] text-center">
                        {item.quantity} {t(item.unit)}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + (item.unit === 'kg' ? 0.1 : 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-200 transition-colors font-bold text-primary"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <p className="font-bold text-lg text-primary">
                    {(item.price * item.quantity).toLocaleString('ru-RU')}
                  </p>
                  <p className="text-sm text-gray-500">{t('sum')}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-medium text-gray-700">{t('total')}:</span>
          <span className="text-2xl font-bold text-primary">
            {getTotal().toLocaleString('ru-RU')} {t('sum')}
          </span>
        </div>

        <button
          onClick={() => navigate('/checkout')}
          className="btn-primary w-full"
        >
          {t('checkout')}
        </button>
      </div>
    </div>
  );
}

export default CartPage;
