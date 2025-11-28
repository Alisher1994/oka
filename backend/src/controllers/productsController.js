import pool from '../database/db.js';

// Получить все товары
export const getProducts = async (req, res) => {
  try {
    const { category_id } = req.query;
    
    let query = `
      SELECT p.*, c.name_ru as category_name_ru, c.name_en as category_name_en
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
    const params = [];
    
    if (category_id) {
      params.push(category_id);
      query += ` AND p.category_id = $${params.length}`;
    }
    
    query += ' ORDER BY p.sort_order, p.name_ru';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Получить товар по ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT p.*, c.name_ru as category_name_ru, c.name_en as category_name_en
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Создать товар (admin)
export const createProduct = async (req, res) => {
  try {
    const {
      category_id,
      name_ru,
      name_en,
      description_ru,
      description_en,
      price,
      unit,
      is_available,
      sort_order
    } = req.body;
    
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const result = await pool.query(
      `INSERT INTO products 
       (category_id, name_ru, name_en, description_ru, description_en, 
        price, unit, image_url, is_available, sort_order) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        category_id,
        name_ru,
        name_en,
        description_ru,
        description_en,
        price,
        unit || 'pcs',
        image_url,
        is_available !== undefined ? is_available : true,
        sort_order || 0
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Обновить товар (admin)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name_ru,
      name_en,
      description_ru,
      description_en,
      price,
      unit,
      is_available,
      is_active,
      sort_order
    } = req.body;
    
    let image_url;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }
    
    const result = await pool.query(
      `UPDATE products 
       SET category_id = COALESCE($1, category_id),
           name_ru = COALESCE($2, name_ru),
           name_en = COALESCE($3, name_en),
           description_ru = COALESCE($4, description_ru),
           description_en = COALESCE($5, description_en),
           price = COALESCE($6, price),
           unit = COALESCE($7, unit),
           image_url = COALESCE($8, image_url),
           is_available = COALESCE($9, is_available),
           is_active = COALESCE($10, is_active),
           sort_order = COALESCE($11, sort_order)
       WHERE id = $12
       RETURNING *`,
      [
        category_id,
        name_ru,
        name_en,
        description_ru,
        description_en,
        price,
        unit,
        image_url,
        is_available,
        is_active,
        sort_order,
        id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Удалить товар (admin)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
