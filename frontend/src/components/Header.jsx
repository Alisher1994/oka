import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store/cartStore';

function Header() {
  const { t, i18n } = useTranslation();
  const itemCount = useCartStore(state => state.getItemCount());

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ru' ? 'en' : 'ru';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">L</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('app_name')}</h1>
              <p className="text-xs text-gray-500">Food Delivery</p>
            </div>
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <span className="text-sm font-medium">
              {i18n.language === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
