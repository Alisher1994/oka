# E-Commerce Food Delivery App

Система заказа товаров с Telegram интеграцией для доставки в г. Ташкент.

## 🚀 Технологии

### Frontend
- React 18 + Vite
- TailwindCSS для стилизации
- Zustand для state management
- React Router v6
- i18next для мультиязычности (RU/EN)
- Yandex Maps API
- Telegram Web App SDK

### Backend
- Node.js + Express
- PostgreSQL
- node-telegram-bot-api
- Multer (загрузка фото)
- JWT для аутентификации админа

## 📁 Структура проекта

```
├── frontend/           # React приложение
│   ├── src/
│   │   ├── components/     # UI компоненты
│   │   ├── pages/          # Страницы
│   │   ├── store/          # Zustand stores
│   │   ├── locales/        # Переводы (RU/EN)
│   │   └── telegram/       # Telegram WebApp integration
│   └── package.json
│
├── backend/            # Node.js API + Telegram Bot
│   ├── src/
│   │   ├── routes/         # API маршруты
│   │   ├── controllers/    # Контроллеры
│   │   ├── models/         # БД модели
│   │   ├── bot/            # Telegram Bot логика
│   │   └── middleware/     # Middleware
│   └── package.json
│
├── database/           # SQL схемы и миграции
│   └── migrations/
│
└── .env.example        # Пример переменных окружения
```

## 📋 Функционал

### Для клиентов:
- ✅ Каталог товаров с категориями
- ✅ Корзина с расчетом суммы
- ✅ Выбор филиала для получения заказа
- ✅ Указание адреса доставки на Yandex карте
- ✅ Комментарий к заказу
- ✅ Выбор времени доставки (не менее 1 часа)
- ✅ Выбор способа оплаты (наличные/карта)
- ✅ Развесные товары (ввод кг вручную)
- ✅ Уведомления в Telegram о статусе заказа
- ✅ Web версия + Telegram Web App версия

### Для администраторов:
- ✅ Управление товарами (добавление, редактирование, удаление)
- ✅ Загрузка фото товаров
- ✅ Управление категориями
- ✅ Настройка единиц измерения (шт, кг, л)
- ✅ Управление филиалами
- ✅ Получение заказов в Telegram с полной информацией
- ✅ Изменение статуса заказа
- ✅ Просмотр истории заказов

## 🔧 Установка и запуск

### Требования
- Node.js 18+
- PostgreSQL 14+
- Telegram Bot Token (получить у @BotFather)
- Yandex Maps API Key

### Локальная разработка

#### 1. Клонирование репозитория
```powershell
git clone https://github.com/ваш-username/ecommerce-app.git
cd ecommerce-app
```

#### 2. Backend

```powershell
cd backend
npm install

# Создать .env файл
copy .env.example .env
# Отредактируйте .env и добавьте ваши credentials

# Создать базу данных и запустить миграции
npm run migrate

# Запуск в режиме разработки
npm run dev
```

Backend будет доступен на `http://localhost:3000`

#### 3. Frontend

```powershell
cd frontend
npm install

# Создать .env файл
copy .env.example .env
# Отредактируйте .env и добавьте URL бэкенда

# Запуск в режиме разработки
npm run dev
```

Frontend будет доступен на `http://localhost:5173`

### Создание Telegram Bot

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/newbot` и следуйте инструкциям
3. Получите токен и добавьте в `backend/.env`
4. Настройте Menu Button:
   ```
   /mybots → Ваш бот → Bot Settings → Menu Button
   URL: http://localhost:5173 (для разработки)
   ```

## 🚢 Деплой на Railway

### 1. Создание проекта на Railway
1. Зарегистрируйтесь на [Railway.app](https://railway.app)
2. Создайте новый проект
3. Добавьте PostgreSQL из Marketplace

### 2. Деплой Backend
```powershell
# В корне проекта
railway link
railway up backend/
```

### 3. Деплой Frontend
```powershell
railway up frontend/
```

### 4. Переменные окружения (Railway Dashboard)

**Backend:**
- `DATABASE_URL` - автоматически из PostgreSQL сервиса
- `TELEGRAM_BOT_TOKEN` - токен от @BotFather
- `ADMIN_TELEGRAM_IDS` - ID админов через запятую
- `PORT` - 3000
- `FRONTEND_URL` - URL фронтенда

**Frontend:**
- `VITE_API_URL` - URL бэкенда
- `VITE_TELEGRAM_BOT_USERNAME` - username бота
- `VITE_YANDEX_MAPS_API_KEY` - ключ Yandex Maps

## 📱 Настройка Telegram Bot

1. Создайте бота у [@BotFather](https://t.me/BotFather)
2. Получите токен и добавьте в `.env`
3. Настройте Web App кнопку:
   ```
   /mybots → Выберите бота → Bot Settings → Menu Button → Edit Menu Button URL
   URL: https://ваш-frontend.railway.app
   ```
4. Включите Inline Mode для работы с Web App

## 🗄️ База данных

### Таблицы:
- `categories` - категории товаров
- `products` - товары
- `branches` - филиалы
- `orders` - заказы
- `order_items` - товары в заказе
- `users` - пользователи (клиенты)
- `admins` - администраторы

## 📖 API Endpoints

### Публичные
- `GET /api/products` - список товаров
- `GET /api/categories` - категории
- `GET /api/branches` - филиалы
- `POST /api/orders` - создание заказа

### Админские (требуют авторизации)
- `POST /api/admin/products` - добавить товар
- `PUT /api/admin/products/:id` - редактировать товар
- `DELETE /api/admin/products/:id` - удалить товар
- `GET /api/admin/orders` - все заказы
- `PUT /api/admin/orders/:id` - обновить статус заказа

## 🌐 Мультиязычность

Поддерживаются языки:
- 🇷🇺 Русский (по умолчанию)
- 🇬🇧 English

Переключение в хедере приложения.

## 📝 Лицензия

MIT

## 👨‍💻 Разработка

Создано для доставки товаров в г. Ташкент.
