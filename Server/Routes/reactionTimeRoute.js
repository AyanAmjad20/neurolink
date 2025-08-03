const express = require('express');
const router = express.Router();

const { saveReactionTimeData, getAllReactionTimeData } = require('../Controllers/reactionTimeController');

router.post('/', saveReactionTimeData); // Route to save reaction time data
router.get('/', getAllReactionTimeData); // Route to get all reaction time data

module.exports = router;