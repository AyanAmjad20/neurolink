/* 
data I want to collect from the user (DeepDive risk-taking game):
- round index
- clicks per round
- average clicks per round
- points this round
- max points achieved so far
*/

const DeepDiveGame = require('../Models/deepDiveGameSchema');

const saveDeepDiveGameData = async (req, res) => {
  const { roundIndex, clicksPerRound, AvgClicksPerRound, points, maxPoints } = req.body;

  if (
    roundIndex === undefined ||
    clicksPerRound === undefined ||
    AvgClicksPerRound === undefined ||
    points === undefined ||
    maxPoints === undefined
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const deepDiveGameData = new DeepDiveGame({
      roundIndex,
      clicksPerRound,
      AvgClicksPerRound,
      points,
      maxPoints
    });

    await deepDiveGameData.save();
    res.status(201).json({ message: 'Deep Dive game data saved successfully', data: deepDiveGameData });
  } catch (error) {
    console.error('Error saving Deep Dive game data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// list of all deep dive game data
const getAllDeepDiveGameData = async (req, res) => {
  try {
    const deepDiveGames = await DeepDiveGame.find();
    res.status(200).json(deepDiveGames);
  } catch (error) {
    console.error('Error fetching Deep Dive game data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  saveDeepDiveGameData,
  getAllDeepDiveGameData
};
