const express = require('express');
const { createPost, listPosts, getPostById, updatePost, deletePost } = require('../controllers/post.controller');
const authenticate = require('../middleware/authenticate');
const commentRoutes = require('./comment.routes');
const optionalAuthenticate = require('../middleware/optionalAuthenticate');
const { toggleReaction } = require('../controllers/reaction.controller');

const router = express.Router();

router.get('/', optionalAuthenticate, listPosts);
router.use('/:postId/comments', commentRoutes);
router.get('/:id', optionalAuthenticate, getPostById);
router.post('/:postId/reaction', authenticate, toggleReaction);
router.patch('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);
router.post('/', authenticate, createPost);

module.exports = router;
