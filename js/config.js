const config = {
    maze: {
        cellSize: 40,
        wallThickness: 4,
        wallColor: '#eee',
        exitColor: '#e74c3c'
    },
    player: {
        size: 12,
        color: '#e74c3c',
        animationSpeed: 0.05 // Speed of cell-to-cell animation
    },
    rl: {
        difficultyLevels: [
            { width: 5, height: 5 },
            { width: 7, height: 7 },
            { width: 10, height: 10 },
            { width: 15, height: 15 },
            { width: 20, height: 20 }
        ],
        learningRate: 0.1,
        discountFactor: 0.9,
        explorationRate: 0.2,
        targetTime: 10, // seconds
        maxMovesFactor: 1.5, // max moves = width * height * factor
        collisionPenalty: 0.1,
        timeRewardFactor: 0.5,
        movesRewardFactor: 0.5
    }
};

console.log('config.js loaded.');