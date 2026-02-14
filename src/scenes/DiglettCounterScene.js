import { MinigameScene } from './MinigameScene';
import { UIHelper } from '../utils/UIHelper';
import { Difficulty } from '../utils/Difficulty';
import { audioManager } from '../managers/AudioManager';
import { gameManager } from '../managers/GameManager';

export class DiglettCounterScene extends MinigameScene {
    constructor() {
        super('DiglettCounterScene');
    }

    preload() {
        this.load.image('bg_cave', 'assets/images/bg_cave.webp');
    }

    create() {
        super.create();
        if (window.setAppBackground) window.setAppBackground('#000000');
        const bg = this.children.list.find(child => child.texture && child.texture.key === 'bg_game');
        if (bg) {
            bg.setTexture('bg_cave');
            bg.clearTint();
            bg.setDisplaySize(this.scale.width, this.scale.height);
        }

        // Dark Overlay
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0, 0);

        // Target Logic from Difficulty Utility
        const range = Difficulty.getDiglettTarget(gameManager.level);
        this.targetNumber = Phaser.Math.Between(range.min, range.max);
        this.currentSum = 0;

        // Header
        // Header
        this.setupHeader(
            'Contador de Digletts',
            "¡Vamos a sumar!\n\nToca los Digletts para sumar sus números hasta llegar al OBJETIVO exacto.\n\nEJEMPLO:\nObjetivo: 10\nSi tocas un 5 y un 3, llevas 8.\n¡Te falta un 2! (5 + 3 + 2 = 10)."
        );

        this.targetText = this.add.text(200, 150, `Objetivo: ${this.targetNumber}`, { fontSize: '48px', fontFamily: '"Fredoka One", cursive', fill: '#ffff00', backgroundColor: '#333', padding: { x: 20, y: 10 } }).setOrigin(0.5);
        this.sumText = this.add.text(this.cameras.main.width - 200, 150, `Suma: 0`, { fontSize: '48px', fontFamily: '"Fredoka One", cursive', fill: '#ffffff', backgroundColor: '#333', padding: { x: 20, y: 10 } }).setOrigin(0.5);

        // Diglett Group
        this.digletts = this.add.group();

        // Timer for spawning from Difficulty
        const spawnDelay = Difficulty.getDiglettNewSpawnInterval(gameManager.level);

        this.spawnEvent = this.time.addEvent({
            delay: spawnDelay,
            callback: this.spawnDiglett,
            callbackScope: this,
            loop: true
        });

        // Instructions
        // Instructions
        this.add.text(this.cameras.main.width / 2, 700, '¡Toca los Digletts para sumar el número exacto!', { fontSize: '24px', fontFamily: '"Fredoka One", cursive', fill: '#ffffff' }).setOrigin(0.5);
    }

    spawnDiglett() {
        if (this.currentSum >= this.targetNumber) return; // Stop if won (or handled elsewhere)

        const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
        const y = Phaser.Math.Between(250, 600);

        // Values: 1, 2, 5
        const val = Phaser.Math.RND.pick([1, 2, 5]);

        // Visuals (Placeholder: Brown Capsule/Circle)
        const container = this.add.container(x, y);

        // Diglett Body
        const body = this.add.circle(0, 0, 40, 0x8D6E63); // Brown
        const nose = this.add.circle(0, -5, 10, 0xE91E63); // Pink nose
        const valText = this.add.text(0, -50, `+${val}`, { fontSize: '32px', fontFamily: '"Fredoka One", cursive', fill: '#ffffff', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5);

        container.add([body, nose, valText]);
        container.setSize(80, 80);

        // Interaction
        container.setInteractive({ useHandCursor: true });
        container.on('pointerdown', () => {
            this.handleDiglettClick(val, container);
        });

        // Entrance Animation
        container.setScale(0);
        this.tweens.add({
            targets: container,
            scaleX: 1, scaleY: 1,
            duration: 300,
            ease: 'Back.out'
        });

        // Auto destroy after time
        this.time.delayedCall(3000, () => {
            if (container.active) {
                this.tweens.add({
                    targets: container,
                    y: y + 50, alpha: 0,
                    duration: 200,
                    onComplete: () => container.destroy()
                });
            }
        });

        this.digletts.add(container);
    }

    handleDiglettClick(val, diglett) {
        if (!diglett.active) return;
        diglett.disableInteractive(); // Visual click feedback handling next

        // Visual feedback
        this.showFeedback(true, diglett.x, diglett.y);

        // Update Logic
        this.currentSum += val;
        this.sumText.setText(`Suma: ${this.currentSum}`);

        // Destroy Diglett
        diglett.destroy();

        // Check Win/Lose
        if (this.currentSum === this.targetNumber) {
            // WIN
            this.spawnEvent.remove();
            this.digletts.clear(true, true); // Remove others
            this.sumText.setColor('#00ff00');
            this.completeMinigame(20);
        } else if (this.currentSum > this.targetNumber) {
            // LOSE / RESET

            // Use unified fail helper from base class/UIHelper logic
            // We want to reset AFTER the message, or during?
            // The UIHelper blocks the screen a bit.

            this.failMinigame('¡Te pasaste!');

            // Reset Logic immediately or wait? 
            // If we reset immediately, the user sees 0. 
            // Let's reset visually immediately.
            this.currentSum = 0;
            this.sumText.setText(`Suma: 0`);
            this.sumText.setColor('#ffffff');

            // Clear current digletts
            this.digletts.children.each(d => {
                if (d.active) {
                    this.tweens.add({
                        targets: d,
                        y: d.y + 100,
                        duration: 300,
                        onComplete: () => d.destroy()
                    });
                }
            });
        }
    }
}
