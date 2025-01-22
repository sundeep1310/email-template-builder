const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: '*',
  methods: 'POST',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const EmailTemplate = mongoose.model('EmailTemplate', new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  sections: [{
    id: { type: String, required: true },
    type: { type: String, required: true },
    content: { type: String, default: '' }
  }],
  createdAt: { type: Date, default: Date.now }
}));

app.post('/api/email-config', async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      sections: req.body.sections.map(section => ({
        id: section.id.toString(),
        type: section.type,
        content: section.content || ''
      }))
    };

    const template = new EmailTemplate(templateData);
    await template.save();
    res.json({ success: true, template });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;