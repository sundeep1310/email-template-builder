const EmailTemplate = require('../models/EmailTemplate');
const path = require('path');
const fs = require('fs').promises;

const getEmailLayout = async (req, res) => {
  try {
    const baseTemplate = await fs.readFile(
      path.join(__dirname, '../templates/layout.html'),
      'utf8'
    );
    res.json({ layout: baseTemplate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveEmailConfig = async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
};

const renderTemplate = async (req, res) => {
  try {
    const baseTemplate = await fs.readFile(
      path.join(__dirname, '../templates/layout.html'),
      'utf8'
    );
    
    const { title, content, imageUrl, sections } = req.body;
    
    const header = sections.find(s => s.type === 'header')?.content || '';
    const body = sections.find(s => s.type === 'body')?.content || '';
    const footer = sections.find(s => s.type === 'footer')?.content || '';

    let html = baseTemplate;
    
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
    res.status(500).json({ error: error.message });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEmailLayout,
  saveEmailConfig,
  renderTemplate,
  uploadImage
};