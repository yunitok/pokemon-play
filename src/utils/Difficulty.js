/**
 * Difficulty Utility
 * Centralizes all math/logic scaling based on Level.
 */
export const Difficulty = {
    // Snorlax Game
    getSnorlaxTarget(level) {
        if (level <= 3) return 10;
        if (level <= 7) return 20;
        if (level <= 15) return 50;
        return 100; // Cap at 100 for now
    },

    getSnorlaxWakeSpeed(level) {
        const baseSpeed = 0.02;
        // Increase speed by 5% per level
        return baseSpeed * (1 + (level * 0.05));
    },

    // Diglett Game (Counting)
    getDiglettTarget(level) {
        const min = 10 + Math.floor(level * 1.5);
        const max = 20 + Math.floor(level * 2);
        return { min, max };
    },

    getDiglettNewSpawnInterval(level) {
        // Faster spawns at higher levels
        // Base 1500ms, reduce by 50ms per level, min 500ms
        return Math.max(500, 1500 - (level * 50));
    },

    // Meowth Game (Money)
    getMeowthTargetMoney(level) {
        // Lvl 1: Simple (0.50, 1.00)
        // Lvl 5: Add decimal complexity (1.25, 3.40)
        // This is a placeholder for future logic
        if (level < 5) return [0.50, 1.00, 2.00];
        return [0.50, 1.00, 1.50, 2.00, 2.50, 5.00];
    }
};
