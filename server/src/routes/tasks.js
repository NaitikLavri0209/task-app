const router = require('express').Router();
const { body, param, query } = require('express-validator');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { cacheGet, invalidate } = require('../middleware/cache');
const notifier = require('../events/notifier');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const STATUS = ['todo', 'in-progress', 'done'];
const PRIORITY = ['low', 'medium', 'high'];
const rules = (optional) => {
  const title = body('title').trim().notEmpty().withMessage('Title is required');
  return [
    optional ? title.optional() : title,
    body('description').optional().isString().isLength({ max: 500 }).withMessage('Description max 500 characters'),
    body('status').optional().isIn(STATUS).withMessage(`Status must be one of: ${STATUS.join(', ')}`),
    body('priority').optional().isIn(PRIORITY).withMessage(`Priority must be one of: ${PRIORITY.join(', ')}`),
    body('dueDate').optional({ values: 'falsy' }).isISO8601().withMessage('dueDate must be a valid date'),
  ];
};
const idRule = param('id').isMongoId().withMessage('Invalid task id');

router.use(auth);

// READ (cached)
router.get('/', [query('status').optional().isIn(STATUS)], validate, cacheGet,
  asyncHandler(async (req, res) => {
    const filter = { user: req.user.id };
    if (req.query.status) filter.status = req.query.status;
    res.json(await Task.find(filter).sort('-createdAt'));
  })
);

router.get('/:id', [idRule], validate, asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
  if (!task) throw new AppError('Task not found', 404);
  res.json(task);
}));

// CREATE
router.post('/', rules(false), validate, asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;
  const task = await Task.create({ title, description, status, priority, dueDate: dueDate || undefined, user: req.user.id });
  invalidate(req.user.id);
  notifier.emit('task:created', task);
  res.status(201).json(task);
}));

// UPDATE
router.put('/:id', [idRule, ...rules(true)], validate, asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
  if (!task) throw new AppError('Task not found', 404);
  const wasDone = task.status === 'done';
  ['title', 'description', 'status', 'priority'].forEach((f) => { if (req.body[f] !== undefined) task[f] = req.body[f]; });
  if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate || undefined;
  await task.save();
  invalidate(req.user.id);
  if (!wasDone && task.status === 'done') notifier.emit('task:completed', task);
  res.json(task);
}));

// DELETE
router.delete('/:id', [idRule], validate, asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!task) throw new AppError('Task not found', 404);
  invalidate(req.user.id);
  notifier.emit('task:deleted', task);
  res.json({ message: 'Task deleted' });
}));

module.exports = router;
