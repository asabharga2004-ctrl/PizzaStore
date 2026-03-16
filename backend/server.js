const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dns      = require('dns');
require('dotenv').config();

const dnsServers = (process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1').split(',').map(s => s.trim()).filter(Boolean);
if (dnsServers.length > 0) {
  try {
    dns.setServers(dnsServers);
    console.log('DNS servers set to:', dnsServers);
  } catch (err) {
    console.warn('Could not set DNS servers:', err.message);
  }
}

const app = express();

// ─── CORS Fix for Firebase ───
app.use(cors({
  origin: [
    'https://pizzastore-app-2026.web.app',
    'https://pizzastore-app-2026.firebaseapp.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/menu',       require('./routes/menu'));
app.use('/api/cart',       require('./routes/cart'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/messages',   require('./routes/messages'));
app.use('/api/addresses',  require('./routes/addresses'));
app.use('/api/payments',   require('./routes/payments'));

app.get('/', (req, res) => res.json({ message: 'Pizza Store API running!' }));

// Only start server if NOT required by tests
if (require.main === module) {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MongoDB error: MONGO_URI is not set');
    process.exit(1);
  }

  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log('MongoDB connected!');
      const port = process.env.PORT || 5000;
      const server = app.listen(port, () => {
        console.log('Backend running at http://localhost:' + port);
      });
      server.on('error', err => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${port} is already in use. Please stop the existing server and retry.`);
        } else {
          console.error('Server error:', err);
        }
        process.exit(1);
      });
    })
    .catch(err => {
      console.error('MongoDB error:', err.message);
      console.error('Full error:', err);
      console.error('\n✅ Ensure Atlas access list allows your IP; if debugging DNS set DNS_SERVERS=8.8.8.8,1.1.1.1 in .env');
      process.exit(1);
    });
}

// Export app for Supertest
module.exports = app;