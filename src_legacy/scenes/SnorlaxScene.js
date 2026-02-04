class SnorlaxScene extends Phaser.Scene {
    constructor() {
        super('SnorlaxScene');
    }

    create() {
        // Background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x98FB98).setOrigin(0);

        // Back Button
        const backBtn = this.add.text(20, 20, '⬅ Menú', { 
            fontSize: '24px', 
            fontFamily: 'sans-serif',
            fill: '#000',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('MenuScene'));


        // Snorlax Sprite
        this.snorlax = this.add.image(this.scale.width / 2, 250, 'snorlax');
        this.snorlax.setDisplaySize(200, 200);

        // Instruction Text
        this.instructionText = this.add.text(this.scale.width / 2, 400, '', {
            fontFamily: 'sans-serif',
            fontSize: '28px',
            color: '#333',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        // Feedback Text
        this.feedbackText = this.add.text(this.scale.width / 2, 100, '', {
            fontFamily: 'sans-serif',
            fontSize: '40px',
            color: '#000',
            stroke: '#fff',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Answer Container (Buttons)
        this.answerContainer = this.add.container(0, 500);

        // Mute Button (Re-create or use a global manager next time)
        // this.createMuteButton();

        // Start Game Loop
        this.askQuestion();
    }

    askQuestion() {
        // Clear previous interactions
        this.answerContainer.removeAll(true);
        this.feedbackText.setText('');

        // Logic: "Target - Current = Needed"
        // Let's make it simple for a 7 year old: "Snorlax wants 8 candies. He has 5. How many more does he need?"
        const target = Phaser.Math.Between(5, 10);
        const current = Phaser.Math.Between(1, target - 1);
        this.correctAnswer = target - current;

        this.instructionText.setText(`Snorlax quiere ${target} caramelos.\nYa se comió ${current}.\n¿Cuántos le faltan?`);

        // Visualize "Current" candies being eaten or just shown?
        // Let's animate 'current' candies flying into Snorlax to visualize the "eaten" part
        this.animateEating(current);

        // Generate Options (3 choices usually good)
        this.createNumberOptions();
    }

    animateEating(count) {
        // Spawn temporary candies that fly to Snorlax
        for (let i = 0; i < count; i++) {
            const candy = this.add.image(100 + (i * 40), 100, 'candy').setScale(0.5);
            this.tweens.add({
                targets: candy,
                x: this.snorlax.x,
                y: this.snorlax.y,
                alpha: 0,
                duration: 800,
                delay: i * 200,
                onComplete: () => {
                    candy.destroy();
                    // Optional: munch sound per candy? Too noisy maybe.
                }
            });
        }
    }

    createNumberOptions() {
        // Create 3 choices: correct + 2 wrong
        let choices = [this.correctAnswer];
        while (choices.length < 3) {
            let num = Phaser.Math.Between(1, 9);
            if (!choices.includes(num)) choices.push(num);
        }
        // Shuffle
        choices = Phaser.Utils.Array.Shuffle(choices);

        // Draw Buttons
        const startX = this.scale.width / 2 - 150;
        choices.forEach((num, index) => {
            const btn = this.add.container(startX + (index * 150), 0);
            
            const bg = this.add.circle(0, 0, 40, 0xffffff)
                .setStrokeStyle(4, 0x3B4CCA)
                .setInteractive({ useHandCursor: true });
            
            const text = this.add.text(0, 0, num.toString(), {
                fontSize: '40px',
                color: '#3B4CCA',
                fontFamily: 'sans-serif'
            }).setOrigin(0.5);

            btn.add([bg, text]);

            bg.on('pointerdown', () => {
                this.checkAnswer(num);
            });
            
            // Hover effect
            bg.on('pointerover', () => bg.setFillStyle(0xFFCB05));
            bg.on('pointerout', () => bg.setFillStyle(0xffffff));

            this.answerContainer.add(btn);
        });
    }

    checkAnswer(number) {
        if (number === this.correctAnswer) {
            this.onCorrect();
        } else {
            this.onWrong();
        }
    }

    onCorrect() {
        // this.sound.play('success');
        this.feedbackText.setText('¡Bien!');
        this.feedbackText.setColor('#00ff00');
        
        // Confetti logic (simple particles)
        const particles = this.add.particles(0, 0, 'candy', {
            x: this.scale.width / 2,
            y: 300,
            speed: { min: 200, max: 400 },
            angle: { min: 200, max: 340 },
            gravityY: 500,
            lifespan: 1000,
            quantity: 10,
            scale: { start: 0.5, end: 0 }
        });
        
        // Snorlax Jump
        this.tweens.add({
            targets: this.snorlax,
            y: this.snorlax.y - 50,
            duration: 150,
            yoyo: true,
            repeat: 1
        });

        // Next question delay
        this.time.delayedCall(2000, () => {
             particles.destroy();
             this.askQuestion();
        });
    }

    onWrong() {
        // this.sound.play('fail');
        this.feedbackText.setText('¡Inténtalo de nuevo!');
        this.feedbackText.setColor('#ff0000');

        // Shake camera
        this.cameras.main.shake(200, 0.01);
    }

    /*
    createMuteButton() {
        const { width } = this.scale;
        const muteBtn = this.add.text(width - 50, 30, this.sound.mute ? '🔇' : '🔊', { fontSize: '30px' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        muteBtn.on('pointerdown', () => {
            this.sound.setMute(!this.sound.mute);
            muteBtn.setText(this.sound.mute ? '🔇' : '🔊');
        });
    }
    */
}
