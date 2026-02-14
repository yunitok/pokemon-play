import { MinigameScene } from './MinigameScene';
import { UIHelper } from '../utils/UIHelper';
import { Difficulty } from '../utils/Difficulty';
import { audioManager } from '../managers/AudioManager';
import { gameManager } from '../managers/GameManager';

export class MeowthChangeScene extends MinigameScene {
    constructor() {
        super('MeowthChangeScene');
    }

    preload() {
        this.load.image('bg_gold', 'assets/images/bg_gold.webp');
    }

    create() {
        super.create();
        if (window.setAppBackground) window.setAppBackground('#000000');
        const bg = this.children.list.find(child => child.texture && child.texture.key === 'bg_game');
        if (bg) {
            bg.setTexture('bg_gold');
            bg.clearTint();
            bg.setDisplaySize(this.scale.width, this.scale.height);
        }

        // Dark Overlay
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0, 0);

        // 1. Setup Problem
        // Target Logic from Difficulty
        const possibleTargets = Difficulty.getMeowthTargetMoney(gameManager.level);
        const targetValue = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];

        // Header
        // Header
        this.setupHeader(
            'Cofres Meowth',
            "¡Encuentra el tesoro exacto!\n\nMeowth pide una cantidad.\nBusca el cofre que tenga las monedas que suman esa cantidad.\n\nEJEMPLO:\nMeowth pide: 1€\nCofre A: 50c + 20c (¡No! Son 70c)\nCofre B: 50c + 50c (¡Sí! Es 1€)"
        );

        this.add.text(this.cameras.main.width / 2, 130, `¿Cuál de estos cofres tiene ${targetValue.toFixed(2)}€?`, { fontSize: '28px', fontFamily: '"Fredoka One", cursive', fill: '#ffff00', backgroundColor: '#333', padding: { x: 10, y: 5 } }).setOrigin(0.5);

        // Meowth (Placeholder)
        const meowth = this.add.circle(150, 200, 60, 0xFFECB3); // Cream color
        this.add.text(150, 200, '😸', { fontSize: '80px' }).setOrigin(0.5);

        // Target Coin Display
        const targetCoin = this.createCoinVisual(250, 200, targetValue);
        targetCoin.setScale(1.5);

        // 2. Generate Options
        const options = [];

        // Option A: Correct
        options.push({ coins: this.generateCombination(targetValue), correct: true });

        // Option B: Wrong (Target - small amount)
        let wrong1 = Math.max(0.05, targetValue - 0.20);
        options.push({ coins: this.generateCombination(wrong1), correct: false });

        // Option C: Wrong (Target + small amount)
        let wrong2 = targetValue + 0.50;
        options.push({ coins: this.generateCombination(wrong2), correct: false });

        // Shuffle Options
        options.sort(() => Math.random() - 0.5);

        // 3. Render Chests (Options)
        const chestY = 500;
        const spacing = 300;
        const startX = this.cameras.main.width / 2 - spacing;

        options.forEach((opt, i) => {
            const x = startX + i * spacing;

            // Chest Container
            const container = this.add.container(x, chestY);

            // Chest Visual (Rect)
            const box = this.add.rectangle(0, 0, 250, 200, 0x795548); // Brown
            box.setStrokeStyle(4, 0xffffff);
            container.add(box);

            // Render Coins inside chest
            this.renderCoinsInBox(container, opt.coins);

            // Interaction
            box.setInteractive({ useHandCursor: true });
            box.on('pointerdown', () => {
                if (opt.correct) {
                    box.setFillStyle(0x4CAF50); // Green
                    this.completeMinigame(20);
                } else {
                    box.setFillStyle(0xF44336); // Red

                    this.failMinigame('¡Este cofre no es!');

                    this.tweens.add({
                        targets: container,
                        x: x + 10,
                        duration: 50,
                        yoyo: true,
                        repeat: 4
                    });
                    // Restore color
                    this.time.delayedCall(500, () => {
                        box.setFillStyle(0x795548);
                    });
                }
            });

            // Label A, B, C
            const label = this.add.text(0, -130, `Opción ${String.fromCharCode(65 + i)}`, { fontSize: '24px', fontFamily: '"Fredoka One", cursive' }).setOrigin(0.5);
            container.add(label);
        });
    }

    generateCombination(targetSum) {
        // Greedy approach to breakdown sum into coins
        // For game purposes, we want "interesting" combinations, not just optimal (least coins)
        // So we might skip the largest denomination occasionally?
        // Let's just do greedy for now using available denominations < targetSum

        const denoms = [2.00, 1.00, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01];
        let remaining = targetSum;
        const result = [];

        // Allow slightly suboptimal for 1.00 (e.g. 2x 50c is better than 1x 1e for the game)
        // If target is 1.00, force breakdown?
        let startIndex = 0;
        if (Math.abs(targetSum - 1.00) < 0.001 || Math.abs(targetSum - 2.00) < 0.001) {
            // Skip the exact coin to ensure we have "change"
            startIndex = denoms.findIndex(d => d < targetSum);
            if (startIndex === -1) startIndex = 0;
        }

        for (let i = startIndex; i < denoms.length; i++) {
            const coin = denoms[i];
            while (remaining >= coin - 0.001) { // Float tolerance
                remaining -= coin;
                result.push(coin);
            }
        }

        // Handle float residuals if any (shouldn't be with these denoms but safety)
        if (remaining > 0.005) {
            result.push(0.01);
        }

        return result;
    }

    renderCoinsInBox(container, coins) {
        // Arrange coins in a grid or circle inside the box (250x200)
        // Max coins usually < 10
        const cols = 3;
        const rowHeight = 60;
        const colWidth = 60;
        const startX = -((Math.min(coins.length, cols) - 1) * colWidth) / 2;
        const startY = -40; // Shift up a bit

        coins.forEach((val, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * colWidth;
            const y = startY + row * rowHeight;

            const coin = this.createCoinVisual(x, y, val);
            coin.setScale(0.8);
            container.add(coin);
        });
    }
}
