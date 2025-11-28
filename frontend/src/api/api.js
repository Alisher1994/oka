import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Products
export const getProducts = async (categoryId = null) => {
  const params = categoryId ? { category_id: categoryId } : {};
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Categories
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

// Branches
export const getBranches = async () => {
  const response = await api.get('/branches');
  return response.data;
};

// Orders
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getUserOrders = async (telegramId) => {
  const response = await api.get('/orders/user/orders', {
    params: { telegram_id: telegramId }
  });
  return response.data;
};

// Admin endpoints
export const adminCreateProduct = async (formData) => {
  const response = await api.post('/admin/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const adminUpdateProduct = async (id, formData) => {
  const response = await api.put(`/admin/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const adminDeleteProduct = async (id) => {
  const response = await api.delete(`/admin/products/${id}`);
  return response.data;
};

export const adminGetOrders = async (status = null, limit = 50, offset = 0) => {
  const params = { limit, offset };
  if (status) params.status = status;
  
  const response = await api.get('/admin/orders', { params });
  return response.data;
};

export const adminUpdateOrderStatus = async (id, status) => {
  const response = await api.put(`/admin/orders/${id}/status`, { status });
  return response.data;
};

export default api;
