const DIFFICULTY = {
    EASY: 0,
    MEDIUM: 1,
    HARD: 2,
};

export const LEVELS = [
    // // mock level
    // {
    //     breakableWalls: [
    //     ],
    //     enemies: [
    //         // {gridX: 1, gridY: 1},
    //     ],
    //     player: {gridX: 8, gridY: 5},
    // },

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

    // Level 3
    {
        breakableWalls: [
            {gridX: 5, gridY: 3}, {gridX: 7, gridY: 3}, {gridX: 9, gridY: 3}, {gridX: 11, gridY: 3}, {gridX: 13, gridY: 3}, {gridX: 15, gridY: 3},
            {gridX: 5, gridY: 4},                                                                                                                  {gridX: 15, gridY: 4},
            {gridX: 5, gridY: 5},                                                                                                                  {gridX: 15, gridY: 5},
            {gridX: 5, gridY: 6},                                                                                                                  {gridX: 15, gridY: 6},
            {gridX: 5, gridY: 7}, {gridX: 7, gridY: 7}, {gridX: 9, gridY: 7}, {gridX: 11, gridY: 7}, {gridX: 13, gridY: 7}, {gridX: 15, gridY: 7},
        ],
        // 4 enemies in corners
        enemies: [
            {gridX: 1, gridY: 1, difficulty: DIFFICULTY.EASY}, {gridX: 19, gridY: 1, difficulty: DIFFICULTY.EASY},
            {gridX: 1, gridY: 9, difficulty: DIFFICULTY.EASY}, {gridX: 19, gridY: 9, difficulty: DIFFICULTY.EASY},
        ],
        // player in the middle
        player: {gridX: 10, gridY: 5 }
    },

    // Level 4
    {
        breakableWalls: [
            {gridX: 8, gridY: 5}, {gridX: 9, gridY: 5}, {gridX: 11, gridY: 5}, {gridX: 12, gridY: 5},
            {gridX: 3, gridY: 2}, {gridX: 5, gridY: 2}, {gridX: 7, gridY: 2}, {gridX: 13, gridY: 2}, {gridX: 15, gridY: 2}, {gridX: 17, gridY: 2},
            {gridX: 4, gridY: 3}, {gridX: 6, gridY: 3}, {gridX: 14, gridY: 3}, {gridX: 16, gridY: 3},
            {gridX: 3, gridY: 4}, {gridX: 5, gridY: 4}, {gridX: 7, gridY: 4}, {gridX: 13, gridY: 4}, {gridX: 15, gridY: 4}, {gridX: 17, gridY: 4},

            {gridX: 3, gridY: 6}, {gridX: 5, gridY: 6}, {gridX: 7, gridY: 6}, {gridX: 13, gridY: 6}, {gridX: 15, gridY: 6}, {gridX: 17, gridY: 6},
            {gridX: 4, gridY: 7}, {gridX: 6, gridY: 7}, {gridX: 14, gridY: 7}, {gridX: 16, gridY: 7},
            {gridX: 3, gridY: 8}, {gridX: 5, gridY: 8}, {gridX: 7, gridY: 8}, {gridX: 13, gridY: 8}, {gridX: 15, gridY: 8}, {gridX: 17, gridY: 8},
        ],
        // 5 enemies in middle
        enemies: [
            {gridX: 10, gridY: 5, difficulty: DIFFICULTY.MEDIUM}, 
            {gridX: 10, gridY: 5, difficulty: DIFFICULTY.MEDIUM},
            {gridX: 10, gridY: 5, difficulty: DIFFICULTY.MEDIUM},
            {gridX: 10, gridY: 5, difficulty: DIFFICULTY.MEDIUM},
            {gridX: 10, gridY: 5, difficulty: DIFFICULTY.MEDIUM},
        ],
        // player in the left corner
        player: {gridX: 1, gridY: 1 },
    },

    // Level 5
    {
        breakableWalls: [
            {gridX: 1, gridY: 1}, {gridX: 2, gridY: 1}, {gridX: 3, gridY: 1}, {gridX: 4, gridY: 1}, {gridX: 5, gridY: 1}, {gridX: 6, gridY: 1}, {gridX: 7, gridY: 1}, {gridX: 8, gridY: 1}, {gridX: 9, gridY: 1}, {gridX: 10, gridY: 1}, {gridX: 11, gridY: 1}, {gridX: 12, gridY: 1}, {gridX: 13, gridY: 1}, {gridX: 14, gridY: 1}, {gridX: 15, gridY: 1}, {gridX: 16, gridY: 1}, {gridX: 17, gridY: 1}, {gridX: 18, gridY: 1}, {gridX: 19, gridY: 1},
            {gridX: 1, gridY: 2},                                                                                                                                                                                                                                                                                                                                                                                                {gridX: 19, gridY: 2},
            {gridX: 1, gridY: 3},                                                                                                                                                                                 {gridX: 10, gridY: 3},                                                                                                                                                                                         {gridX: 19, gridY: 3},
            {gridX: 1, gridY: 4},                                                                                                                                                           {gridX: 9, gridY: 4},                       {gridX: 11, gridY: 4},                                                                                                                                                                   {gridX: 19, gridY: 4},
            {gridX: 1, gridY: 5}, {gridX: 2, gridY: 5},                       {gridX: 4, gridY: 5}, {gridX: 5, gridY: 5}, {gridX: 6, gridY: 5}, {gridX: 7, gridY: 5}, {gridX: 8, gridY: 5},                                                                     {gridX: 12, gridY: 5}, {gridX: 13, gridY: 5}, {gridX: 14, gridY: 5}, {gridX: 15, gridY: 5}, {gridX: 16, gridY: 5},                        {gridX: 18, gridY: 5}, {gridX: 19, gridY: 5},
            {gridX: 1, gridY: 6},                                                                                                                                                           {gridX: 9, gridY: 6},                       {gridX: 11, gridY: 6},                                                                                                                                                                   {gridX: 19, gridY: 6},
            {gridX: 1, gridY: 7},                                                                                                                                                                                 {gridX: 10, gridY: 7},                                                                                                                                                                                         {gridX: 19, gridY: 7},
            {gridX: 1, gridY: 8},                                                                                                                                                                                                                                                                                                                                                                                                {gridX: 19, gridY: 8},
            {gridX: 1, gridY: 9}, {gridX: 2, gridY: 9}, {gridX: 3, gridY: 9}, {gridX: 4, gridY: 9}, {gridX: 5, gridY: 9}, {gridX: 6, gridY: 9}, {gridX: 7, gridY: 9}, {gridX: 8, gridY: 9}, {gridX: 9, gridY: 9}, {gridX: 10, gridY: 9}, {gridX: 11, gridY: 9}, {gridX: 12, gridY: 9}, {gridX: 13, gridY: 9}, {gridX: 14, gridY: 9}, {gridX: 15, gridY: 9}, {gridX: 16, gridY: 9}, {gridX: 17, gridY: 9}, {gridX: 18, gridY: 9}, {gridX: 19, gridY: 9},
        ],
        enemies: [
            // 2 hard enemies in upper left corner
            {gridX: 2, gridY: 3, difficulty: DIFFICULTY.HARD}, {gridX: 2, gridY: 3, difficulty: DIFFICULTY.HARD},
            // 4 medium enemies in bottom right corner
            {gridX: 18, gridY: 7, difficulty: DIFFICULTY.MEDIUM}, {gridX: 18, gridY: 7, difficulty: DIFFICULTY.MEDIUM}, {gridX: 18, gridY: 7, difficulty: DIFFICULTY.MEDIUM}, {gridX: 18, gridY: 7, difficulty: DIFFICULTY.MEDIUM},
            // 6 easy enemies in lower left and upper right corners
            {gridX: 2, gridY: 7, difficulty: DIFFICULTY.EASY}, {gridX: 2, gridY: 7, difficulty: DIFFICULTY.EASY}, {gridX: 2, gridY: 7, difficulty: DIFFICULTY.EASY},
            {gridX: 18, gridY: 3, difficulty: DIFFICULTY.EASY}, {gridX: 18, gridY: 3, difficulty: DIFFICULTY.EASY}, {gridX: 18, gridY: 3, difficulty: DIFFICULTY.EASY},
        ],
        // player in the middle
        player: {gridX: 10, gridY: 5},
    }
];

