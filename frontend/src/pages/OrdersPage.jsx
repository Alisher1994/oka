import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getUserOrders } from '../api/api';
import { getTelegramUserId } from '../utils/telegram';

function OrdersPage() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const telegramId = getTelegramUserId();
    
    if (!telegramId) {
      setLoading(false);
      return;
    }

    try {
      const data = await getUserOrders(telegramId);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      delivering: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('no_orders')}</h2>
        <p className="text-gray-500 mb-6">{t('make_first_order')}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">{t('my_orders')}</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg">#{order.order_number}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleString(i18n.language === 'ru' ? 'ru-RU' : 'en-US')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {t(`order_${order.status}`)}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('branch')}:</span>
                <span className="font-medium">{order.branch_name_ru}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('payment_method')}:</span>
                <span className="font-medium">{t(order.payment_method)}</span>
              </div>

              {order.delivery_time && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('delivery_time')}:</span>
                  <span className="font-medium">
                    {new Date(order.delivery_time).toLocaleString(i18n.language === 'ru' ? 'ru-RU' : 'en-US')}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{t('total')}:</span>
                <span className="text-xl font-bold text-primary">
                  {order.total_amount.toLocaleString('ru-RU')} {t('sum')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrdersPage;
