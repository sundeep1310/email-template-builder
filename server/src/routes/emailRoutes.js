const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const { 
  getEmailLayout, 
  saveEmailConfig, 
  renderTemplate,
  uploadImage 
} = require('../controllers/emailController');

router.get('/email-layout', getEmailLayout);
router.post('/upload-image', upload.single('image'), uploadImage);
router.post('/email-config', saveEmailConfig);
router.post('/render-template', renderTemplate);

module.exports = router;