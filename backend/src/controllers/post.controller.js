const mongoose = require('mongoose');
const { Post, POST_CATEGORIES } = require('../models/Post');
const Reaction = require('../models/Reaction');

async function getReactionSummary(targetType, ids, userId) {
  if (!ids.length) return new Map();
  const rows = await Reaction.aggregate([
    { $match: { targetType, target: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) } } },
    { $group: { _id: '$target', count: { $sum: 1 }, liked: { $max: userId ? { $cond: [{ $eq: ['$user', new mongoose.Types.ObjectId(userId)] }, 1, 0] } : 0 } } }
  ]);
  return new Map(rows.map((row) => [row._id.toString(), { reactionCount: row.count, isLiked: row.liked === 1 }]));
}

async function createPost(req, res, next) {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    const category = typeof req.body.category === 'string' ? req.body.category.trim() : '';

    const errors = [];
    if (title.length < 5 || title.length > 140) errors.push('Title must be between 5 and 140 characters.');
    if (content.length < 20 || content.length > 10000) errors.push('Description must be between 20 and 10000 characters.');
    if (!POST_CATEGORIES.includes(category)) errors.push('Choose a valid discussion category.');

    if (errors.length) {
      return res.status(400).json({ success: false, message: 'Please correct the discussion details.', errors });
    }

    const post = await Post.create({ title, content, category, author: req.user.id });
    await post.populate('author', 'name');

    return res.status(201).json({
      success: true,
      message: 'Your discussion has been published.',
      data: {
        post: {
          id: post.id,
          title: post.title,
          content: post.content,
          category: post.category,
          author: { id: post.author.id, name: post.author.name },
          createdAt: post.createdAt
        }
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'The discussion details are invalid.' });
    }
    return next(error);
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
}

async function listPosts(req, res, next) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(20, Math.max(1, Number.parseInt(req.query.limit, 10) || 8));
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    const sort = req.query.sort === 'oldest' ? 1 : -1;

    if (category && !POST_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: 'Choose a valid discussion category.' });
    }

    const filter = {};
    if (category) filter.category = category;
    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { content: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .select('title content category author createdAt updatedAt')
        .populate('author', 'name')
        .sort({ createdAt: sort, _id: sort })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);
    const reactions = await getReactionSummary('Post', posts.map((post) => post._id), req.user?.id);
    return res.status(200).json({
      success: true,
      data: {
        posts: posts.map((post) => ({
          id: post._id.toString(),
          title: post.title,
          content: post.content,
          excerpt: post.content.length > 240 ? `${post.content.slice(0, 240).trim()}…` : post.content,
          category: post.category,
          author: post.author ? { id: post.author._id.toString(), name: post.author.name } : { id: null, name: 'Former student' },
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          ...(reactions.get(post._id.toString()) || { reactionCount: 0, isLiked: false })
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasPreviousPage: page > 1,
          hasNextPage: page < totalPages
        },
        filters: { category: category || null, search, sort: sort === 1 ? 'oldest' : 'latest' }
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function getPostById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'The discussion ID is invalid.' });
    }

    const post = await Post.findById(id)
      .select('title content category author createdAt updatedAt')
      .populate('author', 'name')
      .lean();

    if (!post) {
      return res.status(404).json({ success: false, message: 'This discussion could not be found.' });
    }

    const reactions = await getReactionSummary('Post', [post._id], req.user?.id);
    return res.status(200).json({
      success: true,
      data: {
        post: {
          id: post._id.toString(),
          title: post.title,
          content: post.content,
          category: post.category,
          author: post.author
            ? { id: post.author._id.toString(), name: post.author.name }
            : { id: null, name: 'Former student' },
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          ...(reactions.get(post._id.toString()) || { reactionCount: 0, isLiked: false })
        }
      }
    });
  } catch (error) {
    return next(error);
  }
}


function validatePostInput(body = {}) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const errors = [];

  if (title.length < 5 || title.length > 140) {
    errors.push('Title must be between 5 and 140 characters.');
  }
  if (content.length < 20 || content.length > 10000) {
    errors.push('Description must be between 20 and 10000 characters.');
  }
  if (!POST_CATEGORIES.includes(category)) {
    errors.push('Choose a valid discussion category.');
  }

  return { valid: errors.length === 0, errors, values: { title, content, category } };
}

async function updatePost(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'The discussion ID is invalid.' });
    }

    const validation = validatePostInput(req.body || {});
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Please correct the discussion details.',
        errors: validation.errors
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'This discussion could not be found.' });
    }
    if (String(post.author) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'You can only edit discussions you created.' });
    }

    post.title = validation.values.title;
    post.content = validation.values.content;
    post.category = validation.values.category;
    await post.save();
    await post.populate('author', 'name');

    return res.status(200).json({
      success: true,
      message: 'Your discussion has been updated.',
      data: {
        post: {
          id: post.id,
          title: post.title,
          content: post.content,
          category: post.category,
          author: { id: post.author.id, name: post.author.name },
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        }
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'The discussion details are invalid.' });
    }
    return next(error);
  }
}

async function deletePost(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'The discussion ID is invalid.' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'This discussion could not be found.' });
    }
    if (String(post.author) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'You can only delete discussions you created.' });
    }

    const Comment = require('../models/Comment');
    const commentIds = await Comment.find({ post: id }).distinct('_id');
    await Reaction.deleteMany({ $or: [{ targetType: 'Post', target: id }, { targetType: 'Comment', target: { $in: commentIds } }] });
    await Comment.deleteMany({ post: id });
    await post.deleteOne();
    return res.status(200).json({
      success: true,
      message: 'Your discussion has been deleted.',
      data: { id }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createPost, listPosts, getPostById, updatePost, deletePost };
