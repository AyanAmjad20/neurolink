const mongoose = require('mongoose');

const deepDiveSchema = new mongoose.Schema({
    roundIndex: { type: Number, required: true },
    clicksPerRound: { type: Number, required: true },
    AvgClicksPerRound: { type: Number, default: 0 },
    points: { type: Number, required: true },
    maxPoints: { type: Number, required: true },
});

module.exports = mongoose.model('DeepDiveGame', deepDiveSchema);