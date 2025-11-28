-- Database Schema for E-Commerce Food Delivery App
-- PostgreSQL 14+

-- Создание базы данных (выполнить вручную если нужно)
-- CREATE DATABASE ecommerce_db;

-- Таблица категорий товаров
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name_ru VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица филиалов
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    name_ru VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    address_ru TEXT NOT NULL,
    address_en TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    working_hours VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица товаров
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name_ru VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_ru TEXT,
    description_en TEXT,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'pcs', -- 'pcs' (штуки), 'kg' (килограммы), 'l' (литры)
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица пользователей (клиенты)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE,
    name VARCHAR(255),
    phone VARCHAR(20),
    language VARCHAR(2) DEFAULT 'ru', -- 'ru' or 'en'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица администраторов
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    telegram_id BIGINT,
    
    -- Контактная информация
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    
    -- Детали доставки
    branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
    delivery_type VARCHAR(20) DEFAULT 'delivery', -- 'delivery' или 'pickup'
    delivery_address TEXT,
    delivery_latitude DECIMAL(10, 8),
    delivery_longitude DECIMAL(11, 8),
    delivery_time TIMESTAMP, -- Желаемое время доставки
    
    -- Детали заказа
    comment TEXT,
    payment_method VARCHAR(20) DEFAULT 'cash', -- 'cash' или 'card'
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Статус
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'
    
    -- Метаданные
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Таблица товаров в заказе
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    
    -- Сохраняем данные товара на момент заказа
    product_name_ru VARCHAR(255) NOT NULL,
    product_name_en VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL, -- Поддержка дробных чисел для кг
    unit VARCHAR(20) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица настроек приложения
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_telegram ON orders(telegram_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Триггеры для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставка начальных данных (опционально)

-- Примеры категорий
INSERT INTO categories (name_ru, name_en, icon, sort_order) VALUES
('Сеты', 'Sets', '🎁', 1),
('Курочка', 'Chicken', '🍗', 2),
('Снеки', 'Snacks', '🍟', 3),
('Лестер', 'Lester', '🍔', 4),
('Напитки', 'Drinks', '🥤', 5),
('Десерты', 'Desserts', '🍰', 6)
ON CONFLICT DO NOTHING;

-- Пример филиала
INSERT INTO branches (name_ru, name_en, address_ru, address_en, phone, working_hours, latitude, longitude) VALUES
('Ривьера', 'Riviera', 'Ташкент, ул. Примерная 1', 'Tashkent, Primernaya st. 1', '+998901234567', '10:00-22:00', 41.311151, 69.279737),
('Голден лайф', 'Golden Life', 'Ташкент, ул. Примерная 2', 'Tashkent, Primernaya st. 2', '+998901234568', '10:00-22:00', 41.326418, 69.228372),
('Ойбек', 'Oybek', 'Ташкент, ул. Примерная 3', 'Tashkent, Primernaya st. 3', '+998901234569', '10:00-03:00', 41.316668, 69.247749),
('Парус', 'Parus', 'Ташкент, ул. Примерная 4', 'Tashkent, Primernaya st. 4', '+998901234570', '10:00-03:00', 41.335278, 69.289722)
ON CONFLICT DO NOTHING;

-- Настройки приложения
INSERT INTO settings (key, value, description) VALUES
('min_delivery_time_hours', '1', 'Минимальное время доставки в часах'),
('delivery_fee', '0', 'Стоимость доставки'),
('min_order_amount', '0', 'Минимальная сумма заказа'),
('app_name_ru', 'Les Ailes', 'Название приложения на русском'),
('app_name_en', 'Les Ailes', 'Название приложения на английском')
ON CONFLICT (key) DO NOTHING;
