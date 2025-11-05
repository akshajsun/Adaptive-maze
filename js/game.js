class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.rlAgent = new RLAgent(); // Single RL agent for both player and AI
        this.particleSystem = new ParticleSystem();
        this.ui = new UI();
        this.gameState = 'menu';
        this.currentDifficulty = parseInt(localStorage.getItem('mazeDifficulty') || '0'); // Load difficulty from localStorage
        this.startTime = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.availablePaths = [];
        this.gameOver = false;
        this.isDemoMode = false;

        this.canvas.addEventListener('click', (e) => this.handleMouseClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleMouseClick(event) {
        if (this.gameState !== 'menu') return;
        const rect = this.canvas.getBoundingClientRect();
        this.ui.handleClick(event.clientX - rect.left, event.clientY - rect.top);
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
    }

    handleKeyPress(event) {
        if (this.gameState !== 'awaitingInput' || this.isDemoMode) return;

        let direction = null;
        if (event.code === 'ArrowUp' || event.code === 'KeyW') direction = 'up';
        if (event.code === 'ArrowDown' || event.code === 'KeyS') direction = 'down';
        if (event.code === 'ArrowLeft' || event.code === 'KeyA') direction = 'left';
        if (event.code === 'ArrowRight' || event.code === 'KeyD') direction = 'right';

        if (direction && this.availablePaths.includes(direction)) {
            this.player.move(direction, this.maze);
            this.gameState = 'animating';
        }
    }

    initUI() {
        if (!this.ui.domInitialized) {
            this.ui.initDOMElements();
            const menuButton = document.getElementById('menu-button');
            if (menuButton) {
                menuButton.addEventListener('click', () => this.returnToMenu());
            }
        }
    }

    setUIVisibility(visible) {
        const uiPanel = document.getElementById('ui-panel');
        if (uiPanel) {
            uiPanel.style.display = visible ? 'flex' : 'none';
        }
    }

    _initializeGame() {
        this.ui.showTransition();
        setTimeout(() => {
            this.setUIVisibility(true);
            this.resetLevel();
            this.ui.hideTransition();
        }, 500);
    }

    startGame() {
        this.isDemoMode = false;
        this._initializeGame();
    }

    startDemo() {
        this.isDemoMode = true;
        this._initializeGame();
    }

    returnToMenu() {
        this.isDemoMode = false;
        this.ui.showTransition();
        setTimeout(() => {
            this.gameState = 'menu';
            this.setUIVisibility(false);
            this.canvas.width = 800;
            this.canvas.height = 600;
            this.ui.hideTransition();
        }, 500);
    }

    resetLevel() {
        const difficulty = config.rl.difficultyLevels[this.currentDifficulty];
        this.maze = new Maze(difficulty.width, difficulty.height, config.maze.cellSize);
        this.player = new Player(config.maze.cellSize / 2, config.maze.cellSize / 2, config.player.size, config.player.color);
        this.gameOver = false;
        this.startTime = 0; // Will be set after generation
        this.canvas.width = this.maze.width * config.maze.cellSize;
        this.canvas.height = this.maze.height * config.maze.cellSize;
        this.isGenerating = true;
        this.gameState = 'generating';
    }

    checkForDecisionPoint() {
        if (this.player.isAtExit(this.maze)) {
            this.handleWin();
            return;
        }
        this.availablePaths = this.maze.getOpenPaths(this.player.cellX, this.player.cellY);
        this.gameState = 'awaitingInput';
    }

    update() {
        this.initUI();
        if (this.gameOver) return;

        if (this.isGenerating) {
            // Animate the maze generation
            if (this.maze.animateGeneration()) {
                this.isGenerating = false;
                this.maze.addLoops(this.currentDifficulty);
                this.startTime = Date.now();
                if (this.isDemoMode) {
                    this.aiSolutionPath = this.maze.findShortestPath(0, 0, this.maze.exitX, this.maze.exitY);
                }
                this.checkForDecisionPoint();
            }
            return; // Don't do other updates while generating
        }

        if (this.player) {
            this.player.update();
        }

        if (this.gameState === 'animating') {
            if (this.player.animationProgress >= 1) {
                this.checkForDecisionPoint();
            }
            return;
        }

        if (this.gameState === 'awaitingInput' && this.isDemoMode) {
            if (this.aiSolutionPath.length > 0) {
                const direction = this.aiSolutionPath.shift();
                this.player.move(direction, this.maze);
                this.gameState = 'animating';
            }
        }

        if (this.gameState !== 'menu') {
            this.ui.updateHUD(this);
        }
        this.particleSystem.update();
        this.ui.updateDifficultyTransition();
    }

    handleWin() {
        this.gameOver = true;
        const completionTime = (Date.now() - this.startTime) / 1000;
        const moves = this.player.moves;
        const collisions = this.player.collisions;
        const timeFactor = Math.max(0, 1 - Math.abs(completionTime - config.rl.targetTime) / config.rl.targetTime);
        const movesFactor = Math.max(0, 1 - (moves / (this.maze.width * this.maze.height * config.rl.maxMovesFactor)));
        const collisionFactor = 1 - (collisions * config.rl.collisionPenalty);
        let reward = (timeFactor * config.rl.timeRewardFactor) + (movesFactor * config.rl.movesRewardFactor) + collisionFactor;
        reward = Math.max(0, Math.min(1, reward));

        const oldDifficultyIndex = this.currentDifficulty;
        let nextDifficultyIndex;

        if (this.isDemoMode) {
            // In AI mode, always increase difficulty on win.
            nextDifficultyIndex = Math.min(config.rl.difficultyLevels.length - 1, oldDifficultyIndex + 1);
        } else {
            // In player mode, use RL to determine the next difficulty.
            const playerSkillLevel = this.rlAgent.getPlayerSkillLevel(); // Use the single rlAgent
            const rlState = `${oldDifficultyIndex}-${playerSkillLevel}`;
            const action = this.rlAgent.chooseAction(rlState);
            nextDifficultyIndex = Math.max(0, Math.min(config.rl.difficultyLevels.length - 1, oldDifficultyIndex + action));
            const nextRlState = `${nextDifficultyIndex}-${playerSkillLevel}`;
            this.rlAgent.updateQValue(rlState, action, reward, nextRlState);
        }

        this.currentDifficulty = nextDifficultyIndex;
        localStorage.setItem('mazeDifficulty', this.currentDifficulty.toString()); // Save difficulty
        this.ui.showDifficultyTransition(this.currentDifficulty, oldDifficultyIndex);
        console.log(`Level complete! Reward: ${reward.toFixed(2)}, New Difficulty: ${this.currentDifficulty + 1}`);
        setTimeout(() => this.resetLevel(), 2000);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.gameState === 'menu') {
            this.ui.drawMainMenu(this.ctx, this.canvas, () => this.startGame(), () => this.startDemo(), () => this.resetProgress(), this.mouseX, this.mouseY);
        } else {
            if (this.maze) this.maze.draw(this.ctx);
            if (this.player) this.player.draw(this.ctx);
            this.particleSystem.draw(this.ctx);
            if (this.gameOver) {
                this.ctx.fillStyle = 'rgba(44, 44, 44, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 48px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Level Complete!', this.canvas.width / 2, this.canvas.height / 2);
            }
            this.ui.drawDifficultyTransition(this.ctx, this.canvas);
        }
    }

    resetProgress() {
        this.currentDifficulty = 0;
        localStorage.removeItem('mazeDifficulty');
        this.rlAgent.qTable = {}; // Clear the Q-table
        this.returnToMenu();
    }
}

console.log('game.js loaded.');
