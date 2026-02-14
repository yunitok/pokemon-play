import Phaser from 'phaser';
import { fadeOutAndSwitch } from '../utils/transition';
import { UIHelper } from '../utils/UIHelper';
import { gameManager } from '../managers/GameManager';
import { audioManager } from '../managers/AudioManager';
import { Difficulty } from '../utils/Difficulty';

export class SnorlaxScene extends Phaser.Scene {
    constructor() {
        super('SnorlaxScene');
    }

    preload() {
        this.load.image('bg_mystery', 'assets/images/bg_mystery.webp');
        this.load.image('snorlax', 'assets/images/snorlax.webp');
        this.load.image('snorlax_2', 'assets/images/snorlax_2.webp');
        this.load.image('snorlax_3', 'assets/images/snorlax_3.webp');
        this.load.image('snorlax_4', 'assets/images/snorlax_4.webp');
    }

    create() {
        // UI Helpers
        const W = this.scale.width;
        const H = this.scale.height;

        this.cameras.main.fadeIn(500, 0, 0, 0);

        if (window.setAppBackground) window.setAppBackground('#000000');
        this.add.image(W / 2, H / 2, 'bg_mystery').setDisplaySize(W, H); // Snorlax Mystery Background

        // Dark Overlay for improved legibility (Requested by user)
        this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0, 0);

        // Header: Standardized
        UIHelper.createHeader(this, {
            title: 'El Misterio de Snorlax',
            helpText: "¡Dale de comer a Snorlax!\n\nSnorlax quiere un número total de comidas.\nYa comió algunas. ¿Cuántas le faltan para llenarse?\n\nEJEMPLO:\nQuiere: 5 manzanas.\nYa comió: 2.\nLe faltan: 3 (porque 2 + 3 = 5)."
        });

        // Snorlax (Center) - Random Image
        const snorlaxKeys = ['snorlax', 'snorlax_2', 'snorlax_3', 'snorlax_4'];
        this.snorlax = this.add.image(W / 2, 280, Phaser.Utils.Array.GetRandom(snorlaxKeys)).setDisplaySize(200, 200);

        // Wake Up Meter (Timer) - Improved visibility
        this.add.text(W / 2, 80, '¡Que no despierte!', { 
            fontSize: '24px', fontFamily: '"Fredoka One", cursive', color: '#FF0000', stroke: '#fff', strokeThickness: 4
        }).setOrigin(0.5);
        this.timerBox = this.add.rectangle(W / 2, 115, 300, 24, 0x000000, 0.5).setStrokeStyle(2, 0xffffff);
        this.timerBar = this.add.rectangle(W / 2 - 148, 115, 0, 20, 0xFF0000).setOrigin(0, 0.5);
        this.wakeProgress = 0;
        this.isGameOver = false;

        // Feedback Text
        this.feedbackText = this.add.text(W / 2, 180, '', {
            fontFamily: '"Fredoka One", cursive', fontSize: '40px', color: '#000', stroke: '#fff', strokeThickness: 4
        }).setOrigin(0.5);

        // Question Text - Moved DOWN below Snorlax
        this.instructionText = this.add.text(W / 2, 430, '', {
            fontFamily: '"Fredoka One", cursive', fontSize: '30px', color: '#000', align: 'center', wordWrap: { width: 700 },
            stroke: '#ffffff', strokeThickness: 3
        }).setOrigin(0.5);

        // Answer Area - Moved DOWN
        this.answerContainer = this.add.container(0, 580);
        
        // Power-up UI (Bottom Left/Right)
        this.createPowerupUI();

        // State for new items
        this.isTimeFrozen = false;
        this.hasShield = false;
        this.activeShieldVisual = null;

        // Start Round
        this.askQuestion();

