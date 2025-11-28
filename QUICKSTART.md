# 🚀 Быстрый старт - E-Commerce Food Delivery

## ✅ Что уже создано:

### Backend (Node.js + Express + PostgreSQL)
- ✅ REST API для товаров, категорий, филиалов, заказов
- ✅ Telegram Bot с уведомлениями клиентам и админам
- ✅ Загрузка изображений товаров
- ✅ База данных PostgreSQL с миграциями

### Frontend (React + Vite + TailwindCSS)
- ✅ Каталог товаров с категориями
- ✅ Корзина с поддержкой развесных товаров (кг)
- ✅ Оформление заказа с Yandex Maps
- ✅ Выбор филиала, времени доставки (мин 1 час)
- ✅ Выбор способа оплаты (карта/нал)
- ✅ Мультиязычность (RU/EN)
- ✅ Telegram Web App интеграция

### Админка
- ✅ HTML панель управления (admin.html)
- ✅ Управление заказами, товарами, категориями
- ✅ Изменение статуса заказов

## 📦 Первый запуск (локально)

### 1. Установите зависимости

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
cd frontend
npm install
```

### 2. Настройте PostgreSQL

Установите PostgreSQL и создайте базу данных:
```sql
CREATE DATABASE ecommerce_db;
```

### 3. Настройте переменные окружения

**Backend (.env):**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecommerce_db
TELEGRAM_BOT_TOKEN=your_bot_token_here
ADMIN_TELEGRAM_IDS=your_telegram_id
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_secret_key
PORT=3000
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000/api
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
VITE_YANDEX_MAPS_API_KEY=your_yandex_api_key
```

### 4. Запустите миграции БД

```powershell
cd backend
npm run migrate
```

### 5. Запустите приложение

**Backend (терминал 1):**
```powershell
cd backend
npm run dev
```

**Frontend (терминал 2):**
```powershell
cd frontend
npm run dev
```

### 6. Откройте приложение

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Админка**: откройте `admin.html` в браузере

## 🤖 Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather):
   ```
   /newbot
   ```

2. Настройте Web App кнопку:
   ```
   /mybots → Выберите бота → Bot Settings → Menu Button
   URL: http://localhost:5173 (для разработки)
   ```

3. Узнайте свой Telegram ID через [@userinfobot](https://t.me/userinfobot)

4. Добавьте токен и ID в `backend/.env`

## 🌐 Деплой на Railway

Подробная инструкция находится в файле `DEPLOYMENT.md`

Краткие шаги:
1. Создайте GitHub репозиторий
2. Загрузите код: `git push origin main`
3. Создайте проект на Railway.app
4. Добавьте PostgreSQL
5. Деплойте Backend и Frontend
6. Настройте переменные окружения
7. Обновите URL в Telegram боте

## 📁 Структура проекта

```
EComerce App/
├── backend/                    # Node.js Backend
│   ├── src/
│   │   ├── bot/               # Telegram Bot
│   │   ├── controllers/       # Контроллеры API
│   │   ├── database/          # Подключение к БД
│   │   ├── routes/            # API маршруты
│   │   └── server.js          # Главный файл
│   └── package.json
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── api/               # API клиент
│   │   ├── components/        # React компоненты
│   │   ├── locales/           # Переводы RU/EN
│   │   ├── pages/             # Страницы
│   │   ├── store/             # Zustand state
│   │   ├── utils/             # Утилиты
│   │   ├── App.jsx            # Главный компонент
│   │   └── main.jsx           # Точка входа
│   └── package.json
│
├── database/                   # SQL схемы
│   └── schema.sql
│
├── admin.html                  # Админ панель
├── README.md                   # Документация
├── DEPLOYMENT.md               # Инструкция деплоя
└── .gitignore
```

## 🔑 Основной функционал

### Для клиентов:
- Просмотр каталога товаров по категориям
- Добавление в корзину (шт/кг/л)
- Выбор филиала для получения
- Указание адреса на Yandex карте
- Выбор времени доставки (не менее 1 часа)
- Комментарий к заказу
- Выбор оплаты (карта/наличные)
- Произвольный номер заказа
- Telegram уведомления о статусе

### Для администраторов:
- Получение новых заказов в Telegram
- Управление товарами (добавить/редактировать/удалить)
- Загрузка фото товаров
- Управление категориями
- Изменение статуса заказов
- Просмотр истории заказов

## 🛠️ Технологии

**Backend:**
- Node.js + Express
- PostgreSQL
- Telegram Bot API
- Multer (загрузка файлов)

**Frontend:**
- React 18
- Vite
- TailwindCSS
- Zustand (state management)
- React Router
- i18next (мультиязычность)
- Yandex Maps API
- Telegram WebApp SDK

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в терминале
2. Убедитесь, что все переменные окружения настроены
3. Проверьте, что PostgreSQL запущен
4. Проверьте, что Telegram Bot Token корректен

## ⚡ Следующие шаги

1. Получите Yandex Maps API ключ
2. Создайте Telegram бота
3. Настройте PostgreSQL
4. Запустите приложение локально
5. Протестируйте функционал
6. Задеплойте на Railway
7. Пригласите первых клиентов!

## 📝 Заметки

- База данных уже содержит примеры категорий и филиалов
- Можно добавлять товары через админку
- Все цены в сўм (сум)
- Минимальное время доставки: 1 час
- Поддержка развесных товаров (кг)

Удачи с запуском! 🚀
