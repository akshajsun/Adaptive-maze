/**
 * Represents the Reinforcement Learning agent.
 * This agent uses a Q-learning algorithm to make decisions about difficulty.
 */
class RLAgent {
    constructor() {
        // Q-table: A map to store the Q-values for (state, action) pairs.
        // The key is a string representation of the state, and the value is a map of actions to Q-values.
        // Example: { 'state-key': { action1: q_value, action2: q_value } }
        this.qTable = {};
    }

    /**
     * Chooses an action for a given state using an epsilon-greedy strategy.
     * @param {string} state - The current state, combining difficulty and player skill.
     * @param {boolean} getBest - If true, forces the agent to choose the best known action (no exploration).
     * @returns {number} The chosen action (-1 for decrease, 0 for stay, 1 for increase difficulty).
     */
    chooseAction(state, getBest = false) {
        // Initialize Q-values for the state if they don't exist.
        if (!this.qTable[state]) {
            this.qTable[state] = { [-1]: 0, [0]: 0, [1]: 0 }; // Decrease, Stay, Increase
        }

        // Epsilon-greedy strategy: Explore or Exploit.
        if (!getBest && Math.random() < config.rl.explorationRate) {
            // Explore: Choose a random action.
            return Math.floor(Math.random() * 3) - 1;
        } else {
            // Exploit: Choose the best known action for the current state.
            const actions = this.qTable[state];
            let bestAction = parseInt(Object.keys(actions)[0]); // Initialize with the first action
            let maxQValue = actions[bestAction]; // Initialize with its Q-value
            for (const action in actions) {
                if (actions[action] > maxQValue) {
                    maxQValue = actions[action];
                    bestAction = parseInt(action);
                }
            }
            return bestAction;
        }
    }

    /**
     * Updates the Q-value for a given state-action pair based on the reward received.
     * This is the core of the Q-learning algorithm.
     * @param {string} state - The state in which the action was taken.
     * @param {number} action - The action that was taken.
     * @param {number} reward - The reward received for taking the action.
     * @param {string} nextState - The resulting state after the action.
     */
    updateQValue(state, action, reward, nextState) {
        // Ensure Q-values for the current and next states are initialized.
        if (!this.qTable[state]) {
            this.qTable[state] = { [-1]: 0, [0]: 0, [1]: 0 };
        }
        if (!this.qTable[nextState]) {
            this.qTable[nextState] = { [-1]: 0, [0]: 0, [1]: 0 };
        }

        // Q-learning formula:
        // Q(s,a) = Q(s,a) + lr * [reward + df * max(Q(s',a')) - Q(s,a)]
        const oldQValue = this.qTable[state][action];
        const nextActions = this.qTable[nextState];
        let maxNextQ = -Infinity; // Initialize to -Infinity to correctly find max, even if all Q-values are negative
        for (const nextAction in nextActions) {
            if (nextActions[nextAction] > maxNextQ) {
                maxNextQ = nextActions[nextAction];
            }
        }

        const newQValue = oldQValue + config.rl.learningRate * (reward + config.rl.discountFactor * maxNextQ - oldQValue);
        this.qTable[state][action] = newQValue;
    }

    /**
     * A placeholder for a more complex player skill evaluation.
     * Currently returns a single value, but could be expanded to categorize player performance.
     * @returns {number} The current skill level (currently static).
     */
    getPlayerSkillLevel() {
        // This could be expanded to be a dynamic assessment of player skill
        // based on historical performance (e.g., average completion time, move efficiency).
        return 0;
    }
}

console.log('rl.js loaded.');