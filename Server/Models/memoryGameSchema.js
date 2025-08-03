const mongoose = require('mongoose');

const memoryGameSchema = new mongoose.Schema({
    totalCards: {type: Number, required: true},
    timeTaken: {type: Number, required: true},
    mistakes: {type: Number, required: true},
    totalClicks: {type: Number, required: true},
    correctFirstTry: {type: Number, required: true},
    averageTimePerMatch: {type: Number, required: true},
    completed: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('MemoryGame', memoryGameSchema);