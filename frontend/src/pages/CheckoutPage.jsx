import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { YMaps, Map, Placemark } from 'react-yandex-maps';
import { useCartStore } from '../store/cartStore';
import { getBranches, createOrder } from '../api/api';
import { getTelegramUserId, getTelegramUser } from '../utils/telegram';

function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const telegramUser = getTelegramUser();
  
  const [formData, setFormData] = useState({
    order_number: '',
    customer_name: telegramUser?.first_name || '',
    customer_phone: '',
    branch_id: null,
    delivery_type: 'delivery',
    delivery_address: '',
    delivery_latitude: 41.311151,
    delivery_longitude: 69.279737,
    delivery_time: '',
    comment: '',
    payment_method: 'cash'
  });

  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState([41.311151, 69.279737]);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/');
      return;
    }
    
    loadBranches();
    generateOrderNumber();
  }, []);

  const loadBranches = async () => {
    try {
      const data = await getBranches();
      setBranches(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, branch_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const generateOrderNumber = () => {
    const randomNum = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, order_number: randomNum }));
  };

  const handleMapClick = (e) => {
    const coords = e.get('coords');
    setSelectedPoint(coords);
    setFormData(prev => ({
      ...prev,
      delivery_latitude: coords[0],
      delivery_longitude: coords[1]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.customer_name || !formData.customer_phone || !formData.order_number) {
      alert(t('fill_required_fields'));
      return;
    }

    if (formData.delivery_type === 'delivery' && !formData.delivery_address) {
      alert(t('select_address'));
      return;
    }

    // Проверка времени доставки (минимум 1 час)
    if (formData.delivery_time) {
      const deliveryDate = new Date(formData.delivery_time);
      const minTime = new Date(Date.now() + 60 * 60 * 1000);
      
      if (deliveryDate < minTime) {
        alert(t('min_delivery_time'));
        return;
      }
    }

    setLoading(true);

    try {
      const orderData = {
        ...formData,
        telegram_id: getTelegramUserId(),
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      await createOrder(orderData);
      
      // Очистить корзину
      clearCart();
      
      // Перейти на страницу успеха
      alert(t('order_success_message'));
      navigate('/orders');
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert(t('error') + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const minDeliveryTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">{t('checkout')}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Number */}
        <div className="card p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('order_number')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.order_number}
              onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
              className="input flex-1"
              required
            />
            <button
              type="button"
              onClick={generateOrderNumber}
              className="btn-secondary"
            >
              🔄
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">{t('custom_order_number')}</p>
        </div>

        {/* Customer Info */}
        <div className="card p-4">
          <h3 className="font-semibold mb-4">{t('customer_info')}</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('name')} *
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('phone')} *
              </label>
              <input
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                className="input"
                placeholder="+998 90 123 45 67"
                required
              />
            </div>
          </div>
        </div>

        {/* Delivery Method */}
        <div className="card p-4">
          <h3 className="font-semibold mb-4">{t('delivery_method')}</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, delivery_type: 'delivery' })}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.delivery_type === 'delivery'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-primary/50'
              }`}
            >
              <div className="text-2xl mb-2">🚗</div>
              <div className="font-semibold">{t('delivery')}</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, delivery_type: 'pickup' })}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.delivery_type === 'pickup'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-primary/50'
              }`}
            >
              <div className="text-2xl mb-2">🏪</div>
              <div className="font-semibold">{t('pickup')}</div>
            </button>
          </div>

          {/* Branch Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('select_branch')} *
            </label>
            <select
              value={formData.branch_id || ''}
              onChange={(e) => setFormData({ ...formData, branch_id: parseInt(e.target.value) })}
              className="input"
              required
            >
              <option value="">{t('select_branch')}</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name_ru} - {branch.working_hours}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Delivery Address (if delivery) */}
        {formData.delivery_type === 'delivery' && (
          <div className="card p-4">
            <h3 className="font-semibold mb-4">{t('delivery_address')}</h3>
            
            <div className="mb-3">
              <input
                type="text"
                value={formData.delivery_address}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                className="input"
                placeholder={t('enter_address')}
                required
              />
            </div>

            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="btn-secondary w-full"
            >
              📍 {showMap ? t('hide_map') : t('select_on_map')}
            </button>

            {showMap && (
              <div className="mt-4 h-64 rounded-xl overflow-hidden">
                <YMaps query={{ apikey: import.meta.env.VITE_YANDEX_MAPS_API_KEY }}>
                  <Map
                    defaultState={{ center: mapCenter, zoom: 12 }}
                    width="100%"
                    height="100%"
                    onClick={handleMapClick}
                  >
                    {selectedPoint && (
                      <Placemark geometry={selectedPoint} />
                    )}
                  </Map>
                </YMaps>
              </div>
            )}
          </div>
        )}

        {/* Delivery Time */}
        <div className="card p-4">
          <h3 className="font-semibold mb-4">{t('delivery_time')}</h3>
          <input
            type="datetime-local"
            value={formData.delivery_time}
            onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
            min={minDeliveryTime}
            className="input"
          />
          <p className="text-xs text-gray-500 mt-2">{t('min_delivery_time')}</p>
        </div>

        {/* Payment Method */}
        <div className="card p-4">
          <h3 className="font-semibold mb-4">{t('payment_method')}</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, payment_method: 'cash' })}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.payment_method === 'cash'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-primary/50'
              }`}
            >
              <div className="text-2xl mb-2">💵</div>
              <div className="font-semibold">{t('cash')}</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, payment_method: 'card' })}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.payment_method === 'card'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-primary/50'
              }`}
            >
              <div className="text-2xl mb-2">💳</div>
              <div className="font-semibold">{t('card')}</div>
            </button>
          </div>
        </div>

        {/* Comment */}
        <div className="card p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('comment')}
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            className="input min-h-[100px]"
            placeholder={t('comment_optional')}
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.comment.length}/200
          </p>
        </div>

        {/* Total */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">{t('total')}:</span>
            <span className="text-2xl font-bold text-primary">
              {getTotal().toLocaleString('ru-RU')} {t('sum')}
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-lg"
        >
          {loading ? t('loading') : t('place_order')}
        </button>
      </form>
    </div>
  );
}

export default CheckoutPage;
