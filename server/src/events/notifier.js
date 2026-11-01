const EventEmitter = require('events');

class Notifier extends EventEmitter {}
const notifier = new Notifier();

// In-memory store: userId -> [{id,type,message,read,createdAt}] (latest 50)
const store = new Map();
let counter = 0;
function push(userId, type, message) {
  const list = store.get(String(userId)) || [];
  list.unshift({ id: ++counter, type, message, read: false, createdAt: new Date().toISOString() });
  store.set(String(userId), list.slice(0, 50));
  if (process.env.NODE_ENV !== 'test') console.log(`[notify:${type}] user=${userId} ${message}`);
}
// setImmediate => listener work runs in the background, never delaying the HTTP response
const on = (event, fn) => notifier.on(event, (task) => setImmediate(() => fn(task)));

on('task:created', (t) => push(t.user, 'info', `Task "${t.title}" was created`));
on('task:completed', (t) => push(t.user, 'success', `Nice! "${t.title}" is marked as done`));
on('task:deleted', (t) => push(t.user, 'warning', `Task "${t.title}" was deleted`));
on('task:due', (t) => push(t.user, 'danger', `"${t.title}" is due ${new Date(t.dueDate).toLocaleString()}`));

// Background scheduler: every minute, flag unfinished tasks that are overdue / due within 1 hour
const alreadyNotified = new Set();
function startScheduler(intervalMs = 60_000) {
  const Task = require('../models/Task');
  const timer = setInterval(async () => {
    try {
      const soon = new Date(Date.now() + 60 * 60 * 1000);
      const tasks = await Task.find({ status: { $ne: 'done' }, dueDate: { $lte: soon } });
      tasks.forEach((t) => {
        const key = `${t._id}:${t.dueDate.getTime()}`;
        if (!alreadyNotified.has(key)) { alreadyNotified.add(key); notifier.emit('task:due', t); }
      });
    } catch (e) { console.error('Scheduler error:', e.message); }
  }, intervalMs);
  timer.unref();
  return timer;
}

const getFor = (userId) => store.get(String(userId)) || [];
const markAllRead = (userId) => getFor(userId).forEach((n) => { n.read = true; });

module.exports = notifier;
module.exports.startScheduler = startScheduler;
module.exports.getFor = getFor;
module.exports.markAllRead = markAllRead;
