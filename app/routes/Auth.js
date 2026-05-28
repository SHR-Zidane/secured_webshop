const express    = require('express');
const router     = express.Router();
const rateLimit  = require('express-rate-limit');
const controller = require('../controllers/AuthController');

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: 'Trop de tentatives de connexion. Réessayez dans une minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login',    loginLimiter, controller.login);
router.post('/register', controller.register);

module.exports = router;
