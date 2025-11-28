import bot from './bot.js';
import pool from '../database/db.js';

const adminTelegramIds = process.env.ADMIN_TELEGRAM_IDS 
  ? process.env.ADMIN_TELEGRAM_IDS.split(',').map(id => id.trim())
  : [];

// Отправить уведомление админам о новом заказе
export async function sendOrderNotificationToAdmin(order, items) {
  if (adminTelegramIds.length === 0) {
    console.warn('⚠️ No admin Telegram IDs configured');
    return;
  }
  
  try {
    // Получить информацию о филиале
    let branchInfo = '';
    if (order.branch_id) {
      const branchResult = await pool.query(
        'SELECT name_ru FROM branches WHERE id = $1',
        [order.branch_id]
      );
      if (branchResult.rows.length > 0) {
        branchInfo = `📍 *Филиал:* ${branchResult.rows[0].name_ru}\n`;
      }
    }
    
    // Формируем список товаров
    const itemsList = items.map(item => 
      `  • ${item.product_name_ru} - ${item.quantity} ${item.unit === 'kg' ? 'кг' : 'шт'} × ${item.price.toLocaleString('ru-RU')} = ${item.subtotal.toLocaleString('ru-RU')} сўм`
    ).join('\n');
    
    // Адрес доставки
    let deliveryInfo = '';
    if (order.delivery_type === 'delivery' && order.delivery_address) {
      deliveryInfo = `📍 *Адрес:* ${order.delivery_address}\n`;
      if (order.delivery_latitude && order.delivery_longitude) {
        deliveryInfo += `🗺 [Показать на карте](https://yandex.ru/maps/?ll=${order.delivery_longitude},${order.delivery_latitude}&z=16&pt=${order.delivery_longitude},${order.delivery_latitude})\n`;
      }
    }
    
    // Время доставки
    let deliveryTime = '';
    if (order.delivery_time) {
      const dt = new Date(order.delivery_time);
      deliveryTime = `⏰ *Время доставки:* ${dt.toLocaleString('ru-RU')}\n`;
    }
    
    // Комментарий
    let commentText = '';
    if (order.comment) {
      commentText = `💬 *Комментарий:* ${order.comment}\n`;
    }
    
    const message = `
🆕 *НОВЫЙ ЗАКАЗ #${order.order_number}*

👤 *Клиент:* ${order.customer_name}
📞 *Телефон:* ${order.customer_phone}

${branchInfo}${deliveryInfo}${deliveryTime}${commentText}
💳 *Оплата:* ${order.payment_method === 'cash' ? 'Наличные' : 'Карта'}

📦 *Товары:*
${itemsList}

💰 *ИТОГО: ${order.total_amount.toLocaleString('ru-RU')} сўм*

⏱ Заказ создан: ${new Date(order.created_at).toLocaleString('ru-RU')}
    `.trim();
    
    // Кнопки для админа
    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Подтвердить', callback_data: `confirm_order_${order.id}` },
          { text: '❌ Отменить', callback_data: `cancel_order_${order.id}` }
        ]
      ]
    };
    
    // Отправить всем админам
    for (const adminId of adminTelegramIds) {
      try {
        await bot.sendMessage(adminId, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
          disable_web_page_preview: false
        });
      } catch (err) {
        console.error(`Failed to send notification to admin ${adminId}:`, err.message);
      }
    }
    
    console.log(`✅ Order notification sent to ${adminTelegramIds.length} admin(s)`);
  } catch (error) {
    console.error('Error sending order notification to admin:', error);
    throw error;
  }
}

// Отправить уведомление клиенту о статусе заказа
export async function sendOrderStatusToCustomer(telegramId, order, status) {
  try {
    let message = '';
    let emoji = '';
    
    switch (status) {
      case 'pending':
        emoji = '📝';
        message = `${emoji} Ваш заказ #${order.order_number} принят!\n\n` +
                  `Ожидайте подтверждения от администратора.\n` +
                  `Сумма: ${order.total_amount.toLocaleString('ru-RU')} сўм`;
        break;
        
      case 'confirmed':
        emoji = '✅';
        message = `${emoji} Заказ #${order.order_number} подтвержден!\n\n` +
                  `Ваш заказ готовится.\n` +
                  `Сумма: ${order.total_amount.toLocaleString('ru-RU')} сўм`;
        break;
        
      case 'preparing':
        emoji = '👨‍🍳';
        message = `${emoji} Ваш заказ #${order.order_number} готовится!\n\n` +
                  `Скоро будет готов к доставке.`;
        break;
        
      case 'delivering':
        emoji = '🚗';
        message = `${emoji} Заказ #${order.order_number} в пути!\n\n` +
                  `Курьер уже едет к вам.`;
        break;
        
      case 'completed':
        emoji = '🎉';
        message = `${emoji} Заказ #${order.order_number} выполнен!\n\n` +
                  `Спасибо за заказ! Приятного аппетита! 🍔`;
        break;
        
      case 'cancelled':
        emoji = '❌';
        message = `${emoji} Заказ #${order.order_number} отменен.\n\n` +
                  `Если у вас есть вопросы, свяжитесь с нами.`;
        break;
        
      default:
        message = `Статус заказа #${order.order_number} изменен.`;
    }
    
    await bot.sendMessage(telegramId, message);
    
    console.log(`✅ Status notification sent to customer ${telegramId}`);
  } catch (error) {
    console.error('Error sending status notification to customer:', error);
    throw error;
  }
}

// Обработка подтверждения/отмены заказа админом
bot.on('callback_query', async (query) => {
  const data = query.data;
  
  if (data.startsWith('confirm_order_') || data.startsWith('cancel_order_')) {
    const orderId = data.split('_')[2];
    const action = data.startsWith('confirm_order_') ? 'confirmed' : 'cancelled';
    
    try {
      // Обновить статус заказа в БД
      const result = await pool.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [action, orderId]
      );
      
      if (result.rows.length > 0) {
        const order = result.rows[0];
        
        // Отправить уведомление клиенту
        if (order.telegram_id) {
          await sendOrderStatusToCustomer(order.telegram_id, order, action);
        }
        
        // Уведомить админа об успехе
        const statusText = action === 'confirmed' ? 'подтвержден ✅' : 'отменен ❌';
        await bot.answerCallbackQuery(query.id, {
          text: `Заказ #${order.order_number} ${statusText}`
        });
        
        // Обновить сообщение админа
        await bot.editMessageReplyMarkup(
          { inline_keyboard: [] },
          {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
          }
        );
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      await bot.answerCallbackQuery(query.id, {
        text: 'Ошибка при обновлении статуса',
        show_alert: true
      });
    }
  }
});
