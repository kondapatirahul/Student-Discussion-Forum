const express = require('express');
const {
  listComments,
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/comment.controller');
const authenticate = require('../middleware/authenticate');

const router = express.Router({ mergeParams: true });

router.get('/', listComments);
router.post('/', authenticate, createComment);
router.patch('/:commentId', authenticate, updateComment);
router.delete('/:commentId', authenticate, deleteComment);

module.exports = router;
