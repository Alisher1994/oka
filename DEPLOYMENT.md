# Инструкция по деплою на Railway

## Предварительные требования

1. Аккаунт на [Railway.app](https://railway.app)
2. Telegram Bot Token от [@BotFather](https://t.me/BotFather)
3. Yandex Maps API Key
4. Git установлен локально

## Шаг 1: Создание Telegram Bot

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните полученный **Bot Token**
5. Настройте Web App кнопку:
   ```
   /mybots → Выберите бота → Bot Settings → Menu Button
   Edit Menu Button URL: https://ваш-frontend-url.railway.app
   ```

## Шаг 2: Получение Yandex Maps API Key

1. Зарегистрируйтесь на [Yandex Developer](https://developer.tech.yandex.ru/)
2. Создайте новый API ключ для JavaScript API и HTTP Геокодер
3. Сохраните API ключ

## Шаг 3: Подготовка репозитория

1. Инициализируйте Git репозиторий:
```powershell
cd "c:\Users\LOQ\Desktop\App\EComerce App"
git init
git add .
git commit -m "Initial commit"
```

2. Создайте репозиторий на GitHub:
   - Откройте GitHub.com
   - Создайте новый репозиторий
   - Скопируйте URL репозитория

3. Подключите remote и отправьте код:
```powershell
git remote add origin https://github.com/ваш-username/ваш-repo.git
git branch -M main
git push -u origin main
```

## Шаг 4: Деплой Backend на Railway

1. Откройте [Railway.app](https://railway.app)
2. Нажмите **"New Project"**
3. Выберите **"Deploy from GitHub repo"**
4. Подключите ваш GitHub репозиторий
5. Railway автоматически обнаружит проект

### Настройка Backend Service:

1. В Railway Dashboard выберите проект
2. Нажмите **"New"** → **"Database"** → **"PostgreSQL"**
3. Railway автоматически создаст переменную `DATABASE_URL`

4. Добавьте Backend service:
   - Нажмите **"New"** → **"GitHub Repo"**
   - Выберите ваш репозиторий
   - В настройках укажите:
     - **Root Directory**: `backend`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

5. Настройте переменные окружения для Backend:
   
   Перейдите в **Variables** и добавьте:
   ```
   NODE_ENV=production
   PORT=3000
   TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather
   ADMIN_TELEGRAM_IDS=ваш_telegram_id,другой_admin_id
   FRONTEND_URL=https://ваш-frontend.railway.app
   JWT_SECRET=your_random_secret_key_here
   DATABASE_URL=[автоматически создано]
   ```

   **Как узнать свой Telegram ID:**
   - Откройте [@userinfobot](https://t.me/userinfobot)
   - Бот отправит вам ваш ID

6. После деплоя запустите миграцию БД:
   - В Railway Dashboard откройте Backend service
   - Перейдите в раздел **Settings** → **Deploy**
   - Добавьте команду деплоя: `npm run migrate && npm start`

## Шаг 5: Деплой Frontend на Railway

1. В том же Railway проекте нажмите **"New"** → **"GitHub Repo"**
2. Выберите тот же репозиторий
3. В настройках укажите:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx vite preview --host 0.0.0.0 --port $PORT`

4. Настройте переменные окружения для Frontend:
   
   Перейдите в **Variables** и добавьте:
   ```
   VITE_API_URL=https://ваш-backend.railway.app/api
   VITE_TELEGRAM_BOT_USERNAME=ваш_бот_username
   VITE_YANDEX_MAPS_API_KEY=ваш_yandex_api_key
   ```

5. Сгенерируйте публичный домен:
   - Перейдите в **Settings** → **Networking**
   - Нажмите **"Generate Domain"**
   - Скопируйте URL (например: `your-app.railway.app`)

## Шаг 6: Обновление конфигурации

1. Обновите `FRONTEND_URL` в Backend переменных на актуальный URL фронтенда
2. Обновите Web App URL в настройках Telegram бота
3. Перезапустите оба сервиса в Railway

## Шаг 7: Первый запуск

1. Откройте URL фронтенда в браузере
2. Проверьте, что приложение загружается
3. Откройте вашего Telegram бота
4. Нажмите **"Открыть каталог"** - должен открыться Web App
5. Попробуйте создать тестовый заказ

## Структура Railway проекта

После настройки у вас будет:

```
Railway Project
├── PostgreSQL Database
├── Backend Service (Node.js API + Telegram Bot)
└── Frontend Service (React App)
```

## Мониторинг и логи

1. **Просмотр логов Backend:**
   - Откройте Backend service в Railway
   - Перейдите в раздел **Deployments**
   - Нажмите на активный деплой → **View Logs**

2. **Просмотр логов Frontend:**
   - Аналогично для Frontend service

3. **Проверка БД:**
   - Откройте PostgreSQL service
   - Нажмите **Connect** → используйте предоставленные credentials

## Обновление приложения

Когда вы вносите изменения в код:

```powershell
git add .
git commit -m "описание изменений"
git push origin main
```

Railway автоматически обнаружит изменения и задеплоит обновления.

## Полезные команды Railway CLI (опционально)

Установка CLI:
```powershell
npm install -g @railway/cli
```

Логин:
```powershell
railway login
```

Деплой:
```powershell
railway up
```

Просмотр логов:
```powershell
railway logs
```

## Troubleshooting

### Backend не запускается:
- Проверьте логи в Railway Dashboard
- Убедитесь, что все переменные окружения настроены
- Проверьте, что `DATABASE_URL` корректен

### Frontend не загружается:
- Проверьте, что `VITE_API_URL` указывает на правильный Backend URL
- Убедитесь, что build прошел успешно (проверьте логи)

### Telegram бот не отвечает:
- Проверьте, что `TELEGRAM_BOT_TOKEN` корректен
- Убедитесь, что Backend запущен (проверьте логи)
- Проверьте, что `FRONTEND_URL` корректен в переменных Backend

### Заказы не создаются:
- Проверьте логи Backend
- Убедитесь, что миграция БД выполнена
- Проверьте настройки CORS в Backend

### Yandex Maps не отображается:
- Проверьте, что `VITE_YANDEX_MAPS_API_KEY` корректен
- Убедитесь, что API ключ активирован в Yandex Developer

## Безопасность

1. **Не коммитьте `.env` файлы в Git!**
2. Используйте сильные пароли для JWT_SECRET
3. Регулярно обновляйте зависимости
4. Мониторьте логи на предмет подозрительной активности

## Стоимость

- Railway предоставляет $5 бесплатно каждый месяц
- Базовый проект (Frontend + Backend + PostgreSQL) обычно укладывается в бесплатный лимит
- При необходимости можно перейти на платный план

## Поддержка

При возникновении проблем:
1. Проверьте логи в Railway Dashboard
2. Откройте раздел Issues в GitHub репозитории
3. Обратитесь в поддержку Railway: https://railway.app/help
