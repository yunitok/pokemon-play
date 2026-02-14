import { MinigameScene } from './MinigameScene';
import { UIHelper } from '../utils/UIHelper';
import { Difficulty } from '../utils/Difficulty';
import { audioManager } from '../managers/AudioManager';
import { gameManager } from '../managers/GameManager';

export class PikachuCountScene extends MinigameScene {
    constructor() {
        super('PikachuCountScene');
    }

    create() {
        super.create();

        // 1. Background Setup
        if (window.setAppBackground) window.setAppBackground('#FFF176'); // Light Yellow

        // Use a background if available, or just a color
        const bg = this.children.list.find(child => child.texture && child.texture.key === 'bg_game');
        if (bg) {
            // Apply a tint to make it distinct or just use default
            bg.setTint(0xFFEB3B); // Yellowish tint
        }

        // 2. Setup State
        this.pikachuCount = 0;
        this.pikachusSpawned = 0;
        this.targetCount = Phaser.Math.Between(3, 10); // Random count between 3 and 10
        // Increase difficulty based on level?
        if (gameManager.level > 5) this.targetCount = Phaser.Math.Between(5, 15);
        if (gameManager.level > 10) this.targetCount = Phaser.Math.Between(8, 20);

        this.isSpawning = false;
        this.gamePhase = 'intro'; // intro, spawning, guessing, result

        // 3. Header
        this.setupHeader(
            'Contar Pikachus',
            '¡Mira atentamente!\n\nVan a aparecer varios Pikachus uno por uno.\nCuéntalos todos y luego elige el número correcto.'
        );

        // 4. Content Area
        this.spawnContainer = this.add.container(0, 0);

        // Instructions Text
        this.instructionText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '¡Prepárate para contar!', {
            fontSize: '48px',
            fontFamily: '"Fredoka One", cursive',
            fill: '#000000',
            stroke: '#ffffff',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Start Button
        this.createStartButton();
    }

    createStartButton() {
        const btn = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 100, '¡EMPEZAR!', {
            fontSize: '32px',
            fontFamily: '"Fredoka One", cursive',
            fill: '#ffffff',
            backgroundColor: '#FF5722',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
            audioManager.playUiSound();
            btn.destroy();
            this.instructionText.setVisible(false);
            this.startSpawningSequence();
        });
    }

    startSpawningSequence() {
        this.gamePhase = 'spawning';
        this.pikachusSpawned = 0;

        // Interval between spawns
        const baseInterval = 1000; // 1 second
        // Speed up slightly as level increases
        const interval = Math.max(500, baseInterval - (gameManager.level * 20));

        this.spawnTimer = this.time.addEvent({
            delay: interval,
            callback: this.spawnPikachu,
            callbackScope: this,
            repeat: this.targetCount - 1
        });

        // Also verify completion
        this.time.delayedCall(interval * (this.targetCount) + 1000, () => {
            this.showOptions();
        });
    }

    spawnPikachu() {
        this.pikachusSpawned++;

        // Random Position within safe area
        // Avoid header (top 100) and margins
        const margin = 100;
        const x = Phaser.Math.Between(margin, this.cameras.main.width - margin);
        const y = Phaser.Math.Between(margin + 100, this.cameras.main.height - margin);

        const pikachu = this.createPikachuSprite(x, y);
        pikachu.setScale(0); // Start small

        // Play sound
        audioManager.playUiSound(); // Or specific pikachu sound if available?

        // Animation: Pop in, wait, Pop out
        this.tweens.add({
            targets: pikachu,
            scaleX: 0.8, scaleY: 0.8, // Target scale
            duration: 300,
            ease: 'Back.out',
            onComplete: () => {
                // Stay for a bit then disappear
                this.tweens.add({
                    targets: pikachu,
                    scaleX: 0, scaleY: 0,
                    alpha: 0,
                    delay: 400, // Visible time
                    duration: 300,
                    ease: 'Back.in',
                    onComplete: () => {
                        pikachu.destroy();
                    }
                });
            }
        });
    }

