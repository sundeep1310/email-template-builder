const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const MONGODB_URI = process.env.MONGODB_URI || "your_mongodb_atlas_connection_string_here";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: "majority",
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
}).then(() => {
    console.log('Successfully connected to MongoDB Atlas');
}).catch((error) => {
    console.error('MongoDB Atlas connection error:', error);
    process.exit(1);
});

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

const EmailTemplate = mongoose.model('EmailTemplate', new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  sections: [{
    id: { type: String, required: true },
    type: { type: String, required: true },
    content: { type: String, default: '' }
  }],
  createdAt: { type: Date, default: Date.now }
}));

const defaultTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{title}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; text-align: center; }
        img { max-width: 200px; height: auto; margin: 20px auto; display: block; }
        .header, .body, .footer { margin: 20px 0; padding: 20px; }
        .header { background: #f8f9fa; }
        .footer { background: #f8f9fa; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        {{#if imageUrl}}
        <img src="{{imageUrl}}" alt="Logo">
        {{/if}}
        <h1>{{title}}</h1>
        <div class="header">{{header}}</div>
        <div class="body">{{body}}</div>
        <div class="footer">{{footer}}</div>
    </div>
</body>
</html>`;

app.get('/api/email-layout', async (req, res) => {
  try {
    let template = defaultTemplate;
    const templatePath = path.join(__dirname, 'templates', 'layout.html');
    
    try {
      const exists = await fs.access(templatePath).then(() => true).catch(() => false);
      if (exists) {
        template = await fs.readFile(templatePath, 'utf8');
      }
    } catch (err) {
      console.log('Using default template:', err.message);
    }
    
    res.json({ layout: template, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
});

app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded', success: false });
    }
    const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    res.json({ imageUrl, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
});

app.post('/api/email-config', async (req, res) => {
  try {
    const { title, imageUrl, sections } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required', success: false });
    }

    const template = new EmailTemplate({
      title,
      imageUrl,
      sections: sections.map(section => ({
        id: section.id.toString(),
        type: section.type,
        content: section.content || ''
      }))
    });

    const savedTemplate = await template.save();
    res.json({ template: savedTemplate, success: true });
  } catch (error) {
    console.error('Save error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message, success: false });
    }
    res.status(500).json({ error: 'Failed to save template', success: false });
  }
});

app.post('/api/render-template', async (req, res) => {
  try {
    let template = defaultTemplate;
    const { title, imageUrl, sections } = req.body;
    
    const header = sections.find(s => s.type === 'header')?.content || '';
    const body = sections.find(s => s.type === 'body')?.content || '';
    const footer = sections.find(s => s.type === 'footer')?.content || '';

    let html = template
      .replace(/{{title}}/g, title || '')
      .replace(/{{header}}/g, header)
      .replace(/{{body}}/g, body)
      .replace(/{{footer}}/g, footer)
      .replace(/{{imageUrl}}/g, imageUrl || '');

    if (!imageUrl) {
      html = html.replace(/{{#if imageUrl}}[\s\S]*?{{\/if}}/g, '');
    } else {
      html = html.replace('{{#if imageUrl}}', '').replace('{{/if}}', '');
    }

    res.json({ html, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;