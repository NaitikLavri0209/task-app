const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(logger);

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ai', require('./routes/ai'));

app.use(notFound);
app.use(errorHandler);
module.exports = app;