    showOptions() {
        this.gamePhase = 'guessing';
        this.instructionText.setText('¿Cuántos había?').setVisible(true).setPosition(this.cameras.main.width / 2, 200);

        // Generate Options: Correct, Correct + 1 (or 2), Correct - 1 (or 2)
        const correct = this.targetCount;
        let set = new Set();
        set.add(correct);

        while (set.size < 3) {
            let offset = Phaser.Math.Between(-2, 2);
            let val = correct + offset;
            if (val > 0 && val !== correct) {
                set.add(val);
            } else if (set.size < 3 && val <= 0) {
                // Fallback for small numbers
                set.add(correct + set.size + 1);
            }
        }

        const options = Array.from(set).sort((a, b) => a - b); // Sort? Or shuffle? Shuffle is better usually.
        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        // Create Buttons
        const startX = this.cameras.main.width / 2;
        const startY = 400;
        const gap = 120;

        options.forEach((opt, index) => {
            this.createOptionButton(startX + (index - 1) * 200, startY, opt, opt === correct, index);
        });
    }

    createOptionButton(x, y, number, isCorrect, index) {
        const btnContainer = this.add.container(x, y);

        const circle = this.add.circle(0, 0, 60, 0x222222);
        circle.setStrokeStyle(4, 0xffffff);
        circle.setInteractive({ useHandCursor: true });

        const text = this.add.text(0, 0, number.toString(), {
            fontSize: '48px',
            fontFamily: '"Fredoka One", cursive',
            fill: '#ffffff'
        }).setOrigin(0.5);

        btnContainer.add([circle, text]);

        circle.on('pointerdown', () => {
            if (this.gamePhase !== 'guessing') return;

            if (isCorrect) {
                this.handleWin();
            } else {
                this.handleLose(circle);
            }
        });

        // Hover effect
        circle.on('pointerover', () => {
            circle.setFillStyle(0x444444);
            btnContainer.setScale(1.1);
        });
        circle.on('pointerout', () => {
            circle.setFillStyle(0x222222);
            btnContainer.setScale(1);
        });

        // Intro animation
        btnContainer.setScale(0);
        this.tweens.add({
            targets: btnContainer,
            scaleX: 1, scaleY: 1,
            duration: 300,
            delay: index * 100,
            ease: 'Back.out'
        });
    }

    handleWin() {
        this.gamePhase = 'result';
        this.completeMinigame(30); // Reward
    }

    handleLose(btnCircle) {
        audioManager.playLoseSound();
        btnCircle.setFillStyle(0xF44336); // Red
        this.cameras.main.shake(200, 0.01);

        UIHelper.showFeedbackMessage(this, `¡Era ${this.targetCount}!`, 'error', () => {
            this.scene.restart();
        });
    }

    createPikachuSprite(x, y) {
        // Create a container for Pikachu parts
        const container = this.add.container(x, y);

        // Body (Yellow circle)
        const body = this.add.circle(0, 0, 50, 0xFFD700); // Gold yellow

        // Ears (Black triangles/circles on top)
        const leftEar = this.add.triangle(-30, -40, 0, 20, -10, -20, 10, -20, 0x000000);
        const rightEar = this.add.triangle(30, -40, 0, 20, -10, -20, 10, -20, 0x000000);

        // Ear tips (Yellow)
        const leftEarTip = this.add.circle(-30, -50, 8, 0xFFD700);
        const rightEarTip = this.add.circle(30, -50, 8, 0xFFD700);

        // Cheeks (Red circles)
        const leftCheek = this.add.circle(-25, 5, 12, 0xFF6B6B);
        const rightCheek = this.add.circle(25, 5, 12, 0xFF6B6B);

        // Eyes (Black dots)
        const leftEye = this.add.circle(-15, -10, 5, 0x000000);
        const rightEye = this.add.circle(15, -10, 5, 0x000000);

        // Mouth (Simple black arc as a line)
        const mouth = this.add.graphics();
        mouth.lineStyle(3, 0x000000);
        mouth.beginPath();
        mouth.arc(0, 5, 10, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false);
        mouth.strokePath();

        // Add all parts to container
        container.add([
            leftEarTip, rightEarTip, leftEar, rightEar,
            body,
            leftCheek, rightCheek,
            leftEye, rightEye,
            mouth
        ]);

        container.setSize(100, 100);
        return container;
    }
}
