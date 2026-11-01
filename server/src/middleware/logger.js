const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
const silent = process.env.NODE_ENV === 'test';
if (!silent) fs.mkdirSync(logDir, { recursive: true });

// Logs: [timestamp] METHOD /url STATUS 12ms  -> console + logs/access.log
module.exports = (req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const line = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`;
    if (silent) return;
    console.log(line);
    fs.appendFile(path.join(logDir, 'access.log'), line + '\n', () => {});
  });
  next();
};
