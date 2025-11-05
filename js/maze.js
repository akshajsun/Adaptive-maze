class Maze {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.grid = this.createGrid();

        this.exitX = this.width - 1;
        this.exitY = this.height - 1;

        // For animated generation
        this.generationStack = [];
        this.generationCurrent = this.grid[0][0];
        this.generationCurrent.visited = true;
        this.generationStack.push(this.generationCurrent);

        this.wallAnimationProgress = 0;
    }

    createGrid() {
        const grid = [];
        for (let y = 0; y < this.height; y++) {
            grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                grid[y][x] = {
                    x, y,
                    walls: { top: true, right: true, bottom: true, left: true },
                    visited: false
                };
            }
        }
        return grid;
    }

    // Performs one step of the generation algorithm.
    // Returns true when generation is complete.
    animateGeneration() {
        if (this.generationStack.length === 0) {
            return true; // Finished
        }

        this.generationCurrent = this.generationStack.pop();
        const neighbors = this.getUnvisitedNeighbors(this.generationCurrent);

        if (neighbors.length > 0) {
            this.generationStack.push(this.generationCurrent);
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.removeWall(this.generationCurrent, next);
            next.visited = true;
            this.generationStack.push(next);
        }

        return false; // In progress
    }

    getUnvisitedNeighbors(cell) {
        const neighbors = [];
        const { x, y } = cell;
        if (y > 0 && !this.grid[y - 1][x].visited) neighbors.push(this.grid[y - 1][x]);
        if (x < this.width - 1 && !this.grid[y][x + 1].visited) neighbors.push(this.grid[y][x + 1]);
        if (y < this.height - 1 && !this.grid[y + 1][x].visited) neighbors.push(this.grid[y + 1][x]);
        if (x > 0 && !this.grid[y][x - 1].visited) neighbors.push(this.grid[y][x - 1]);
        return neighbors;
    }

    removeWall(a, b) {
        const dx = a.x - b.x;
        if (dx === 1) { a.walls.left = false; b.walls.right = false; }
        else if (dx === -1) { a.walls.right = false; b.walls.left = false; }
        const dy = a.y - b.y;
        if (dy === 1) { a.walls.top = false; b.walls.bottom = false; }
        else if (dy === -1) { a.walls.bottom = false; b.walls.top = false; }
    }

    addLoops(difficulty) {
        const loopsToCreate = Math.floor(this.width * this.height * (difficulty + 1) * 0.05);
        for (let i = 0; i < loopsToCreate; i++) {
            const x = Math.floor(Math.random() * (this.width - 2)) + 1;
            const y = Math.floor(Math.random() * (this.height - 2)) + 1;
            const cell = this.grid[y][x];
            const walls = [];
            if (cell.walls.top) walls.push('top');
            if (cell.walls.right) walls.push('right');
            if (cell.walls.bottom) walls.push('bottom');
            if (cell.walls.left) walls.push('left');
            if (walls.length > 0) {
                const wallToRemove = walls[Math.floor(Math.random() * walls.length)];
                cell.walls[wallToRemove] = false;
                if (wallToRemove === 'top' && y > 0) this.grid[y - 1][x].walls.bottom = false;
                if (wallToRemove === 'right' && x < this.width - 1) this.grid[y][x + 1].walls.left = false;
                if (wallToRemove === 'bottom' && y < this.height - 1) this.grid[y + 1][x].walls.top = false;
                if (wallToRemove === 'left' && x > 0) this.grid[y][x - 1].walls.right = false;
            }
        }
    }

    findShortestPath(startX, startY, endX, endY) {
        const queue = [[{x: startX, y: startY, path: []}]];
        const visited = new Set([`${startX},${startY}`]);

        while (queue.length > 0) {
            const path = queue.shift();
            const { x, y, path: directions } = path[path.length - 1];

            if (x === endX && y === endY) {
                return directions;
            }

            const openPaths = this.getOpenPaths(x, y);
            for (const direction of openPaths) {
                let nextX = x, nextY = y;
                if (direction === 'up') nextY--;
                if (direction === 'down') nextY++;
                if (direction === 'left') nextX--;
                if (direction === 'right') nextX++;

                const visitedKey = `${nextX},${nextY}`;
                if (!visited.has(visitedKey)) {
                    visited.add(visitedKey);
                    const newPath = [...path, {x: nextX, y: nextY, path: [...directions, direction]}];
                    queue.push(newPath);
                }
            }
        }
        return [];
    }

    getOpenPaths(x, y) {
        const cell = this.grid[y][x];
        const paths = [];
        if (!cell.walls.top) paths.push('up');
        if (!cell.walls.right) paths.push('right');
        if (!cell.walls.bottom) paths.push('down');
        if (!cell.walls.left) paths.push('left');
        return paths;
    }

    draw(ctx) {
        // The animated wall drawing is now handled in the Game loop
        ctx.strokeStyle = config.maze.wallColor;
        ctx.lineWidth = config.maze.wallThickness;
        ctx.lineCap = 'round';

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                const xPos = x * this.cellSize;
                const yPos = y * this.cellSize;
                if (cell.walls.top) { ctx.beginPath(); ctx.moveTo(xPos, yPos); ctx.lineTo(xPos + this.cellSize, yPos); ctx.stroke(); }
                if (cell.walls.right) { ctx.beginPath(); ctx.moveTo(xPos + this.cellSize, yPos); ctx.lineTo(xPos + this.cellSize, yPos + this.cellSize); ctx.stroke(); }
                if (cell.walls.bottom) { ctx.beginPath(); ctx.moveTo(xPos + this.cellSize, yPos + this.cellSize); ctx.lineTo(xPos, yPos + this.cellSize); ctx.stroke(); }
                if (cell.walls.left) { ctx.beginPath(); ctx.moveTo(xPos, yPos + this.cellSize); ctx.lineTo(xPos, yPos); ctx.stroke(); }
            }
        }

        const exitXPos = this.exitX * this.cellSize;
        const exitYPos = this.exitY * this.cellSize;
        ctx.fillStyle = config.maze.exitColor;
        ctx.fillRect(exitXPos, exitYPos, this.cellSize, this.cellSize);
    }
}

console.log('maze.js loaded.');
