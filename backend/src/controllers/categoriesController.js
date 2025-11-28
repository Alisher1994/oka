import pool from '../database/db.js';

// Получить все категории
export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories WHERE is_active = true ORDER BY sort_order, name_ru'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Получить категорию по ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

// Создать категорию (admin)
export const createCategory = async (req, res) => {
  try {
    const { name_ru, name_en, icon, sort_order } = req.body;
    
    const result = await pool.query(
      `INSERT INTO categories (name_ru, name_en, icon, sort_order) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name_ru, name_en, icon, sort_order || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// Обновить категорию (admin)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name_ru, name_en, icon, sort_order, is_active } = req.body;
    
    const result = await pool.query(
      `UPDATE categories 
       SET name_ru = COALESCE($1, name_ru),
           name_en = COALESCE($2, name_en),
           icon = COALESCE($3, icon),
           sort_order = COALESCE($4, sort_order),
           is_active = COALESCE($5, is_active)
       WHERE id = $6
       RETURNING *`,
      [name_ru, name_en, icon, sort_order, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// Удалить категорию (admin)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
