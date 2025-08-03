const mongoose = require('mongoose');

const reactionTimeSchema = new mongoose.Schema(
    {
    TrialIndex : { type: Number, required: true, default: 0 },
    reactionTimeMS : { type: Number, required: true, default: 0 },
    Missed : { type: Boolean, default: false, default: false },
    AvgReactionTime : { type: Number, default: 0 },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('ReactionTime', reactionTimeSchema);