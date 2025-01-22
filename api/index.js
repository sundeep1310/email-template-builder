const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const EmailTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  sections: [{
    id: { type: String, required: true },
    type: { type: String, required: true },
    content: { type: String, default: '' }
  }],
  createdAt: { type: Date, default: Date.now }
});

let EmailTemplate;
try {
  EmailTemplate = mongoose.model('EmailTemplate');
} catch {
  EmailTemplate = mongoose.model('EmailTemplate', EmailTemplateSchema);
}

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 40000 * 1024
  }
});

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

const emailTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #ffffff;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }

        .logo-container {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px 0;
            margin-bottom: 20px;
            background-color: #ffffff;
        }

        .logo-container img {
            max-width: 300px;
            width: auto;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            margin-bottom: 20px;
            border-radius: 8px;
        }
        
        .body {
            text-align: center;
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #e9ecef;
            margin-bottom: 20px;
            border-radius: 8px;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            font-size: 14px;
            color: #666666;
        }
    </style>
</head>
<body>
    <div class="container">
        {{#if imageUrl}}
        <div class="logo-container">
            <img src="{{imageUrl}}" alt="Logo">
        </div>
        {{/if}}
        <div class="header">{{header}}</div>
        <div class="body">{{body}}</div>
        <div class="footer">{{footer}}</div>
    </div>
</body>
</html>`;

const handler = async (req, res) => {
  try {
    await connectDB();
    
    const path = req.query.path || '';
    
    if (req.method === 'GET' && path === 'email-layout') {
      return res.json({ layout: emailTemplate });
    }
    
    if (req.method === 'POST' && path === 'upload-image') {
      const uploadMiddleware = upload.single('image');
      return uploadMiddleware(req, res, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        
        const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        return res.json({ imageUrl });
      });
    }
    
    if (req.method === 'POST' && path === 'email-config') {
      const template = new EmailTemplate({
        ...req.body,
        sections: req.body.sections.map(section => ({
          id: section.id.toString(),
          type: section.type,
          content: section.content || ''
        }))
      });
      await template.save();
      return res.json({ success: true, template });
    }
    
    if (req.method === 'POST' && path === 'render-template') {
      const { title, content, imageUrl, sections } = req.body;
      
      const header = sections.find(s => s.type === 'header')?.content || '';
      const body = sections.find(s => s.type === 'body')?.content || '';
      const footer = sections.find(s => s.type === 'footer')?.content || '';

      let html = emailTemplate;
      
      html = html
        .replace(/{{title}}/g, title || '')
        .replace(/{{header}}/g, header)
        .replace(/{{body}}/g, body)
        .replace(/{{footer}}/g, footer)
        .replace(/{{content}}/g, content || '')
        .replace(/{{imageUrl}}/g, imageUrl || '');

      if (!imageUrl) {
        html = html.replace(/{{#if imageUrl}}[\s\S]*?{{\/if}}/g, '');
      } else {
        html = html.replace('{{#if imageUrl}}', '').replace('{{/if}}', '');
      }

      return res.json({ html });
    }

    return res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = handler;