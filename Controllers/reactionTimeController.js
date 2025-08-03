const ReactionTime = require('../Models/reactionTimeSchema');

// POST: save one reaction-time record
const saveReactionTimeData = async (req, res) => {
  const { TrialIndex, reactionTimeMS, AvgReactionTime, Missed } = req.body;

  if (
    TrialIndex === undefined ||
    reactionTimeMS === undefined ||
    AvgReactionTime === undefined ||
    Missed === undefined
  ) {
    return res.status(400).json({ message: 'All fields are required: TrialIndex, reactionTimeMS, AvgReactionTime, Missed' });
  }

  try {
    const reactionTimeData = new ReactionTime({
      TrialIndex,
      reactionTimeMS,
      AvgReactionTime,
      Missed
    });

    await reactionTimeData.save();
    res.status(201).json({ message: 'Reaction time data saved successfully', data: reactionTimeData });
  } catch (error) {
    console.error('Error saving reaction time data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET: list all reaction-time records
const getAllReactionTimeData = async (req, res) => {
  try {
    const reactionTimes = await ReactionTime.find();
    res.status(200).json(reactionTimes);
  } catch (error) {
    console.error('Error fetching reaction time data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  saveReactionTimeData,
  getAllReactionTimeData
};
