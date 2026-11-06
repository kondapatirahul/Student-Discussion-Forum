const express = require('express');
const {
  listComments,
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/comment.controller');
const authenticate = require('../middleware/authenticate');
const optionalAuthenticate = require('../middleware/optionalAuthenticate');
const { toggleReaction } = require('../controllers/reaction.controller');

const router = express.Router({ mergeParams: true });

router.get('/', optionalAuthenticate, listComments);
router.post('/:commentId/reaction', authenticate, toggleReaction);
router.post('/', authenticate, createComment);
router.patch('/:commentId', authenticate, updateComment);
router.delete('/:commentId', authenticate, deleteComment);

module.exports = router;
