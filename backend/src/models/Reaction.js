const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  targetType: { type: String, enum: ['Post', 'Comment'], required: true },
  target: { type: mongoose.Schema.Types.ObjectId, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true, versionKey: false });

reactionSchema.index({ targetType: 1, target: 1, user: 1 }, { unique: true });
reactionSchema.index({ targetType: 1, target: 1 });

module.exports = mongoose.model('Reaction', reactionSchema);
