const express = require('express');
const { register, login, currentUser } = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful. Clear the session token on this device.'
  });
});
router.get('/me', authenticate, currentUser);

module.exports = router;
