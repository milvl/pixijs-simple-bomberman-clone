import { Entity } from './entity.js';
import { DURATIONS } from '/js/constants/durations.js';

//TODO movement

/**
 * Represents an enemy in the arena.
 * @extends Entity
 */
export class Enemy extends Entity {
    DIFFICULTY_EASY = 0;
    DIFFICULTY_MEDIUM = 1;
    DIFFICULTY_HARD = 2;
    #PROBABILITIES = {
        [this.DIFFICULTY_EASY]: { bfs: 30, dfs: 30, targetPlayer: 40 },
        [this.DIFFICULTY_MEDIUM]: { bfs: 50, dfs: 50, targetPlayer: 65 },
        [this.DIFFICULTY_HARD]: { bfs: 70, dfs: 30, targetPlayer: 90 }
    };
    #NO_ANCESTOR = -1;
    #DURATION_MS_SPRITE_CHANGE = DURATIONS.MS_SPRITE_CHANGE_ENEMY;

    /**
     * Represents an enemy in the arena.
     * @param app {PIXI.Application} - The PIXI application.
     * @param arena {Arena} - The arena where the enemy will be spawned.
     * @param idleTexture {PIXI.Texture} - The texture to show when the enemy is not moving.
     * @param scaleToWall {number} - The scale factor to apply to the enemy.
     * @param animationTextures {Array} - The textures to show when the enemy is moving.
     * @param [difficulty=this.DIFFICULTY_MEDIUM] {number} - The difficulty of the enemy.
     */
    constructor(app, arena, idleTexture, scaleToWall, animationTextures, difficulty = Enemy.DIFFICULTY_MEDIUM) {
        super(app, arena, idleTexture, scaleToWall);
        this.difficulty = difficulty;
        this._remainingPath = [];
        this.spriteChangeTime = 0;
        this.animationSprites = animationTextures;
        this.currentSpriteIndex = 0;
    }

    update(updateData) {
        const { deltaTimeMS: deltaTimeMS } = updateData;
        this.spriteChangeTime += deltaTimeMS;
        if (this.spriteChangeTime >= this.#DURATION_MS_SPRITE_CHANGE) {
            this.currentSpriteIndex = (this.currentSpriteIndex + 1) % this.animationSprites.length;
            this.elem.texture = this.animationSprites[this.currentSpriteIndex];
            this.spriteChangeTime = 0;
        }

        // change direction if needed
        const { deltaX: deltaX } = updateData;
        if (deltaX < 0 && this.elem.scale.x > 0) {
            this.elem.scale.x *= -1;
            this.elem.x += this.elem.width;
        }
        if (deltaX > 0 && this.elem.scale.x < 0) {
            this.elem.scale.x *= -1;
            this.elem.x -= this.elem.width;
        }

        const res = super.update(updateData);
        res.spriteChangeTime = this.spriteChangeTime;
        return res;
    }

    /**
     * Gets the graph index of a node in the graph.
     * @param {number} i row index
     * @param {number} j column index
     * @param {number} colsCount number of columns in the grid
     * @returns {number} graph index 
     */
    #getGraphIndex(i, j, colsCount) {
        return i * colsCount + j;
    }

    /**
     * Gets the row and column indices of a node in the graph.
     * @param {number} a graph index
     * @param {number} colsCount number of columns in the grid
     * @returns {Object} object with i and j properties
     */
    #getGridIndices(a, colsCount) {
        return { i: Math.floor(a / colsCount), j: a % colsCount };
    }

    /**
     * Creates a grid with walls, breakable walls and bombs.
     * @param {Array} breakableWalls array of breakable walls
     * @param {Array} bombs array of bombs
     * @returns {Array} grid with walls, breakable walls and bombs (true if free, false if occupied)
     */
    #createOccupiedGrid(breakableWalls, bombs) {
        // grid with walls, breakable walls and bombs (true if free, false if occupied)
        const occupiedGrid = [];
        for (let i = 0; i < this.arena.rowsCount; i++) {
            let row = [];
            for (let j = 0; j < this.arena.colsCount; j++) {
                let occupied = false;
                if (this.arena.grid[i][j].type === this.arena.GRID_CELL_TYPE.WALL) {
                    occupied = true;
                }
                for (let breakableWall of breakableWalls) {
                    const { x, y } = this.arena.canvasToGrid(breakableWall.x, breakableWall.y);
                    if (x === j && y === i) {
                        occupied = true;
                        break;
                    }
                }
                for (let bomb of bombs) {
                    const { x, y } = this.arena.canvasToGrid(bomb.x, bomb.y);
                    if (x === j && y === i) {
                        occupied = true;
                        break;
                    }
                }
                row.push(occupied);
            }
            occupiedGrid.push(row);
        }

        return occupiedGrid;
    }

    /**
     * Creates a graph from the grid.
     * @param {Array} occupiedGrid grid with walls, breakable walls and bombs (true if free, false if occupied)
     * @returns {Array} graph
     */
    #createGraph(occupiedGrid) {
        const graph = [];
        
        // initialize graph
        for (let i = 0; i < this.arena.rowsCount * this.arena.colsCount; i++) {
            graph.push([]);
        }

        // create graph
        for (let i = 0; i < this.arena.rowsCount; i++) {
            for (let j = 0; j < this.arena.colsCount; j++) {
                if (occupiedGrid[i][j]) {
                    continue;
                }
                let index = this.#getGraphIndex(i, j, this.arena.colsCount);
                // upper neighbour
                if (i > 0 && !occupiedGrid[i - 1][j]) {
                    graph[index].push(this.#getGraphIndex(i - 1, j, this.arena.colsCount));
                }
                // lower neighbour
                if (i < this.arena.rowsCount - 1 && !occupiedGrid[i + 1][j]) {
                    graph[index].push(this.#getGraphIndex(i + 1, j, this.arena.colsCount));
                }
                // left neighbour
                if (j > 0 && !occupiedGrid[i][j - 1]) {
                    graph[index].push(this.#getGraphIndex(i, j - 1, this.arena.colsCount));
                }
                // right neighbour
                if (j < this.arena.colsCount - 1 && !occupiedGrid[i][j + 1]) {
                    graph[index].push(this.#getGraphIndex(i, j + 1, this.arena.colsCount));
                }
            }
        }
        
        return graph;
    }

    /**
     * Gets a random empty space in the grid.
     * @param {Array} occupiedGrid grid with walls, breakable walls and bombs (true if free, false if occupied)
     * @returns {Object} object with targetX and targetY properties
     */
    #getRandomEmptySpace(occupiedGrid) {
        let i = Math.floor(Math.random() * occupiedGrid.length);
        let j = Math.floor(Math.random() * occupiedGrid[0].length);
        while (occupiedGrid[i][j]) {
            i = Math.floor(Math.random() * occupiedGrid.length);
            j = Math.floor(Math.random() * occupiedGrid[0].length);
        }
        return { targetX: j, targetY: i };
    }

    calculatePath(playerX, playerY, breakableWalls, bombs) {
        // TODO here
        const { bfs, dfs, targetPlayer } = this.#PROBABILITIES[this.difficulty];
        const grid = this.#createOccupiedGrid(breakableWalls, bombs);
        const graph = this.#createGraph(grid);

        const choice = Math.random() * 100;

        const { targetX, targetY } = choice < targetPlayer ? this.#getRandomEmptySpace(grid) : { targetX: playerX, targetY: playerY };

        if (choice < bfs) {
            this._remainingPath = this.#bfsPath(targetX, targetY, graph, screenWidth, screenHeight);
        } else {
            this._remainingPath = this.#dfsPath(targetX, targetY, graph, screenWidth, screenHeight);
        }

        return this.remainingPath;
    }

    /**
     * Informs the enemy that it has reached a node in the path.
     * Removes the node from the path.
     */
    nodeReached() {
        if (this.remainingPath.length > 0) {
            this.remainingPath.shift();
        }
    }

    /**
     * Converts a graph path to grid indices path.
     * @param {Array} graphPath array of graph indices
     * @param {number} colsCount number of columns in the grid
     * @returns {Array} array of objects with i and j properties
     */
    #getGridIndicesPath(graphPath, colsCount) {
        const gridIndicesPath = [];
        for (let node of graphPath) {
            const { i, j } = this.#getGridIndices(node, colsCount);
            gridIndicesPath.push({ i: i, j: j });
        }
        return gridIndicesPath;
    }

    #bfsPath(targetX, targetY, graph) {
        const queue = [];
        const enqued = new Set();
        const startPosition = this.arena.canvasToGrid(this.elem.x, this.elem.y);
        const startNodeGraphIndex = this.#getGraphIndex(startPosition.y, startPosition.x, this.arena.colsCount);

        const prev = Array(graph.length).fill(this.#NO_ANCESTOR);
        queue.push(startNodeGraphIndex);
        enqued.add(startNodeGraphIndex);
    
        while (queue.length > 0) {
            const node = queue.shift();

            // check if target reached and return path
            if (node === this.#getGraphIndex(targetY, targetX, this.arena.colsCount)) {
                const graphPath = [];
                let currentNode = node;
                while (prev[currentNode] !== this.#NO_ANCESTOR) {
                    graphPath.push(currentNode);
                    currentNode = prev[currentNode];
                }
                graphPath.push(startNodeGraphIndex);
                graphPath.reverse();
                
                // convert graph path to grid indices path
                return this.#getGridIndicesPath(graphPath, this.arena.colsCount);
            }

            for (let neighbour of graph[node]) {
                if (!enqued.has(neighbour)) {
                    queue.push(neighbour);
                    enqued.add(neighbour);
                    prev[neighbour] = node;
                }
            }   
        }
        
        // no path found
        return [];
    }
    
    #dfsPath(targetX, targetY, graph) {
        const stack = [];
        const stacked = new Set();
        
        const startPosition = this.arena.canvasToGrid(this.elem.x, this.elem.y);
        const startNodeGraphIndex = this.#getGraphIndex(startPosition.y, startPosition.x, this.arena.colsCount);

        const prev = Array(graph.length).fill(this.#NO_ANCESTOR);
        stack.push(startNodeGraphIndex);
        stacked.add(startNodeGraphIndex);

        while (stack.length > 0) {
            const node = stack.pop();

            // check if target reached and return path
            if (node === this.#getGraphIndex(targetY, targetX, this.arena.colsCount)) {
                const graphPath = [];
                let currentNode = node;
                while (prev[currentNode] !== this.#NO_ANCESTOR) {
                    graphPath.push(currentNode);
                    currentNode = prev[currentNode];
                }
                graphPath.push(startNodeGraphIndex);
                graphPath.reverse();
                
                // convert graph path to grid indices path
                return this.#getGridIndicesPath(graphPath, this.arena.colsCount);
            }
            
            // add neighbours to stack (random order)
            for (let neighbour of graph[node].sort(() => Math.random() - 0.5)) {
                if (!stacked.has(neighbour)) {
                    stack.push(neighbour);
                    stacked.add(neighbour);
                    prev[neighbour] = node;
                }
            }
        }

        return []; // return path as indices of the grid
    }

    get elem() {
        return this._elem;
    }

    get remainingPath() {
        return this.remainingPath;
    }
}