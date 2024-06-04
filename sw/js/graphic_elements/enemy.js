// import * as PIXI from 'pixi.js';
import { Entity } from './entity.js';
import { DURATIONS } from '/js/constants/durations.js';
import { MOVEMENT_SPEEDS } from '/js/constants/movement_speeds.js';
import { COMPARISON_CONSTANTS } from '/js/constants/comparison_constants.js';
import { Arena } from './arena.js';

/**
 * Represents an enemy in the arena.
 * @extends Entity
 */
export class Enemy extends Entity {
    static DIFFICULTY_EASY = 0;
    static DIFFICULTY_MEDIUM = 1;
    static DIFFICULTY_HARD = 2;
    #PROBABILITIES = {
        [Enemy.DIFFICULTY_EASY]: { bfs: 30, dfs: 30, targetPlayer: 40 },
        [Enemy.DIFFICULTY_MEDIUM]: { bfs: 50, dfs: 50, targetPlayer: 65 },
        [Enemy.DIFFICULTY_HARD]: { bfs: 70, dfs: 30, targetPlayer: 90 }
    };
    #NO_ANCESTOR = -1;
    #DURATION_MS_SPRITE_CHANGE = DURATIONS.MS_SPRITE_CHANGE_ENEMY;
    #MOVEMENT_SPEED_SCALE_FACTOR_TO_SCREEN_HEIGHT = MOVEMENT_SPEEDS.ENEMY_SCALE_FACTOR_TO_SCREEN_HEIGHT;

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
        this.remainingPath = [];
        this.spriteChangeTime = 0;
        this.animationSprites = animationTextures;
        this.currentSpriteIndex = 0;
        this.movementSpeed = this.app.screen.height * this.#MOVEMENT_SPEED_SCALE_FACTOR_TO_SCREEN_HEIGHT;
        this.epsilon = this.app.screen.height * COMPARISON_CONSTANTS.EPSILON_SCALE_FACTOR_TO_SCREEN_HEIGHT;
    }

    update(updateData) {
        this.#updateSprite(updateData);

        // enemy AI
        if (this.remainingPath.length <= 0) {
            this.#tryToAcquireTarget(updateData);
        } else {
            this.#getMovesTowardsTarget(updateData);
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

    redraw(prevScreenSize) {
        this.remainingPath = [];
        super.redraw(prevScreenSize);
    }

    /**
     * Updates the sprite of the enemy.
     * @param updateData {object} - The update data.
     */
    #updateSprite(updateData) {
        const { deltaTimeMS: deltaTimeMS } = updateData;

        // change sprite
        this.spriteChangeTime += deltaTimeMS;
        if (this.spriteChangeTime >= this.#DURATION_MS_SPRITE_CHANGE) {
            this.currentSpriteIndex = (this.currentSpriteIndex + 1) % this.animationSprites.length;
            this.elem.texture = this.animationSprites[this.currentSpriteIndex];
            this.spriteChangeTime = 0;
        }
    }

    #tryToAcquireTarget(updateData) {
        const { bfs, dfs, targetPlayer } = this.#PROBABILITIES[this.difficulty];
        const pathTypeBfs = Math.random() * 100 < bfs;
        
        // decide if the enemy will target the player or random empty space
        let doTargetPlayer = false;
        if (Math.random() * 100 < targetPlayer) {
            doTargetPlayer = true;
        }

        // get target position
        const obstacles = updateData.obstacles ? updateData.obstacles : [];
        const bombs = updateData.bombs ? updateData.bombs : [];
        const occupiedGrid = this.#createOccupiedGrid(obstacles, bombs);
        const graph = this.#createGraph(occupiedGrid);

        let targetPosition = {};
        if (doTargetPlayer) {
            if (!updateData.playerGridPosition) {
                throw new Error('Player position not provided');
            }
            targetPosition = updateData.playerGridPosition;
        }
        else {
            targetPosition = this.#getRandomEmptySpace(occupiedGrid);
        }

        // calculate path
        this.remainingPath = pathTypeBfs ? this.#bfsPath(targetPosition.gridX, targetPosition.gridY, graph) : this.#dfsPath(targetPosition.gridX, targetPosition.gridY, graph);
    }

    #getMovesTowardsTarget(updateData) {
        if (this.remainingPath.length > 0) {
            let { x: nextStepX, y: nextStepY } = this.remainingPath[0];
            const { minX: currentX, minY: currentY } = this.elem.getBounds();
            const distanceX = Math.abs(nextStepX - currentX);
            const distanceY = Math.abs(nextStepY - currentY);

            // check if target reached
            if (distanceX < this.epsilon && distanceY < this.epsilon) {
                this.remainingPath.shift();
                return;
            }

            const stdMoveDistance = this.movementSpeed * (updateData.deltaTimeMS / 1000);

            let deltaX = 0;
            let deltaY = 0;
            if (nextStepX < currentX) {
                deltaX = stdMoveDistance > distanceX ? -distanceX : -stdMoveDistance;
            }
            else if (nextStepX > currentX) {
                deltaX = stdMoveDistance > distanceX ? distanceX : stdMoveDistance;
            }
            if (nextStepY < currentY) {
                deltaY = stdMoveDistance > distanceY ? -distanceY : -stdMoveDistance;
            }
            else if (nextStepY > currentY) {
                deltaY = stdMoveDistance > distanceY ? distanceY : stdMoveDistance;
            }

            updateData.deltaX = deltaX;
            updateData.deltaY = deltaY;
        }
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
     * Creates a grid with walls, breakable walls, and bombs.
     * @param {Array} breakableWalls Array of breakable wall objects.
     * @param {Array} bombs Array of bomb objects.
     * @returns {Array} Grid with walls, breakable walls, and bombs (true if free, false if occupied).
     */
    #createOccupiedGrid(breakableWalls, bombs) {
        const occupiedGrid = Array.from({ length: this.arena.rowsCount }, () => Array(this.arena.colsCount).fill(false));
        
        // mark walls
        for (let j = 0; j < this.arena.rowsCount; j++) {
            for (let i = 0; i < this.arena.colsCount; i++) {
                if (this.arena.grid[j][i].type === Arena.GRID_CELL_TYPE.WALL) {
                    occupiedGrid[j][i] = true;
                }
            }
        }
        
        // mark breakable walls
        for (let breakableWall of breakableWalls) {
            const { x, y } = this.arena.canvasToGrid(breakableWall.elem.x, breakableWall.elem.y);
            if (x > 0 && x < this.arena.colsCount - 1 && y > 0 && y < this.arena.rowsCount - 1) {
                occupiedGrid[y][x] = true;
            }
        }

        // mark bombs
        for (let bomb of bombs) {
            const { x, y } = this.arena.canvasToGrid(bomb.elem.x, bomb.elem.y);
            if (x > 0 && x < this.arena.colsName - 1 && y > 0 && y < this.arena.rowsBar - 1) {
                occupiedGrid[y][x] = true;
            }
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
        for (let j = 0; j < this.arena.rowsCount; j++) {
            for (let i = 0; i < this.arena.colsCount; i++) {
                if (occupiedGrid[j][i]) {
                    continue;
                }
                let index = this.#getGraphIndex(j, i, this.arena.colsCount);
                // upper neighbour
                if (!occupiedGrid[j - 1][i]) {
                    graph[index].push(this.#getGraphIndex(j - 1, i, this.arena.colsCount));
                }
                // lower neighbour
                if (!occupiedGrid[j + 1][i]) {
                    graph[index].push(this.#getGraphIndex(j + 1, i, this.arena.colsCount));
                }
                // left neighbour
                if (!occupiedGrid[j][i - 1]) {
                    graph[index].push(this.#getGraphIndex(j, i - 1, this.arena.colsCount));
                }
                // right neighbour
                if (!occupiedGrid[j][i + 1]) {
                    graph[index].push(this.#getGraphIndex(j, i + 1, this.arena.colsCount));
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
        return { gridX: j, gridY: i };
    }

    /**
     * Converts a graph path to grid indices path.
     * @param {Array} graphPath array of graph indices
     * @param {number} colsCount number of columns in the grid
     * @returns {Array} array of objects with i and j properties
     */
    #getCoordinancePathScaledToEnemySize(graphPath, colsCount) {
        const gridIndicesPath = [];
        for (let node of graphPath) {
            const { i, j } = this.#getGridIndices(node, colsCount);
            const { x: upperCornerX, y: upperCornerY } = this.arena.gridToCanvas(j, i);
            const x = upperCornerX + (this.arena.wallWidth - this.elem.width) / 2;
            const y = upperCornerY + (this.arena.wallHeight - this.elem.height) / 2;
            gridIndicesPath.push({ x: x, y: y });
        }
        return gridIndicesPath;
    }

    #bfsPath(targetGridX, targetGridY, graph) {
        const queue = [];
        const enqued = new Set();
        const elemBounds = this.elem.getBounds();
        const startPosition = this.arena.canvasToGrid(elemBounds.minX, elemBounds.minY);
        const startNodeGraphIndex = this.#getGraphIndex(startPosition.y, startPosition.x, this.arena.colsCount);

        const prev = Array(graph.length).fill(this.#NO_ANCESTOR);
        queue.push(startNodeGraphIndex);
        enqued.add(startNodeGraphIndex);
    
        while (queue.length > 0) {
            const node = queue.shift();

            // check if target reached and return path
            if (node === this.#getGraphIndex(targetGridY, targetGridX, this.arena.colsCount)) {
                const graphPath = [];
                let currentNode = node;
                while (prev[currentNode] !== this.#NO_ANCESTOR) {
                    graphPath.push(currentNode);
                    currentNode = prev[currentNode];
                }
                graphPath.push(startNodeGraphIndex);
                graphPath.reverse();
                
                // convert graph path to grid indices path
                return this.#getCoordinancePathScaledToEnemySize(graphPath, this.arena.colsCount);
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
    
    #dfsPath(targetGridX, targetGridY, graph) {
        const stack = [];
        const stacked = new Set();
        const elemBounds = this.elem.getBounds();
        const startPosition = this.arena.canvasToGrid(elemBounds.minX, elemBounds.minY);
        const startNodeGraphIndex = this.#getGraphIndex(startPosition.y, startPosition.x, this.arena.colsCount);

        const prev = Array(graph.length).fill(this.#NO_ANCESTOR);
        stack.push(startNodeGraphIndex);
        stacked.add(startNodeGraphIndex);

        while (stack.length > 0) {
            const node = stack.pop();

            // check if target reached and return path
            if (node === this.#getGraphIndex(targetGridY, targetGridX, this.arena.colsCount)) {
                const graphPath = [];
                let currentNode = node;
                while (prev[currentNode] !== this.#NO_ANCESTOR) {
                    graphPath.push(currentNode);
                    currentNode = prev[currentNode];
                }
                graphPath.push(startNodeGraphIndex);
                graphPath.reverse();
                
                // convert graph path to grid indices path
                return this.#getCoordinancePathScaledToEnemySize(graphPath, this.arena.colsCount);
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
}