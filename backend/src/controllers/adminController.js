import pool from '../database/db.js';
import { sendOrderStatusToCustomer } from '../bot/notifications.js';

// Получить все заказы (admin)
export const getAllOrders = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT o.*, b.name_ru as branch_name_ru, b.name_en as branch_name_en
      FROM orders o
      LEFT JOIN branches b ON o.branch_id = b.id
    `;
    const params = [];
    
    if (status) {
      params.push(status);
      query += ` WHERE o.status = $${params.length}`;
    }
    
    query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Обновить статус заказа (admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await pool.query(
      `UPDATE orders 
       SET status = $1,
           completed_at = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = result.rows[0];
    
    // Отправить уведомление клиенту
    if (order.telegram_id) {
      try {
        await sendOrderStatusToCustomer(order.telegram_id, order, status);
      } catch (notifError) {
        console.error('Error sending status notification:', notifError);
      }
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Статистика заказов (admin)
export const getOrdersStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status = 'completed' THEN total_amount END) as avg_order_value
      FROM orders
    `);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};
