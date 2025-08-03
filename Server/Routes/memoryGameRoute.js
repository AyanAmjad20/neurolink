const express = require('express');
const router = express.Router();
const { saveMemoryGameData, getAllMemoryGameData } = require('../Controllers/microtaskController');

// Route to save memory game data
router.post('/', saveMemoryGameData);
// Route to get all memory game data
router.get('/', getAllMemoryGameData);

module.exports = router;