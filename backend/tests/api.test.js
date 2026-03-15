
const request    = require('supertest');
const { expect } = require('chai');
const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');

process.env.MONGO_URI  = 'mongodb://localhost:27017/pizzastore_test';
process.env.JWT_SECRET = 'pizzasecret123';
process.env.PORT       = '5099';

const app = require('../server');

let adminToken    = '';
let customerToken = '';
let customerId    = '';
let categoryId    = '';
let menuItemId    = '';
let cartItemId    = '';
let addressId     = '';
let orderId       = '';

const ts           = Date.now();
const customerData = {
  name:     'Test User ' + ts,
  email:    'testuser' + ts + '@pizza.com',
  password: 'test123',
  phone:    '9999999999'
};


before(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('  Test DB connected: pizzastore_test');

  
  const User = require('../models/User');
  const exists = await User.findOne({ email: 'admin@pizza.com' });
  if (!exists) {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({ name: 'Admin', email: 'admin@pizza.com', password: hashed, phone: '0000000000', role: 'admin' });
    console.log('  Admin user created in test DB.');
  }
});


after(async () => {
  const User     = require('../models/User');
  const Cart     = require('../models/Cart');
  const Order    = require('../models/Order');
  const Address  = require('../models/Address');
  const Message  = require('../models/Message');
  const Payment  = require('../models/Payment');
  const Category = require('../models/Category');
  const MenuItem = require('../models/MenuItem');

  if (customerId) {
    await Cart.deleteMany({ userId: customerId });
    await Order.deleteMany({ userId: customerId });
    await Address.deleteMany({ userId: customerId });
    await Message.deleteMany({ userId: customerId });
    await Payment.deleteMany({ userId: customerId });
    await User.findByIdAndDelete(customerId);
  }
  if (categoryId) await Category.findByIdAndDelete(categoryId);
  if (menuItemId) await MenuItem.findByIdAndDelete(menuItemId);

  await mongoose.connection.close();
  console.log('  Test DB disconnected.');
});


describe('AUTH API', () => {

  it('POST /api/auth/register — register new customer', async () => {
    const res = await request(app).post('/api/auth/register').send(customerData);
    expect(res.status).to.equal(201);
    expect(res.body.success).to.be.true;
    expect(res.body.token).to.be.a('string');
    expect(res.body.user.role).to.equal('customer');
    customerToken = res.body.token;
    customerId    = res.body.user.id;
  });

  it('POST /api/auth/register — reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(customerData);
    expect(res.status).to.equal(400);
    expect(res.body.success).to.be.false;
  });

  it('POST /api/auth/register — reject missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' });
    expect(res.status).to.equal(400);
    expect(res.body.success).to.be.false;
  });

  it('POST /api/auth/login — admin login successfully', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@pizza.com', password: 'admin123' });
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.user.role).to.equal('admin');
    adminToken = res.body.token;
  });

  it('POST /api/auth/login — reject wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@pizza.com', password: 'wrongpass' });
    expect(res.status).to.equal(400);
    expect(res.body.success).to.be.false;
  });

  it('POST /api/auth/login — reject unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@x.com', password: 'pass123' });
    expect(res.status).to.equal(400);
    expect(res.body.success).to.be.false;
  });

  it('GET /api/auth/me — return current user', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer ' + customerToken);
    expect(res.status).to.equal(200);
    expect(res.body.user).to.have.property('email');
  });

  it('GET /api/auth/me — reject without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).to.equal(401);
  });
});


describe('CATEGORY API', () => {

  it('GET /api/categories — return all categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data).to.be.an('array');
  });

  it('POST /api/categories — admin creates category', async () => {
    const res = await request(app).post('/api/categories')
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ categoryName: 'TestCat' + ts });
    expect(res.status).to.equal(201);
    expect(res.body.success).to.be.true;
    categoryId = res.body.data._id;
  });

  it('POST /api/categories — customer blocked (403)', async () => {
    const res = await request(app).post('/api/categories')
      .set('Authorization', 'Bearer ' + customerToken)
      .send({ categoryName: 'Hack' });
    expect(res.status).to.equal(403);
  });

  it('POST /api/categories — reject missing categoryName', async () => {
    const res = await request(app).post('/api/categories')
      .set('Authorization', 'Bearer ' + adminToken).send({});
    expect(res.status).to.equal(400);
  });
});


