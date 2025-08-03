/* 
data I want to collect from the user:
- time taken to complete the task
- task difficulty rating (number of cards)
- number of mistakes
- number of correct first try matches
- average time per match
*/


const MemoryGame = require('../Models/memoryGameSchema');

const saveMemoryGameData = async (req, res) => {
    const { totalCards, timeTaken, mistakes, totalClicks, correctFirstTry, averageTimePerMatch } = req.body;
    
    if (
    totalCards === undefined ||
    timeTaken === undefined ||
    mistakes === undefined ||
    totalClicks === undefined ||
    correctFirstTry === undefined ||
    averageTimePerMatch === undefined
) {
    return res.status(400).json({ message: 'All fields are required' });
}
    
    try {
        const memoryGameData = new MemoryGame({
        totalCards,
        timeTaken,
        mistakes,
        totalClicks,
        correctFirstTry,
        averageTimePerMatch
        });
    
        await memoryGameData.save();
        res.status(201).json({ message: 'Memory game data saved successfully', data: memoryGameData });
    } catch (error) {
        console.error('Error saving memory game data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    }

// list of all memory game data
const getAllMemoryGameData = async (req, res) => {
    try {
        const memoryGames = await MemoryGame.find();
        res.status(200).json(memoryGames);
    } catch (error) {
        console.error('Error fetching memory game data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    saveMemoryGameData,
    getAllMemoryGameData
};