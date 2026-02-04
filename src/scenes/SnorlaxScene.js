import Phaser from 'phaser';

export class SnorlaxScene extends Phaser.Scene {
    constructor() {
        super('SnorlaxScene');
    }

    create() {
        // UI Helpers
        const W = this.scale.width;
        const H = this.scale.height;

        this.add.image(W / 2, H / 2, 'bg_game').setDisplaySize(W, H);

        // Header: Level & Back
        this.add.text(20, 20, '⬅ Menú', { 
            fontSize: '24px', fontFamily: 'sans-serif', fill: '#000', backgroundColor: '#ffffff', padding: { x: 10, y: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('MenuScene'));
        
        this.levelText = this.add.text(W - 20, 20, `Nivel: ${window.GameState.level}`, {
             fontSize: '32px', fontFamily: 'sans-serif', color: '#FFD700', stroke: '#000', strokeThickness: 4
        }).setOrigin(1, 0);

        // Snorlax (Center) - Random Image
        const snorlaxKeys = ['snorlax', 'snorlax_2', 'snorlax_3', 'snorlax_4'];
        this.snorlax = this.add.image(W / 2, 280, Phaser.Utils.Array.GetRandom(snorlaxKeys)).setDisplaySize(200, 200);

        // Wake Up Meter (Timer) - Improved visibility
        this.add.text(W / 2, 80, '¡Que no despierte!', { 
            fontSize: '24px', fontFamily: 'sans-serif', color: '#FF0000', stroke: '#fff', strokeThickness: 4, fontStyle: 'bold' 
        }).setOrigin(0.5);
        this.timerBox = this.add.rectangle(W / 2, 115, 300, 24, 0x000000, 0.5).setStrokeStyle(2, 0xffffff);
        this.timerBar = this.add.rectangle(W / 2 - 148, 115, 0, 20, 0xFF0000).setOrigin(0, 0.5);
        this.wakeProgress = 0;
        this.isGameOver = false;

        // Feedback Text
        this.feedbackText = this.add.text(W / 2, 180, '', {
            fontFamily: 'sans-serif', fontSize: '40px', color: '#000', stroke: '#fff', strokeThickness: 4
        }).setOrigin(0.5);

        // Question Text - Moved DOWN below Snorlax
        this.instructionText = this.add.text(W / 2, 430, '', {
            fontFamily: 'sans-serif', fontSize: '30px', color: '#000', align: 'center', wordWrap: { width: 700 },
            stroke: '#ffffff', strokeThickness: 3
        }).setOrigin(0.5);

        // Answer Area - Moved DOWN
        this.answerContainer = this.add.container(0, 580);
        
        // Power-up UI (Bottom Left/Right)
        this.createPowerupUI();

        // Start Round
        this.askQuestion();
    }

    createPowerupUI() {
        // Potion (Reduce Timer)
        const potionBtn = this.add.container(80, this.scale.height - 80);
        const pBg = this.add.circle(0, 0, 45, 0xffffff).setStrokeStyle(3, 0x000)
            .setInteractive({ useHandCursor: true });
        const pImg = this.add.image(0, 0, 'potion').setDisplaySize(55, 55);
        this.potionCount = this.add.text(25, 25, `${window.GameState.inventory.potion}`, { 
            fontSize: '22px', backgroundColor: '#000', color: '#fff', padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        potionBtn.add([pBg, pImg, this.potionCount]);
        
        pBg.on('pointerdown', () => this.usePotion());

        // Pokeball (Auto-Win)
        const ballBtn = this.add.container(this.scale.width - 80, this.scale.height - 80);
        const bBg = this.add.circle(0, 0, 45, 0xffffff).setStrokeStyle(3, 0x000)
            .setInteractive({ useHandCursor: true });
        const bImg = this.add.image(0, 0, 'pokeball').setDisplaySize(55, 55);
        this.pokeballCount = this.add.text(25, 25, `${window.GameState.inventory.pokeball}`, { 
            fontSize: '22px', backgroundColor: '#000', color: '#fff', padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        ballBtn.add([bBg, bImg, this.pokeballCount]);
        
        bBg.on('pointerdown', () => this.usePokeball());
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Timer Logic (Difficulty increases with level)
        const difficultyMultiplier = 1 + (window.GameState.level * 0.1);
        const baseSpeed = 0.05; // Base wake up speed
        
        // Only active if Level > 3
        if (window.GameState.level > 3) {
            this.wakeProgress += (baseSpeed * difficultyMultiplier) * (delta / 1000);
            
            // Visual Warning
            if (this.wakeProgress > 0.8) {
                this.timerBar.setFillStyle(0xFF0000); // Red
                if (Math.floor(time) % 2 === 0) this.cameras.main.shake(50, 0.005);
            } else {
                this.timerBar.setFillStyle(0xFFA500); // Orange
            }

            // Update Bar Width (Max 296)
            this.timerBar.width = Math.min(296, 296 * this.wakeProgress);

            if (this.wakeProgress >= 1) {
                this.gameOver();
            }
        }
    }

    askQuestion() {
        this.answerContainer.removeAll(true);
        this.feedbackText.setText('');
        
        // Difficulty Logic
        let maxTarget = 10;
        if (window.GameState.level > 3) maxTarget = 20;
        if (window.GameState.level > 7) maxTarget = 50;
        if (window.GameState.level > 15) maxTarget = 100;

        const target = Phaser.Math.Between(5, maxTarget);
        const current = Phaser.Math.Between(1, target - 1);
        this.correctAnswer = target - current;

        // Random Food
        const foods = [
            { key: 'candy', name: 'caramelos' },
            { key: 'berry', name: 'bayas' },
            { key: 'apple', name: 'manzanas' },
            { key: 'donut', name: 'donas' }
        ];
        const currentFood = Phaser.Utils.Array.GetRandom(foods);

        this.instructionText.setText(`Nivel ${window.GameState.level}\nSnorlax quiere ${target} ${currentFood.name}.\nYa se comió ${current}.\n¿Cuántos faltan?`);
        
        this.createNumberOptions(this.correctAnswer, maxTarget);
    }

    createNumberOptions(correct, rangeMax) {
        let choices = [correct];
        while (choices.length < 3) {
            let num = Phaser.Math.Between(1, rangeMax);
            if (!choices.includes(num) && num !== correct) choices.push(num);
        }
        choices = Phaser.Utils.Array.Shuffle(choices);

        const startX = this.scale.width / 2 - 150;
        choices.forEach((num, index) => {
            const btn = this.add.container(startX + (index * 150), 0);
            const bg = this.add.circle(0, 0, 40, 0xffffff).setStrokeStyle(4, 0x3B4CCA).setInteractive({ useHandCursor: true });
            const text = this.add.text(0, 0, num.toString(), {
                fontSize: '40px', color: '#3B4CCA', fontFamily: 'sans-serif', fontStyle: 'bold'
            }).setOrigin(0.5);

            btn.add([bg, text]);
            
            bg.on('pointerdown', () => this.checkAnswer(num));
            
            // Hover effects
            bg.on('pointerover', () => bg.setFillStyle(0xFFCB05));
            bg.on('pointerout', () => bg.setFillStyle(0xffffff));

            this.answerContainer.add(btn);
        });
    }

    checkAnswer(number) {
        if (this.isGameOver) return;

        if (number === this.correctAnswer) {
            this.handleWin();
        } else {
            this.handleFail();
        }
    }

    handleWin() {
        if (window.playTone) {
            window.playTone(600, 'sine', 0.1);
            setTimeout(() => window.playTone(800, 'sine', 0.2), 150);
        }

        // Reward logic
        window.GameState.coins += 10;
        window.GameState.level += 1;
        window.saveGame();

        // Update UI
        this.levelText.setText(`Nivel: ${window.GameState.level}`);
        this.feedbackText.setText('¡Excelente! +10 Monedas'); // Fixed Text
        this.feedbackText.setColor('#00ff00');
        
        // Reset Timer slightly (Bonus)
        this.wakeProgress = Math.max(0, this.wakeProgress - 0.2);

        // Animation
        this.tweens.add({ targets: this.snorlax, y: this.snorlax.y - 30, duration: 150, yoyo: true });

        // Next level
        this.time.delayedCall(1500, () => {
             // Change Snorlax Skin for variety
            const snorlaxKeys = ['snorlax', 'snorlax_2', 'snorlax_3', 'snorlax_4'];
            this.snorlax.setTexture(Phaser.Utils.Array.GetRandom(snorlaxKeys));
            
            this.askQuestion();
        });
    }

    handleFail() {
        if (window.playTone) window.playTone(150, 'sawtooth', 0.4);
        this.feedbackText.setText('¡Ups! Snorlax se mueve...');
        this.feedbackText.setColor('#ff0000');
        this.cameras.main.shake(200, 0.01);
        
        // Penalty: Timer increases significantly
        this.wakeProgress += 0.3;
    }

    usePotion() {
        if (window.GameState.inventory.potion > 0) {
            window.GameState.inventory.potion--;
            window.saveGame();
            this.potionCount.setText(`${window.GameState.inventory.potion}`);
            
            // Effect: Reduce wake progress significantly
            this.wakeProgress = Math.max(0, this.wakeProgress - 0.5);
            this.timerBar.width = 296 * this.wakeProgress;
            
            if (window.playTone) window.playTone(1000, 'sine', 0.5);
            this.feedbackText.setText('¡Usaste Poción! 💤');
            this.feedbackText.setColor('#4CAF50');
        } else {
            // Cannot use
            if (window.playTone) window.playTone(200, 'square', 0.1);
        }
    }

    usePokeball() {
        if (window.GameState.inventory.pokeball > 0) {
            window.GameState.inventory.pokeball--;
            window.saveGame();
            this.pokeballCount.setText(`${window.GameState.inventory.pokeball}`);
            
            // Effect: Auto win
            this.handleWin();
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.feedbackText.setText('¡Snorlax DESPERTÓ!');
        this.feedbackText.setColor('#ff0000'); // RED TEXT
        if (window.playTone) window.playTone(100, 'sawtooth', 1.0);
        
        // Reset Level penalty
        window.GameState.level = Math.max(1, window.GameState.level - 5);
        window.saveGame();

        this.time.delayedCall(3000, () => {
            this.scene.start('MenuScene');
        });
    }
}
