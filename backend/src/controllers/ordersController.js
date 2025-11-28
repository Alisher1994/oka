import pool from '../database/db.js';
import { sendOrderNotificationToAdmin, sendOrderStatusToCustomer } from '../bot/notifications.js';

// Создать заказ
export const createOrder = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      order_number,
      telegram_id,
      customer_name,
      customer_phone,
      branch_id,
      delivery_type,
      delivery_address,
      delivery_latitude,
      delivery_longitude,
      delivery_time,
      comment,
      payment_method,
      items // [{ product_id, quantity }]
    } = req.body;
    
    // Валидация
    if (!order_number || !customer_name || !customer_phone || !items || items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Проверка времени доставки (минимум 1 час от текущего времени)
    if (delivery_time) {
      const deliveryDate = new Date(delivery_time);
      const minDeliveryTime = new Date(Date.now() + 60 * 60 * 1000); // +1 час
      
      if (deliveryDate < minDeliveryTime) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: 'Delivery time must be at least 1 hour from now' 
        });
      }
    }
    
    // Получить или создать пользователя
    let userId = null;
    if (telegram_id) {
      const userResult = await client.query(
        `INSERT INTO users (telegram_id, name, phone) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (telegram_id) 
         DO UPDATE SET name = $2, phone = $3
         RETURNING id`,
        [telegram_id, customer_name, customer_phone]
      );
      userId = userResult.rows[0].id;
    }
    
    // Рассчитать общую сумму
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const productResult = await client.query(
        'SELECT * FROM products WHERE id = $1 AND is_active = true AND is_available = true',
        [item.product_id]
      );
      
      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: `Product ${item.product_id} not available` 
        });
      }
      
      const product = productResult.rows[0];
      const quantity = parseFloat(item.quantity);
      const subtotal = product.price * quantity;
      
      totalAmount += subtotal;
      
      orderItems.push({
        product_id: product.id,
        product_name_ru: product.name_ru,
        product_name_en: product.name_en,
        price: product.price,
        quantity,
        unit: product.unit,
        subtotal
      });
    }
    
    // Создать заказ
    const orderResult = await client.query(
      `INSERT INTO orders 
       (order_number, user_id, telegram_id, customer_name, customer_phone,
        branch_id, delivery_type, delivery_address, delivery_latitude, delivery_longitude,
        delivery_time, comment, payment_method, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        order_number,
        userId,
        telegram_id,
        customer_name,
        customer_phone,
        branch_id,
        delivery_type || 'delivery',
        delivery_address,
        delivery_latitude,
        delivery_longitude,
        delivery_time,
        comment,
        payment_method || 'cash',
        totalAmount,
        'pending'
      ]
    );
    
    const order = orderResult.rows[0];
    
    // Добавить товары в заказ
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items 
         (order_id, product_id, product_name_ru, product_name_en, price, quantity, unit, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          order.id,
          item.product_id,
          item.product_name_ru,
          item.product_name_en,
          item.price,
          item.quantity,
          item.unit,
          item.subtotal
        ]
      );
    }
    
    await client.query('COMMIT');
    
    // Отправить уведомления
    try {
      // Уведомление админу
      await sendOrderNotificationToAdmin(order, orderItems);
      
      // Уведомление клиенту
      if (telegram_id) {
        await sendOrderStatusToCustomer(telegram_id, order, 'pending');
      }
    } catch (notifError) {
      console.error('Error sending notifications:', notifError);
    }
    
    res.status(201).json({
      ...order,
      items: orderItems
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
};

// Получить заказ по ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const orderResult = await pool.query(
      `SELECT o.*, b.name_ru as branch_name_ru, b.name_en as branch_name_en
       FROM orders o
       LEFT JOIN branches b ON o.branch_id = b.id
       WHERE o.id = $1`,
      [id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );
    
    res.json({
      ...order,
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Получить заказы пользователя
export const getUserOrders = async (req, res) => {
  try {
    const { telegram_id } = req.query;
    
    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id required' });
    }
    
    const result = await pool.query(
      `SELECT o.*, b.name_ru as branch_name_ru, b.name_en as branch_name_en
       FROM orders o
       LEFT JOIN branches b ON o.branch_id = b.id
       WHERE o.telegram_id = $1
       ORDER BY o.created_at DESC`,
      [telegram_id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
