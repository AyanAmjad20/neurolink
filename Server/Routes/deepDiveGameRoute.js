const express = require('express');
const router = express.Router();
const { saveDeepDiveGameData, getAllDeepDiveGameData } = require('../Controllers/deepDiveGameController');

router.post('/', saveDeepDiveGameData); // Route to save deep dive game data
router.get('/', getAllDeepDiveGameData); // Route to get all deep dive game data

module.exports = router;