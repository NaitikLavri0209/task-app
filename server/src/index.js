require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { startScheduler } = require('./events/notifier');

const PORT = process.env.PORT || 5000;
if (!process.env.JWT_SECRET) { console.error('JWT_SECRET is required'); process.exit(1); }

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskdb')
  .then(() => {
    console.log('MongoDB connected');
    startScheduler();
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
