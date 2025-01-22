const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  content: { type: String, default: '' }
});

const emailTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  sections: [sectionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);