describe('MENU API', () => {

  it('GET /api/menu — return all menu items', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.status).to.equal(200);
    expect(res.body.data).to.be.an('array');
  });

  it('POST /api/menu — admin creates item', async () => {
    const res = await request(app).post('/api/menu')
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ name: 'TestPizza' + ts, price: 199, categoryId, description: 'Yummy', isAvailable: true });
    expect(res.status).to.equal(201);
    expect(res.body.success).to.be.true;
    menuItemId = res.body.data._id;
    cartItemId = res.body.data._id;
  });

  it('POST /api/menu — reject missing price', async () => {
    const res = await request(app).post('/api/menu')
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ name: 'No Price Pizza', categoryId });
    expect(res.status).to.equal(400);
  });

  it('PUT /api/menu/:id — admin updates item', async () => {
    const res = await request(app).put('/api/menu/' + menuItemId)
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ name: 'Updated Pizza' + ts, price: 249 });
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
  });

  it('GET /api/menu?search — filter items by name', async () => {
    const res = await request(app).get('/api/menu?search=Updated Pizza' + ts);
    expect(res.status).to.equal(200);
    expect(res.body.data).to.be.an('array');
  });

  it('DELETE /api/menu/:id — customer blocked (403)', async () => {
    const res = await request(app).delete('/api/menu/' + menuItemId)
      .set('Authorization', 'Bearer ' + customerToken);
    expect(res.status).to.equal(403);
  });

  it('DELETE /api/menu/:id — admin deletes item', async () => {
    
    const created = await request(app).post('/api/menu')
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ name: 'ToDelete' + ts, price: 99, categoryId, isAvailable: true });
    const tmpId = created.body.data._id;
    const res = await request(app).delete('/api/menu/' + tmpId)
      .set('Authorization', 'Bearer ' + adminToken);
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
  });
});


describe('CART API', () => {

  it('GET /api/cart — customer gets their cart', async () => {
    const res = await request(app).get('/api/cart')
      .set('Authorization', 'Bearer ' + customerToken);
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
  });

  it('POST /api/cart/add — add item to cart', async () => {
    const res = await request(app).post('/api/cart/add')
      .set('Authorization', 'Bearer ' + customerToken)
      .send({ itemId: cartItemId, quantity: 1 });
    expect(res.status).to.equal(200);
    expect(res.body.data.items).to.be.an('array');
    expect(res.body.data.items.length).to.be.greaterThan(0);
  });

  it('POST /api/cart/add — reject without token', async () => {
    const res = await request(app).post('/api/cart/add').send({ itemId: cartItemId });
    expect(res.status).to.equal(401);
  });

  it('PUT /api/cart/update — update item quantity', async () => {
    const res = await request(app).put('/api/cart/update')
      .set('Authorization', 'Bearer ' + customerToken)
      .send({ itemId: cartItemId, quantity: 3 });
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
  });
});


describe('ADDRESS API', () => {

  it('POST /api/addresses — add new address', async () => {
    const res = await request(app).post('/api/addresses')
      .set('Authorization', 'Bearer ' + customerToken)
      .send({ houseNumber: '12A', street: 'MG Road', city: 'Vijayawada', state: 'AP', pincode: '520001', isDefault: true });
    expect(res.status).to.equal(201);
    expect(res.body.success).to.be.true;
    addressId = res.body.data._id;
  });

  it('GET /api/addresses — return customer addresses', async () => {
    const res = await request(app).get('/api/addresses')
      .set('Authorization', 'Bearer ' + customerToken);
    expect(res.status).to.equal(200);
    expect(res.body.data.length).to.be.greaterThan(0);
  });

  it('POST /api/addresses — reject missing fields', async () => {
    const res = await request(app).post('/api/addresses')
      .set('Authorization', 'Bearer ' + customerToken)
      .send({ houseNumber: '5B' });
    expect(res.status).to.equal(400);
  });
});


