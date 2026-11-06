const express = require('express');
const { createPost, listPosts, getPostById, updatePost, deletePost } = require('../controllers/post.controller');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/', listPosts);
router.get('/:id', getPostById);
router.patch('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);
router.post('/', authenticate, createPost);

module.exports = router;
