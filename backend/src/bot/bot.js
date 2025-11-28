import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Telegram Bot started');

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'друг';
  
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🛍 Открыть каталог',
          web_app: { url: process.env.FRONTEND_URL || 'https://your-app.com' }
        }
      ],
      [
        { text: '📦 Мои заказы', callback_data: 'my_orders' }
      ],
      [
        { text: '🇷🇺 RU', callback_data: 'lang_ru' },
        { text: '🇬🇧 EN', callback_data: 'lang_en' }
      ]
    ]
  };
  
  bot.sendMessage(
    chatId,
    `Привет, ${firstName}! 👋\n\n` +
    `Добро пожаловать в наш сервис доставки! 🍔\n\n` +
    `Нажмите кнопку ниже, чтобы открыть каталог и сделать заказ.`,
    { reply_markup: keyboard }
  );
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(
    chatId,
    `📖 *Помощь*\n\n` +
    `🛍 /start - Открыть главное меню\n` +
    `📦 /orders - Мои заказы\n` +
    `📞 /contact - Связаться с нами\n\n` +
    `_Используйте кнопки меню для быстрого доступа_`,
    { parse_mode: 'Markdown' }
  );
});

// Обработка callback queries
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  if (data === 'my_orders') {
    bot.answerCallbackQuery(query.id);
    bot.sendMessage(
      chatId,
      '📦 Просмотр заказов доступен через Web App.\n\n' +
      'Откройте каталог и перейдите в раздел "Мои заказы".'
    );
  } else if (data === 'lang_ru' || data === 'lang_en') {
    const lang = data === 'lang_ru' ? 'русский 🇷🇺' : 'English 🇬🇧';
    bot.answerCallbackQuery(query.id, { text: `Язык изменен на ${lang}` });
  }
});

// Обработка текстовых сообщений
bot.on('message', (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    const chatId = msg.chat.id;
    
    // Простой ответ на текстовые сообщения
    bot.sendMessage(
      chatId,
      'Используйте команды из меню или нажмите /start для начала работы.'
    );
  }
});

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

export default bot;
