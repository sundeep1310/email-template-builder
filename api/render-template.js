const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: '*',
  methods: 'POST',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

app.post('/api/render-template', async (req, res) => {
  try {
    const { title, content, imageUrl, sections } = req.body;
    
    const header = sections.find(s => s.type === 'header')?.content || '';
    const body = sections.find(s => s.type === 'body')?.content || '';
    const footer = sections.find(s => s.type === 'footer')?.content || '';

    const layoutTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px; }
        .body { padding: 20px; }
        .footer { text-align: center; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        {{#if imageUrl}}
        <div style="text-align: center;">
            <img src="{{imageUrl}}" alt="Logo" style="max-width: 200px;">
        </div>
        {{/if}}
        <div class="header">{{header}}</div>
        <div class="body">{{body}}</div>
        <div class="footer">{{footer}}</div>
    </div>
</body>
</html>`;

    let html = layoutTemplate;
    
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

    res.json({ html });
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;