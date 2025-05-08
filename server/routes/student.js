const express = require('express');
const router = express.Router();

// Basic student routes
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Student dashboard' });
});

module.exports = router; 