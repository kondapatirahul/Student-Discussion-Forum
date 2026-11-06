const mongoose = require('mongoose');
const Reaction = require('../models/Reaction');
const { Post } = require('../models/Post');
const Comment = require('../models/Comment');

async function toggleReaction(req, res, next) {
  try {
    const { postId, commentId } = req.params;
    const targetType = commentId ? 'Comment' : 'Post';
    const targetId = commentId || postId;
    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ success: false, message: 'The discussion or reaction target ID is invalid.' });
    }

    const target = targetType === 'Post'
      ? await Post.exists({ _id: postId })
      : await Comment.exists({ _id: targetId, post: postId });
    if (!target) {
      return res.status(404).json({ success: false, message: 'The item you want to react to could not be found.' });
    }

    const filter = { targetType, target: targetId, user: req.user.id };
    const existing = await Reaction.findOne(filter).select('_id');
    let liked;
    if (existing) {
      await Reaction.deleteOne({ _id: existing._id });
      liked = false;
    } else {
      try {
        await Reaction.create(filter);
        liked = true;
      } catch (error) {
        if (error.code !== 11000) throw error;
        liked = true;
      }
    }

    const count = await Reaction.countDocuments({ targetType, target: targetId });
    return res.status(200).json({
      success: true,
      message: liked ? 'You liked this.' : 'Your like was removed.',
      data: { liked, reactionCount: count, targetId }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { toggleReaction };
