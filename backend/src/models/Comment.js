const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [2, 'Comment must contain at least 2 characters'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  }
}, {
  timestamps: true,
  versionKey: false
});

commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ post: 1, parent: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
