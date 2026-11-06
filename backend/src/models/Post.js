const mongoose = require('mongoose');

const POST_CATEGORIES = [
  'Programming',
  'Academics',
  'Projects',
  'Campus Life',
  'Placements',
  'General'
];

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    minlength: [5, 'Title must contain at least 5 characters'],
    maxlength: [140, 'Title cannot exceed 140 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    minlength: [20, 'Post content must contain at least 20 characters'],
    maxlength: [10000, 'Post content cannot exceed 10000 characters']
  },
  category: {
    type: String,
    required: [true, 'Choose a category'],
    enum: POST_CATEGORIES,
    default: 'General'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  versionKey: false
});

postSchema.index({ createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });

module.exports = {
  Post: mongoose.model('Post', postSchema),
  POST_CATEGORIES
};
