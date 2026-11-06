const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const { Post } = require('../models/Post');
const Reaction = require('../models/Reaction');

const COMMENT_MAX_LENGTH = 2000;
const COMMENT_MIN_LENGTH = 2;
const MAX_PAGE_SIZE = 50;

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function serializeComment(comment) {
  return {
    id: comment._id.toString(),
    postId: comment.post.toString(),
    parentId: comment.parent ? comment.parent.toString() : null,
    content: comment.content,
    author: comment.author
      ? { id: comment.author._id.toString(), name: comment.author.name }
      : { id: null, name: 'Former student' },
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt
  };
}

async function listComments(req, res, next) {
  try {
    const { postId } = req.params;
    if (!validId(postId)) {
      return res.status(400).json({ success: false, message: 'The discussion ID is invalid.' });
    }

    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({ success: false, message: 'This discussion could not be found.' });
    }

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const [comments, total] = await Promise.all([
      Comment.find({ post: postId })
        .select('post parent content author createdAt updatedAt')
        .populate('author', 'name')
        .sort({ createdAt: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ post: postId })
    ]);

    const totalPages = Math.ceil(total / limit);
    const ids = comments.map((comment) => comment._id);
    const reactionRows = ids.length ? await Reaction.aggregate([
      { $match: { targetType: 'Comment', target: { $in: ids } } },
      { $group: {
        _id: '$target',
        count: { $sum: 1 },
        liked: { $max: req.user && req.user.id
          ? { $cond: [{ $eq: ['$user', new mongoose.Types.ObjectId(req.user.id)] }, 1, 0] }
          : 0 }
      } }
    ]) : [];
    const reactionMap = new Map(reactionRows.map((row) => [
      row._id.toString(),
      { reactionCount: row.count, isLiked: row.liked === 1 }
    ]));
    return res.status(200).json({
      success: true,
      data: {
        comments: comments.map((comment) => ({ ...serializeComment(comment), ...(reactionMap.get(comment._id.toString()) || { reactionCount: 0, isLiked: false }) })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasPreviousPage: page > 1,
          hasNextPage: page < totalPages
        }
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function createComment(req, res, next) {
  try {
    const { postId } = req.params;
    if (!validId(postId)) {
      return res.status(400).json({ success: false, message: 'The discussion ID is invalid.' });
    }

    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    const parentId = req.body.parentId === null || req.body.parentId === undefined || req.body.parentId === ''
      ? null
      : String(req.body.parentId);

    if (content.length < COMMENT_MIN_LENGTH || content.length > COMMENT_MAX_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Comment must contain between ${COMMENT_MIN_LENGTH} and ${COMMENT_MAX_LENGTH} characters.`
      });
    }

    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({ success: false, message: 'This discussion could not be found.' });
    }

    let parent = null;
    if (parentId) {
      if (!validId(parentId)) {
        return res.status(400).json({ success: false, message: 'The reply target is invalid.' });
      }
      parent = await Comment.findOne({ _id: parentId, post: postId }).select('_id parent');
      if (!parent) {
        return res.status(404).json({ success: false, message: 'The comment you are replying to could not be found.' });
      }
      if (parent.parent) {
        return res.status(400).json({ success: false, message: 'Replies can be one level deep in this release.' });
      }
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user.id,
      parent: parent ? parent._id : null,
      content
    });
    await comment.populate('author', 'name');

    return res.status(201).json({
      success: true,
      message: parent ? 'Your reply has been added.' : 'Your comment has been added.',
      data: { comment: serializeComment(comment) }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'The comment details are invalid.' });
    }
    return next(error);
  }
}

async function updateComment(req, res, next) {
  try {
    const { postId, commentId } = req.params;
    if (!validId(postId) || !validId(commentId)) {
      return res.status(400).json({ success: false, message: 'The discussion or comment ID is invalid.' });
    }

    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    if (content.length < COMMENT_MIN_LENGTH || content.length > COMMENT_MAX_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Comment must contain between ${COMMENT_MIN_LENGTH} and ${COMMENT_MAX_LENGTH} characters.`
      });
    }

    const comment = await Comment.findOne({ _id: commentId, post: postId });
    if (!comment) {
      return res.status(404).json({ success: false, message: 'This comment could not be found.' });
    }
    if (String(comment.author) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'You can only edit comments you created.' });
    }

    comment.content = content;
    await comment.save();
    await comment.populate('author', 'name');

    return res.status(200).json({
      success: true,
      message: 'Your comment has been updated.',
      data: { comment: serializeComment(comment) }
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteComment(req, res, next) {
  try {
    const { postId, commentId } = req.params;
    if (!validId(postId) || !validId(commentId)) {
      return res.status(400).json({ success: false, message: 'The discussion or comment ID is invalid.' });
    }

    const comment = await Comment.findOne({ _id: commentId, post: postId });
    if (!comment) {
      return res.status(404).json({ success: false, message: 'This comment could not be found.' });
    }
    if (String(comment.author) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'You can only delete comments you created.' });
    }

    if (!comment.parent) {
      const replies = await Comment.find({ post: postId, parent: comment._id }).select('_id');
      const replyIds = replies.map((reply) => reply._id);
      await Reaction.deleteMany({ targetType: 'Comment', target: { $in: replyIds } });
      await Comment.deleteMany({ _id: { $in: replyIds } });
    }
    await Reaction.deleteMany({ targetType: 'Comment', target: comment._id });
    await comment.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Your comment has been deleted.',
      data: { id: commentId }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listComments, createComment, updateComment, deleteComment };
