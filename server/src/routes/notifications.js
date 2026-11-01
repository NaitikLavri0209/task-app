const router = require('express').Router();
const auth = require('../middleware/auth');
const { getFor, markAllRead } = require('../events/notifier');

router.use(auth);
router.get('/', (req, res) => res.json(getFor(req.user.id)));
router.post('/read', (req, res) => { markAllRead(req.user.id); res.json({ message: 'All marked as read' }); });
module.exports = router;
