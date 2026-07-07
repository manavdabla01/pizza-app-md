import api from './client';

// ---------- Auth ----------
export const signup = (data) => api.post('/api/users/signup', data);
export const login = (data) => api.post('/api/users/login', data);
export const logout = () => api.get('/api/users/logout');

// ---------- Pizzas ----------
export const getPizzas = () => api.get('/api/pizzas/');
export const getPizzaById = (id) => api.get(`/api/pizzas/${id}`);

// ---------- Side Items ----------
export const getSideItems = () => api.get('/api/sideitems/getItems');

// ---------- Cart ----------
export const addToCart = (data) => api.post('/api/cart/add', data);
export const getCart = () => api.get('/api/cart/');
export const updateCartItems = (items) => api.patch('/api/cart/update', { items });
export const removeCartItem = (cartItemId) => api.delete(`/api/cart/item/${cartItemId}`);
export const clearCart = () => api.delete('/api/cart/clear');

// ---------- Orders ----------
export const checkoutOrder = (data) => api.post('/api/orders/checkoutOrder', data);
export const getMyOrders = () => api.get('/api/orders/my-orders');
export const cancelOrder = (orderId) => api.delete(`/api/orders/${orderId}`);

// ---------- Payment ----------
export const createRazorpayOrder = () => api.post('/api/payment/create-order');
export const verifyPayment = (data) => api.post('/api/payment/verify', data);

// ---------- Reviews ----------
export const addReview = (data) => api.post('/api/reviews', data);
export const getPizzaReviews = (pizzaId) => api.get(`/api/reviews/pizza/${pizzaId}`);
export const getSideItemReviews = (sideItemId) => api.get(`/api/reviews/sideitem/${sideItemId}`);
export const getRecentReviews = () => api.get('/api/reviews/recent');
export const deleteReview = (id) => api.delete(`/api/reviews/${id}`);

// ---------- Admin ----------
export const adminGetAllUsers = () => api.get('/api/admin/all-users');
export const adminAddPizza = (formData) =>
  api.post('/api/admin/addPizza', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdatePizza = (id, formData) =>
  api.patch(`/api/admin/pizza/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminDeletePizza = (id) => api.delete(`/api/admin/pizza/${id}`);

export const adminAddSideItem = (formData) =>
  api.post('/api/admin/addSideItem', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdateSideItem = (id, formData) =>
  api.patch(`/api/admin/sideItem/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminDeleteSideItem = (id) => api.delete(`/api/admin/sideItem/${id}`);

export const adminGetOrders = () => api.get('/api/admin/getOrders');
export const adminUpdateOrderStatus = (id, status) => api.patch(`/api/admin/updateStatus/${id}`, { status });