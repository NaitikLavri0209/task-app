const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { suggestSubtasks } = require('../services/ai');

router.use(auth);
router.post('/suggest', [body('goal').trim().isLength({ min: 3, max: 200 }).withMessage('Goal must be 3-200 characters')], validate,
  asyncHandler(async (req, res) => res.json({ suggestions: await suggestSubtasks(req.body.goal) })));
module.exports = router;
