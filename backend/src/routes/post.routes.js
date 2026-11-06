const express = require('express');
const { createPost } = require('../controllers/post.controller');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/', authenticate, createPost);

module.exports = router;
