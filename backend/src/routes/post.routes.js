const express = require('express');
const { createPost, listPosts } = require('../controllers/post.controller');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/', listPosts);
router.post('/', authenticate, createPost);

module.exports = router;
