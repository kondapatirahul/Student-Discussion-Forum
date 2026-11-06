const { Post, POST_CATEGORIES } = require('../models/Post');

async function createPost(req, res, next) {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    const category = typeof req.body.category === 'string' ? req.body.category.trim() : '';

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

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Please correct the discussion details.',
        errors
      });
    }

    const post = await Post.create({
      title,
      content,
      category,
      author: req.user.id
    });

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
          author: {
            id: post.author.id,
            name: post.author.name
          },
          createdAt: post.createdAt
        }
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'The discussion details are invalid.'
      });
    }
    return next(error);
  }
}

module.exports = { createPost };
