export class GameManager {
    constructor() {
        if (GameManager.instance) {
            return GameManager.instance;
        }
        GameManager.instance = this;

        this.initialState = {
            coins: 500,
            level: 1,
            inventory: {
                potion: 0,
                pokeball: 0,
                paralizador: 0,
                lupa: 0,
                escudo: 0
            },
            highScore: 0
        };

        this.state = this.loadState();
        this.listeners = [];
    }

    loadState() {
        try {
            const saved = localStorage.getItem('pokemonPlayState');
            return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(this.initialState));
        } catch (e) {
            console.error('Failed to load state:', e);
            return JSON.parse(JSON.stringify(this.initialState));
        }
    }

    saveState() {
        try {
            localStorage.setItem('pokemonPlayState', JSON.stringify(this.state));
            this.notifyListeners();
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }

    resetState() {
        this.state = JSON.parse(JSON.stringify(this.initialState));
        this.saveState();
        // Ideally reload or emit 'reset' event
        window.location.reload(); 
    }

    // Getters
    get coins() { return this.state.coins; }
    get level() { return this.state.level; }
    get inventory() { return this.state.inventory; }

    // Actions
    addCoins(amount) {
        this.state.coins += amount;
        this.saveState();
        console.log(`Global coins updated: ${this.state.coins} (+${amount})`);
    }

    spendCoins(amount) {
        if (this.state.coins >= amount) {
            this.state.coins -= amount;
            this.saveState();
            return true;
        }
        return false;
    }

    levelUp() {
        this.state.level++;
        this.saveState();
    }

    levelDown() {
         if (this.state.level > 1) {
            this.state.level--;
            this.saveState();
        }
    }

    setLevel(lvl) {
        this.state.level = lvl;
        this.saveState();
    }

    addItem(itemKey, count = 1) {
        if (!this.state.inventory[itemKey]) {
            this.state.inventory[itemKey] = 0;
        }
        this.state.inventory[itemKey] += count;
        this.saveState();
    }

    useItem(itemKey) {
        if (this.state.inventory[itemKey] > 0) {
            this.state.inventory[itemKey]--;
            this.saveState();
            return true;
        }
        return false;
    }

    // Event System (Simple Observer)
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb(this.state));
    }

    // Logic for item drops
    checkItemDrop() {
        // 10% chance to drop an item
        if (Math.random() < 0.10) {
            const possibleItems = ['potion', 'pokeball', 'paralizador', 'lupa', 'escudo'];
            // Simple random selection
            const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];
            
            // Add to inventory
            this.addItem(item, 1);
            console.log(`Drop! Found ${item}`);
            return item;
        }
        return null;
    }
}

// Singleton instance
export const gameManager = new GameManager();