        // Start Round
        this.askQuestion();
    }

    createPowerupUI() {
        // Potion (Reduce Timer)
        this.createPowerupBtn(80, this.scale.height - 80, 'potion', 'potion', () => this.usePotion(), 0xffffff);

        // Paralizador (Freeze Time)
        this.createPowerupBtn(200, this.scale.height - 80, 'paralizador', 'potion', () => this.useParalyzer(), 0x00FFFF);

        // Lupa (Hint)
        this.createPowerupBtn(320, this.scale.height - 80, 'lupa', 'potion', () => this.useMagnifyingGlass(), 0xFFA500);

        // Escudo (Shield)
        this.createPowerupBtn(this.scale.width - 200, this.scale.height - 80, 'escudo', 'pokeball', () => this.useShield(), 0x00FF00);

        // Pokeball (Auto-Win)
        this.createPowerupBtn(this.scale.width - 80, this.scale.height - 80, 'pokeball', 'pokeball', () => this.usePokeball(), 0xffffff);
    }

    createPowerupBtn(x, y, invKey, imgKey, callback, tint = 0xffffff) {
        const btn = this.add.container(x, y);
        const bg = this.add.circle(0, 0, 45, 0xffffff).setStrokeStyle(3, 0x000)
            .setInteractive({ useHandCursor: true });
        const img = this.add.image(0, 0, imgKey).setDisplaySize(55, 55).setTint(tint);
        
        const count = gameManager.inventory[invKey] || 0;
        const countText = this.add.text(25, 25, `${count}`, { 
            fontSize: '20px', fontFamily: '"Fredoka One", cursive', backgroundColor: '#000', color: '#fff', padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        
        btn.add([bg, img, countText]);
        btn.countText = countText; // Reference
        
        bg.on('pointerdown', callback);

        // Store reference to update count later
        if (!this.powerupBtns) this.powerupBtns = {};
        this.powerupBtns[invKey] = btn;
    }

    updatePowerupCount(invKey) {
        if (this.powerupBtns && this.powerupBtns[invKey]) {
            this.powerupBtns[invKey].countText.setText(`${gameManager.inventory[invKey] || 0}`);
        }
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Timer Logic using Difficulty utility
        const wakeUpSpeed = Difficulty.getSnorlaxWakeSpeed(gameManager.level);
        
        // Only active if Level > 3 AND NOT FROZEN
        if (gameManager.level > 3 && !this.isTimeFrozen) {
            this.wakeProgress += wakeUpSpeed * (delta / 1000);
            
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
        
        // Difficulty Logic from Utility
        const maxTarget = Difficulty.getSnorlaxTarget(gameManager.level);

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

        this.instructionText.setText(`Nivel ${gameManager.level}\nSnorlax quiere ${target} ${currentFood.name}.\nYa se comió ${current}.\n¿Cuántos faltan?`);
        
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
        
        // Store buttons to manipulate later (e.g. Lupa)
        this.answerButtons = [];

        choices.forEach((num, index) => {
            const btn = this.add.container(startX + (index * 150), 0);
            const bg = this.add.circle(0, 0, 40, 0xffffff).setStrokeStyle(4, 0x3B4CCA).setInteractive({ useHandCursor: true });
            const text = this.add.text(0, 0, num.toString(), {
                fontSize: '40px', color: '#3B4CCA', fontFamily: '"Fredoka One", cursive'
            }).setOrigin(0.5);

            btn.add([bg, text]);
            btn.numberValue = num; // Attach value
            btn.bgCircle = bg; // Reference for effects
            
            bg.on('pointerdown', () => this.checkAnswer(num));
            
            // Hover effects
            bg.on('pointerover', () => bg.setFillStyle(0xFFCB05));
            bg.on('pointerout', () => bg.setFillStyle(0xffffff));

            this.answerContainer.add(btn);
            this.answerButtons.push(btn);
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
        audioManager.playWinSound(); // New Audio Manager

        // Reward logic (Centralized)
        gameManager.addCoins(10);
        gameManager.levelUp();

        // Update UI
        this.levelText.setText(`Nivel: ${gameManager.level}`);
        this.feedbackText.setText('¡Excelente! +10 Monedas'); // Fixed Text
        this.feedbackText.setColor('#00ff00');
        
        // Reset Timer completely (Reward)
        this.wakeProgress = 0;
        this.timerBar.width = 0;

        // Reset Freeze
        this.isTimeFrozen = false;
        this.timerBar.setFillStyle(0xFFA500); // Reset color if frozen blue

        // Reset Shield logic? Optional. Maybe shield lasts until used/fails? 
        // Let's keep shield if unused.

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
        // Shield Check
        if (this.hasShield) {
            this.hasShield = false;
            // Visual feedback for shield use
            if (this.activeShieldVisual) {
                this.activeShieldVisual.destroy();
                this.activeShieldVisual = null;
            }
            
            audioManager.playTone(400, 'triangle', 0.3); // New Audio Manager usage for custom tones if needed or standard
            this.feedbackText.setText('¡El Escudo te protegió!');
            this.feedbackText.setColor('#00FF00'); // Green
            
            this.cameras.main.flash(200, 0, 255, 0); // Green flash
            return; // Exit without penalty
        }

        audioManager.playLoseSound();
        this.feedbackText.setText('¡Ups! Snorlax se mueve...');
        this.feedbackText.setColor('#ff0000');
        this.cameras.main.shake(200, 0.01);
        
        // Penalty: Timer increases significantly
        this.wakeProgress += 0.3;
        this.timerBar.width = Math.min(296, 296 * this.wakeProgress);
    }

    usePotion() {
        // Use Manager Action
        if (gameManager.useItem('potion')) {
            this.updatePowerupCount('potion');
            
            // Effect: Reduce wake progress significantly
            this.wakeProgress = Math.max(0, this.wakeProgress - 0.5);
            this.timerBar.width = Math.min(296, 296 * this.wakeProgress); // Fix width update
            
            audioManager.playTone(1000, 'sine', 0.5);
            this.feedbackText.setText('¡Usaste Poción! 💤');
            this.feedbackText.setColor('#4CAF50');
        } else {
             audioManager.playTone(200, 'square', 0.1);
        }
    }
    
    useParalyzer() {
        if (this.isTimeFrozen) return; // Already active

        if (gameManager.useItem('paralizador')) {
            this.updatePowerupCount('paralizador');

            this.isTimeFrozen = true;
            this.timerBar.setFillStyle(0x00FFFF); // Blue bar to indicate frozen

            audioManager.playTone(1200, 'sine', 0.5);
            this.feedbackText.setText('¡Tiempo Congelado! ❄️');
            this.feedbackText.setColor('#00FFFF');

            // Unfreeze after 5 seconds
            this.time.delayedCall(5000, () => {
                this.isTimeFrozen = false;
                this.timerBar.setFillStyle(0xFFA500); // Reset color
            });
        }
    }
    
    useShield() {
         if (this.hasShield) return; // Already active

        if (gameManager.useItem('escudo')) {
            this.updatePowerupCount('escudo');

            this.hasShield = true;
            
            audioManager.playTone(600, 'sine', 0.3);
            this.feedbackText.setText('¡Escudo Activado! 🛡️');
            this.feedbackText.setColor('#00FF00');

            // Add a visual indicator (Icon above Snorlax or UI)
            this.activeShieldVisual = this.add.image(this.scale.width / 2 + 120, 300, 'pokeball')
                .setTint(0x00FF00)
                .setDisplaySize(40, 40)
                .setAlpha(0.8);
                
            this.tweens.add({
                targets: this.activeShieldVisual,
                y: 290,
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
        }
    }

    useMagnifyingGlass() {
        if (gameManager.useItem('lupa')) {
            // Find correct button
            const correctBtn = this.answerButtons.find(btn => btn.numberValue === this.correctAnswer);
            if (!correctBtn) return;

            this.updatePowerupCount('lupa');

            audioManager.playTone(1500, 'sine', 0.3);
            
            // Highlight effect
            this.tweens.add({
                targets: correctBtn.bgCircle,
                scale: 1.2,
                duration: 200,
                yoyo: true,
                repeat: 3,
                onStart: () => correctBtn.bgCircle.setStrokeStyle(6, 0xFFA500)
            });
        }
    }

    usePokeball() {
        if (gameManager.useItem('pokeball')) {
            this.updatePowerupCount('pokeball');
            // Effect: Auto win
            this.handleWin();
        }
    }

    gameOver() {

        this.isGameOver = true;
        this.feedbackText.setText('¡Snorlax DESPERTÓ!');
        this.feedbackText.setColor('#ff0000'); // RED TEXT
        audioManager.playLoseSound();
        
        // Reset Level penalty
        gameManager.levelDown(); // Safer decrement

        this.time.delayedCall(3000, () => {
            fadeOutAndSwitch(this, 'MenuScene');
        });
    }

    addHelp(helpText) {
        // Standard Help Button from UIHelper
        UIHelper.createHelpButton(this, () => this.showHelp(helpText));
    }

    showHelp(text) {
        const container = this.add.container(0, 0).setDepth(2000).setScrollFactor(0);
        
        // Background overlay
        const bg = this.add.rectangle(this.cameras.main.width/2, this.cameras.main.height/2, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8)
            .setInteractive(); // Block clicks below
            
        // 1. Setup Content Width
        const boxW = 650;
        const padding = 30;
        const internalWidth = boxW - (padding * 2);
        
        // 2. Create Text Objects FIRST to measure
        // Title
        const title = this.add.text(0, 0, 'AYUDA', {
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#FFD700'
        }).setOrigin(0.5);

        // Content Text
        const content = this.add.text(0, 0, text, {
            fontSize: '26px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: internalWidth },
            lineSpacing: 8
        }).setOrigin(0.5);

        // Close Button
        const closeBtn = this.add.text(0, 0, 'ENTENDIDO', {
            fontSize: '28px',
            backgroundColor: '#4CAF50',
            padding: { x: 30, y: 10 },
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // 3. Calculate Heights & Positions
        const gapTitle = 20;
        const gapBtn = 30;
        
        // Total Height Calculation
        const totalContentHeight = title.height + gapTitle + content.height + gapBtn + closeBtn.height;
        const boxH = totalContentHeight + (padding * 2);
        
        // Center Position
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // 4. Draw Box
        const box = this.add.rectangle(centerX, centerY, boxW, boxH, 0x333333).setStrokeStyle(4, 0xffffff);
        
        // 5. Position Elements relative to CenterY
        // Start Y (Top of content)
        const startY = centerY - (totalContentHeight / 2);
        
        title.setPosition(centerX, startY + title.height/2);
        content.setPosition(centerX, title.y + title.height/2 + gapTitle + content.height/2);
        closeBtn.setPosition(centerX, content.y + content.height/2 + gapBtn + closeBtn.height/2);

        // Close Interaction
        closeBtn.on('pointerdown', () => {
             audioManager.playUiSound();
            this.tweens.add({
                targets: container,
                scaleX: 0, scaleY: 0,
                duration: 200,
                onComplete: () => container.destroy()
            });
        });
        
        // Add to Container
        container.add([bg, box, title, content, closeBtn]);
        
        // Animation
        container.setScale(0);
        this.tweens.add({
            targets: container,
            scaleX: 1, scaleY: 1,
            duration: 200,
            ease: 'Back.out'
        });
    }
}
