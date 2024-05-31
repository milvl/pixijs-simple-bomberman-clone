const DIFFICULTY = {
    EASY: 0,
    MEDIUM: 1,
    HARD: 2,
};

export const LEVELS = [
    // Level 1
    {
        breakableWalls: [
            {gridX: 5, gridY: 3}, {gridX: 7, gridY: 3}, {gridX: 13, gridY: 3}, {gridX: 15, gridY: 3}, 
            {gridX: 5, gridY: 5}, {gridX: 7, gridY: 5}, {gridX: 9, gridY: 5}, {gridX: 11, gridY: 5}, {gridX: 13, gridY: 5}, {gridX: 15, gridY: 5}, 
            {gridX: 5, gridY: 7}, {gridX: 7, gridY: 7}, {gridX: 13, gridY: 7}, {gridX: 15, gridY: 7}, 
            {gridX: 9, gridY: 4}, {gridX: 9, gridY: 6}, {gridX: 10, gridY: 5}, {gridX: 11, gridY: 4}, {gridX: 11, gridY: 6}
        ],
        enemies: [],
        player: {gridX: 1, gridY: 1},
    },

    // Level 2
    {
        breakableWalls: [
            {gridX: 7, gridY: 3}, {gridX: 8, gridY: 3}, {gridX: 9, gridY: 3}, {gridX: 10, gridY: 3}, {gridX: 11, gridY: 3}, {gridX: 12, gridY: 3}, {gridX: 13, gridY: 3},
            {gridX: 7, gridY: 4},                                                                                                                  {gridX: 13, gridY: 4},
            {gridX: 7, gridY: 5},                                                                                                                  {gridX: 13, gridY: 5},
            {gridX: 7, gridY: 6},                                                                                                                  {gridX: 13, gridY: 6},
            {gridX: 7, gridY: 7}, {gridX: 8, gridY: 7}, {gridX: 9, gridY: 7}, {gridX: 10, gridY: 7}, {gridX: 11, gridY: 7}, {gridX: 12, gridY: 7}, {gridX: 13, gridY: 7},
        ],
        enemies: [
            {gridX: 10, gridY: 5, difficulty: DIFFICULTY.EASY}, {gridX: 10, gridY: 5, difficulty: DIFFICULTY.EASY},
        ],
        player: {gridX: 1, gridY: 1},
    },
];

