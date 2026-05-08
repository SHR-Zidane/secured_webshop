const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');
const adminAuth  = require('../middleware/adminAuth');
const controller = require('../controllers/AdminController');

router.get('/users', auth, adminAuth, controller.getUsers);

module.exports = router;
