import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store/cartStore';

function BottomNav() {
  const { t } = useTranslation();
  const itemCount = useCartStore(state => state.getItemCount());

  const navItems = [
    { path: '/', icon: '🏠', label: t('home') },
    { path: '/cart', icon: '🛒', label: t('cart'), badge: itemCount },
    { path: '/orders', icon: '📦', label: t('orders') },
    { path: '/profile', icon: '👤', label: t('profile') }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-all relative ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`
              }
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              
              {item.badge > 0 && (
                <span className="absolute top-0 right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;
