class Player {
    constructor(x, y, size, color) {
        this.baseSize = size;
        this.color = color;
        this.moves = 0;
        this.collisions = 0;

        // For cell-to-cell animation
        this.animationProgress = 1; // 0 to 1
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;

        this.cellX = 0;
        this.cellY = 0;
        this.x = 0;
        this.y = 0;
        this.snapToCellCenter();
    }

    // Set up the animation from current cell to next
    move(direction, maze) {
        if (this.animationProgress < 1) return; // Already moving

        const currentCell = maze.grid[this.cellY][this.cellX];
        let targetCellX = this.cellX;
        let targetCellY = this.cellY;
        let moved = false;

        if (direction === 'up' && !currentCell.walls.top) { targetCellY--; moved = true; }
        else if (direction === 'down' && !currentCell.walls.bottom) { targetCellY++; moved = true; }
        else if (direction === 'left' && !currentCell.walls.left) { targetCellX--; moved = true; }
        else if (direction === 'right' && !currentCell.walls.right) { targetCellX++; moved = true; }

        if (moved) {
            this.moves++;
            this.cellX = targetCellX;
            this.cellY = targetCellY;
            this.animationProgress = 0;
            this.startX = this.x;
            this.startY = this.y;
            const cellSize = config.maze.cellSize;
            this.endX = this.cellX * cellSize + cellSize / 2;
            this.endY = this.cellY * cellSize + cellSize / 2;
        } else {
            this.collisions++;
        }
    }

    // Update animation progress
    update() {
        // Movement animation
        if (this.animationProgress < 1) {
            this.animationProgress += config.player.animationSpeed;
            if (this.animationProgress > 1) {
                this.animationProgress = 1;
            }

            const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // Ease in-out quad
            const easedProgress = ease(this.animationProgress);

            this.x = this.startX + (this.endX - this.startX) * easedProgress;
            this.y = this.startY + (this.endY - this.startY) * easedProgress;
        }
    }

    snapToCellCenter() {
        const cellSize = config.maze.cellSize;
        this.x = this.cellX * cellSize + cellSize / 2;
        this.y = this.cellY * cellSize + cellSize / 2;
    }

    isAtExit(maze) {
        return this.cellX === maze.exitX && this.cellY === maze.exitY;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.baseSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

console.log('player.js loaded.');