class UI {
    constructor() {
        this.domInitialized = false;
        this.difficultyTransition = null;
        this.menuButtons = [];
    }

    initDOMElements() {
        if (this.domInitialized) return;
        this.difficultyValue = document.getElementById('difficulty-value');
        this.timeValue = document.getElementById('time-value');
        this.movesValue = document.getElementById('moves-value');
        this.transitionOverlay = document.getElementById('transition-overlay');
        this.domInitialized = true;
    }

    updateHUD(game) {
        if (!this.domInitialized) return;
        if (this.difficultyValue) {
            this.difficultyValue.textContent = `${game.currentDifficulty + 1}`;
        }
        if (this.timeValue) {
            const elapsedTime = (Date.now() - game.startTime) / 1000;
            this.timeValue.textContent = game.isGenerating || game.gameOver || game.startTime === 0 ? '--' : `${elapsedTime.toFixed(1)}s`;
        }
        if (this.movesValue) {
            this.movesValue.textContent = game.player ? game.player.moves : '0';
        }
    }

    showDifficultyTransition(newDifficulty, oldDifficulty) {
        if (newDifficulty > oldDifficulty) {
            this.difficultyTransition = { text: 'Difficulty Up', color: '#28a745', lifetime: 90, age: 0 };
        } else if (newDifficulty < oldDifficulty) {
            this.difficultyTransition = { text: 'Difficulty Down', color: '#dc3545', lifetime: 90, age: 0 };
        }
    }

    updateDifficultyTransition() {
        if (this.difficultyTransition) {
            this.difficultyTransition.age++;
            if (this.difficultyTransition.age >= this.difficultyTransition.lifetime) {
                this.difficultyTransition = null;
            }
        }
    }

    drawDifficultyTransition(ctx, canvas) {
        if (this.difficultyTransition) {
            const { text, color, lifetime, age } = this.difficultyTransition;
            const opacity = Math.sin((age / lifetime) * Math.PI);
            const yOffset = (age / lifetime) * -30;
            ctx.fillStyle = `rgba(${this.hexToRgb(color).r}, ${this.hexToRgb(color).g}, ${this.hexToRgb(color).b}, ${opacity})`;
            ctx.font = `bold 36px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(text, canvas.width / 2, canvas.height / 2 + yOffset);
        }
    }

    drawMainMenu(ctx, canvas, onStartGame, onStartDemo, onResetProgress, mouseX, mouseY) {
        ctx.fillStyle = '#eee';
        ctx.font = `600 50px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('Adaptive Maze', canvas.width / 2, canvas.height / 2 - 120);
        this.menuButtons = [];
        this.menuButtons.push(this.drawButton(ctx, canvas, 'Start Game', canvas.height / 2 - 30, onStartGame, mouseX, mouseY));
        this.menuButtons.push(this.drawButton(ctx, canvas, 'AI Mode', canvas.height / 2 + 40, onStartDemo, mouseX, mouseY));
        this.menuButtons.push(this.drawButton(ctx, canvas, 'Reset Progress', canvas.height / 2 + 110, onResetProgress, mouseX, mouseY));
    }

    drawButton(ctx, canvas, text, y, onClick, mouseX, mouseY) {
        const buttonWidth = 280;
        const buttonHeight = 60;
        const x = canvas.width / 2 - buttonWidth / 2;
        const isHovered = mouseX && mouseY && mouseX >= x && mouseX <= x + buttonWidth && mouseY >= y - buttonHeight / 2 && mouseY <= y + buttonHeight / 2;
        const scale = isHovered ? 1.05 : 1;
        ctx.save();
        ctx.translate(canvas.width / 2, y);
        ctx.scale(scale, scale);
        ctx.fillStyle = isHovered ? '#00aaff' : '#0077cc';
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
        this.roundRect(ctx, -buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 15);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#fff';
        ctx.font = `400 22px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
        ctx.restore();
        return { x, y: y - buttonHeight / 2, width: buttonWidth, height: buttonHeight, onClick };
    }

    handleClick(mouseX, mouseY) {
        for (const button of this.menuButtons) {
            if (mouseX >= button.x && mouseX <= button.x + button.width && mouseY >= button.y && mouseY <= button.y + button.height) {
                button.onClick();
                return true;
            }
        }
        return false;
    }

    drawDirectionChoices(ctx, player, availablePaths) {
        // This is currently disabled as per user request
    }

    showTransition(message = '') {
        if (!this.domInitialized) return;
        this.transitionOverlay.textContent = message;
        this.transitionOverlay.classList.add('active');
    }

    hideTransition() {
        if (!this.domInitialized) return;
        this.transitionOverlay.classList.remove('active');
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
    }
}

console.log('ui.js loaded.');
