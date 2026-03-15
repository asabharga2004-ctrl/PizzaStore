const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/auth',       require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/menu',       require('./routes/menu'));
app.use('/api/cart',       require('./routes/cart'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/messages',   require('./routes/messages'));
app.use('/api/addresses',  require('./routes/addresses'));
app.use('/api/payments',   require('./routes/payments'));

app.get('/', (req, res) => res.json({ message: 'Pizza Store API running!' }));


if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connected!');
      app.listen(process.env.PORT || 5000, () =>
        console.log('Backend running at http://localhost:' + (process.env.PORT || 5000))
      );
    })
    .catch(err => { console.error('MongoDB error:', err.message); process.exit(1); });
}

module.exports = app;
