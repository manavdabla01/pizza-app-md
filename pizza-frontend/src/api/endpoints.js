import api from './client';

// ---------- Auth ----------
export const signup = (data) => api.post('/users/signup', data);
export const login = (data) => api.post('/users/login', data);
export const logout = () => api.get('/users/logout');

// ---------- Pizzas ----------
export const getPizzas = () => api.get('/pizzas/');
export const getPizzaById = (id) => api.get(`/pizzas/${id}`);

// ---------- Side Items ----------
export const getSideItems = () => api.get('/sideitems/getItems');

// ---------- Cart ----------
export const addToCart = (data) => api.post('/cart/add', data);
export const getCart = () => api.get('/cart/');
export const updateCartItems = (items) => api.patch('/cart/update', { items });
export const removeCartItem = (cartItemId) => api.delete(`/cart/item/${cartItemId}`);
export const clearCart = () => api.delete('/cart/clear');

// ---------- Orders ----------
export const checkoutOrder = (data) => api.post('/orders/checkoutOrder', data);
export const getMyOrders = () => api.get('/orders/my-orders');
export const cancelOrder = (orderId) => api.delete(`/orders/${orderId}`);

// ---------- Payment ----------
export const createRazorpayOrder = () => api.post('/payment/create-order');
export const verifyPayment = (data) => api.post('/payment/verify', data);

// ---------- Reviews ----------
export const addReview = (data) => api.post('/reviews', data);
export const getPizzaReviews = (pizzaId) => api.get(`/reviews/pizza/${pizzaId}`);
export const getSideItemReviews = (sideItemId) => api.get(`/reviews/sideitem/${sideItemId}`);
export const getRecentReviews = () => api.get('/reviews/recent');
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// ---------- Admin ----------
export const adminGetAllUsers = () => api.get('/admin/all-users');
export const adminAddPizza = (formData) =>
  api.post('/admin/addPizza', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdatePizza = (id, formData) =>
  api.patch(`/admin/pizza/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminDeletePizza = (id) => api.delete(`/admin/pizza/${id}`);

export const adminAddSideItem = (formData) =>
  api.post('/admin/addSideItem', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdateSideItem = (id, formData) =>
  api.patch(`/admin/sideItem/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminDeleteSideItem = (id) => api.delete(`/admin/sideItem/${id}`);

export const adminGetOrders = () => api.get('/admin/getOrders');
export const adminUpdateOrderStatus = (id, status) => api.patch(`/admin/updateStatus/${id}`, { status });