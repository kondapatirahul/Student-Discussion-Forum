const express = require('express');
const { register, login, currentUser } = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, currentUser);

module.exports = router;
