const mongoose = require('mongoose');
const dns = require('dns');
const bcrypt   = require('bcryptjs');
require('dotenv').config();

const dnsServers = (process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1').split(',').map(s => s.trim()).filter(Boolean);
if (dnsServers.length > 0) {
  try {
    dns.setServers(dnsServers);
    console.log('Seed DNS servers set to:', dnsServers);
  } catch (err) {
    console.warn('Could not set DNS servers for seed:', err.message);
  }
}

const User     = require('./models/User');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');

const categories = [
  { categoryName: 'Pizza' },
  { categoryName: 'Sides' },
  { categoryName: 'Beverages' },
  { categoryName: 'Combo' },
  { categoryName: 'New Launches' },
  { categoryName: 'Bestsellers' }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected...');

    await User.deleteMany({});
    await Category.deleteMany({});
    await MenuItem.deleteMany({});

    // Create admin
    const adminPass = await bcrypt.hash('admin123', 10);
    await User.create({ name: 'Admin', email: 'admin@pizza.com', password: adminPass, phone: '9999999999', role: 'admin' });
    console.log('Admin created: admin@pizza.com / admin123');

    // Create categories
    const cats = await Category.insertMany(categories);
    console.log('6 categories created');

    const pizzaCat = cats.find(c => c.categoryName === 'Pizza');
    const sidesCat = cats.find(c => c.categoryName === 'Sides');
    const bevCat   = cats.find(c => c.categoryName === 'Beverages');
    const comboCat = cats.find(c => c.categoryName === 'Combo');
    const newCat   = cats.find(c => c.categoryName === 'New Launches');
    const bestCat  = cats.find(c => c.categoryName === 'Bestsellers');

    // Create menu items
    await MenuItem.insertMany([
      { name: 'Margherita Pizza',      description: 'Classic tomato and cheese pizza',        price: 199, categoryId: pizzaCat._id },
      { name: 'Pepperoni Pizza',       description: 'Loaded with pepperoni slices',           price: 299, categoryId: pizzaCat._id },
      { name: 'Farmhouse Pizza',       description: 'Fresh veggies on a cheesy base',         price: 249, categoryId: pizzaCat._id },
      { name: 'Garlic Breadsticks',    description: 'Crispy garlic butter breadsticks',       price: 99,  categoryId: sidesCat._id },
      { name: 'Chicken Wings',         description: 'Spicy chicken wings with dip',           price: 149, categoryId: sidesCat._id },
      { name: 'Coca Cola',             description: 'Chilled Coca Cola 500ml',                price: 59,  categoryId: bevCat._id },
      { name: 'Mineral Water',         description: 'Chilled mineral water 1L',               price: 30,  categoryId: bevCat._id },
      { name: 'Pizza + Wings Combo',   description: 'Any pizza + chicken wings + beverage',  price: 449, categoryId: comboCat._id },
      { name: 'Double Cheese Burst',   description: 'New double cheese burst pizza',          price: 349, categoryId: newCat._id },
      { name: 'Classic Margherita',    description: 'All-time bestseller pizza',              price: 199, categoryId: bestCat._id }
    ]);
    console.log('10 menu items created');
    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}
seed();
