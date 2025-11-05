🌀 Adaptive Maze Game
A smart, clean, browser-based puzzle game with RL-powered procedural maze generation and dynamic difficulty adaptation.
Built in JavaScript/HTML5 Canvas.

🚀 Overview
Adaptive Maze Game lets you navigate auto-generated mazes, where complexity evolves to match your skill. Using reinforcement learning (Q-learning), the system intelligently adjusts difficulty in real time, providing challenge and replay value with a modern, casual UI.

🎮 Features
RL-Powered Maze Generation: Mazes are built using a recursive algorithm, optimized with a Q-learning agent for variety.

Adaptive Difficulty: Challenge adapts as you improve or struggle—maze size and complexity change in response.

Modern UI: Soft panels, grouped progress bars, clear layout. No neon, just elegant, accessible design.

Auto-Move Controls: Player moves forward automatically, choosing directions only at intersections.

Demo Mode: Watch an AI agent solve mazes smartly, updating difficulty as it goes.

Responsive: Works on desktop and most mobile browsers.

🕹️ How to Play
Clone or download this repo:

bash
git clone https://github.com/akshajsun/adaptive-maze-game.git
cd adaptive-maze-game
Open index.html in your web browser.

Move through the maze: Player auto-moves on straight paths; choose directions at each branch or intersection.

Demo Mode: See the AI agent find efficient paths and evolve the maze challenge.

⚙️ Technologies
JavaScript

HTML5 Canvas

Recursive Maze Generation

Q-learning (Reinforcement Learning)

Modular, Clear Code

📁 File Structure
text
project/
├── index.html
├── main.js      # Game loop
├── maze.js      # Maze generation/rendering
├── player.js    # Player movement logic
├── rl.js        # RL agent code
├── ui.js        # UI and HUD
├── style.css    # Styling
├── README.md
💡 Project Highlights
RL agent constantly learns and updates game difficulty for better engagement.

Casual, professional visuals—easy to play, appealing to explore.

Auto-move navigation for strategic, relaxed play.

Demo mode is both informative and adaptive.

📗 License & Credits
MIT License.
Open for contributions, improvements, and forks!
