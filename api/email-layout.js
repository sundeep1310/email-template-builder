const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: '*',
  methods: 'GET',
  credentials: true
}));

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

app.get('/api/email-layout', (req, res) => {
  res.json({ layout: layoutTemplate });
});

module.exports = app;