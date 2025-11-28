import pool from '../database/db.js';

// Получить все филиалы
export const getBranches = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM branches WHERE is_active = true ORDER BY name_ru'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

// Получить филиал по ID
export const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM branches WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({ error: 'Failed to fetch branch' });
  }
};

// Создать филиал (admin)
export const createBranch = async (req, res) => {
  try {
    const {
      name_ru,
      name_en,
      address_ru,
      address_en,
      latitude,
      longitude,
      phone,
      working_hours
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO branches 
       (name_ru, name_en, address_ru, address_en, latitude, longitude, phone, working_hours) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [name_ru, name_en, address_ru, address_en, latitude, longitude, phone, working_hours]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ error: 'Failed to create branch' });
  }
};

// Обновить филиал (admin)
export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name_ru,
      name_en,
      address_ru,
      address_en,
      latitude,
      longitude,
      phone,
      working_hours,
      is_active
    } = req.body;
    
    const result = await pool.query(
      `UPDATE branches 
       SET name_ru = COALESCE($1, name_ru),
           name_en = COALESCE($2, name_en),
           address_ru = COALESCE($3, address_ru),
           address_en = COALESCE($4, address_en),
           latitude = COALESCE($5, latitude),
           longitude = COALESCE($6, longitude),
           phone = COALESCE($7, phone),
           working_hours = COALESCE($8, working_hours),
           is_active = COALESCE($9, is_active)
       WHERE id = $10
       RETURNING *`,
      [name_ru, name_en, address_ru, address_en, latitude, longitude, phone, working_hours, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({ error: 'Failed to update branch' });
  }
};

// Удалить филиал (admin)
export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM branches WHERE id = $1', [id]);
    
    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ error: 'Failed to delete branch' });
  }
};
