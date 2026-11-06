const express = require('express');
const { createPost, listPosts, getPostById } = require('../controllers/post.controller');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/', listPosts);
router.get('/:id', getPostById);
router.post('/', authenticate, createPost);

module.exports = router;
