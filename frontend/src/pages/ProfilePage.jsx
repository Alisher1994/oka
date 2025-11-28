import { useTranslation } from 'react-i18next';
import { getTelegramUser } from '../utils/telegram';

function ProfilePage() {
  const { t, i18n } = useTranslation();
  const telegramUser = getTelegramUser();

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">{t('profile')}</h1>

      {telegramUser ? (
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {telegramUser.first_name?.[0] || '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {telegramUser.first_name} {telegramUser.last_name}
              </h2>
              {telegramUser.username && (
                <p className="text-gray-500">@{telegramUser.username}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">ID:</span>
              <span className="font-medium">{telegramUser.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">{t('language')}:</span>
              <span className="font-medium">
                {telegramUser.language_code?.toUpperCase() || 'RU'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-6 mb-6 text-center">
          <p className="text-gray-500">{t('open_in_telegram')}</p>
        </div>
      )}

      {/* Settings */}
      <div className="card p-4">
        <h3 className="font-semibold mb-4">{t('settings')}</h3>
        
        <div className="space-y-3">
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru')}
            className="w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{t('language')}</div>
              <div className="text-sm text-gray-500">
                {i18n.language === 'ru' ? 'Русский 🇷🇺' : 'English 🇬🇧'}
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="card p-4 mt-6">
        <h3 className="font-semibold mb-4">{t('about_app')}</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>{t('app_name')}</p>
          <p>Version 1.0.0</p>
          <p>© 2024 All rights reserved</p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