describe('ORDER API', () => {

  it('POST /api/orders — place order from cart', async () => {
    const res = await request(app).post('/api/orders')
      .set('Authorization', 'Bearer ' + customerToken)
      .send({ addressId, deliveryMode: 'delivery', paymentMode: 'cash' });
    expect(res.status).to.equal(201);
    expect(res.body.success).to.be.true;
    expect(res.body.data.orderStatus).to.equal('pending');
    orderId = res.body.data._id;
  });

  it('GET /api/orders/my — customer sees own orders', async () => {
    const res = await request(app).get('/api/orders/my')
      .set('Authorization', 'Bearer ' + customerToken);
    expect(res.status).to.equal(200);
    expect(res.body.data.length).to.be.greaterThan(0);
  });

  it('GET /api/orders/all — admin sees all orders', async () => {
    const res = await request(app).get('/api/orders/all')
      .set('Authorization', 'Bearer ' + adminToken);
    expect(res.status).to.equal(200);
    expect(res.body.data).to.be.an('array');
  });

  it('GET /api/orders/all — customer blocked (403)', async () => {
    const res = await request(app).get('/api/orders/all')
      .set('Authorization', 'Bearer ' + customerToken);
    expect(res.status).to.equal(403);
  });

  it('PUT /api/orders/:id/status — admin accepts order', async () => {
    const res = await request(app).put('/api/orders/' + orderId + '/status')
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ orderStatus: 'accepted', messageText: 'Preparing your order!' });
    expect(res.status).to.equal(200);
    expect(res.body.data.orderStatus).to.equal('accepted');
  });

  it('PUT /api/orders/:id/cancel — customer cancels pending order', async () => {

    await request(app).post('/api/cart/add')
      .set('Authorization', 'Bearer ' + customerToken)
      .send({ itemId: cartItemId, quantity: 1 });
    const placed = await request(app).post('/api/orders')
      .set('Authorization', 'Bearer ' + customerToken)
      .send({ addressId, deliveryMode: 'delivery', paymentMode: 'cash' });
    const newId = placed.body.data?._id;
    if (newId) {
      const res = await request(app).put('/api/orders/' + newId + '/cancel')
        .set('Authorization', 'Bearer ' + customerToken);
      expect(res.status).to.equal(200);
      expect(res.body.data.orderStatus).to.equal('cancelled');
    }
  });

  it('GET /api/orders/admin/revenue — admin gets revenue', async () => {
    const res = await request(app).get('/api/orders/admin/revenue')
      .set('Authorization', 'Bearer ' + adminToken);
    expect(res.status).to.equal(200);
    expect(res.body.data).to.be.an('array');
  });
});


describe('MESSAGE API', () => {

  it('GET /api/messages — customer sees messages', async () => {
    const res = await request(app).get('/api/messages')
      .set('Authorization', 'Bearer ' + customerToken);
    expect(res.status).to.equal(200);
    expect(res.body.data).to.be.an('array');
    expect(res.body.data.length).to.be.greaterThan(0);
  });

  it('GET /api/messages — reject without token (401)', async () => {
    const res = await request(app).get('/api/messages');
    expect(res.status).to.equal(401);
  });

  it('PUT /api/messages/:id/read — mark message as read', async () => {
    const msgs  = await request(app).get('/api/messages').set('Authorization', 'Bearer ' + customerToken);
    const msgId = msgs.body.data[0]?._id;
    if (msgId) {
      const res = await request(app).put('/api/messages/' + msgId + '/read')
        .set('Authorization', 'Bearer ' + customerToken);
      expect(res.status).to.equal(200);
    }
  });
});


describe('PAYMENT API', () => {

  it('GET /api/payments/:orderId — get payment for order', async () => {
    const res = await request(app).get('/api/payments/' + orderId)
      .set('Authorization', 'Bearer ' + customerToken);
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.paidAmount).to.be.greaterThan(0);
  });

  it('PUT /api/payments/:orderId/pay — mark payment done', async () => {
    const res = await request(app).put('/api/payments/' + orderId + '/pay')
      .set('Authorization', 'Bearer ' + customerToken)
      .send({ transactionId: 'TXN' + ts });
    expect(res.status).to.equal(200);
    expect(res.body.data.paymentStatus).to.equal('paid');
  });
});
