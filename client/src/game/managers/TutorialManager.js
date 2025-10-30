export default class TutorialManager {
  constructor(scene) {
    this.scene = scene;
    this.currentStep = 0;
    this.tutorialActive = false;
    this.tutorialComplete = false;
    this.overlay = null;
    this.messageBox = null;
    this.highlightGraphics = null;

    // Load tutorial progress from localStorage
    const savedProgress = localStorage.getItem('tutorialProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      this.tutorialComplete = progress.complete || false;
      this.currentStep = progress.step || 0;
    }

    // Tutorial steps definition
    this.steps = [
      {
        message: "Welcome to Altanian Conqueror! Click on the planet to harvest resources.",
        highlight: 'planet',
        objective: 'harvest',
        position: { x: 640, y: 600 }
      },
      {
        message: "Great! You earned Altanerite. Now try harvesting 5 more times to build up resources.",
        objective: 'harvest_5',
        position: { x: 640, y: 600 }
      },
      {
        message: "Excellent! Resources are used to buy generators. Let's buy your first Solar Panel for passive energy production.",
        highlight: 'generator_solar',
        objective: 'buy_solar',
        position: { x: 1100, y: 100 }
      },
      {
        message: "Perfect! Your Solar Panel now produces energy automatically. Check the production rate at the top of the screen.",
        position: { x: 300, y: 150 },
        highlight: 'resources',
        objective: 'wait',
        duration: 5000
      },
      {
        message: "With more resources, you can buy Miners (produce Altanerite) and Reactors (produce more energy).",
        position: { x: 1100, y: 200 },
        objective: 'acknowledge'
      },
      {
        message: "Press 'G' or click Galaxy Map to travel between planets. Different planets have different resources!",
        position: { x: 640, y: 650 },
        highlight: 'galaxy_button',
        objective: 'acknowledge'
      },
      {
        message: "Tutorial complete! Check your achievements and quests for goals to work towards. Have fun conquering the galaxy!",
        position: { x: 640, y: 360 },
        objective: 'complete'
      }
    ];
  }

  start() {
    if (this.tutorialComplete) return;

    this.tutorialActive = true;
    this.createOverlay();
    this.showStep(this.currentStep);
  }

  createOverlay() {
    // Semi-transparent overlay
    this.overlay = this.scene.add.rectangle(0, 0, 1280, 720, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setDepth(1000)
      .setInteractive();

    // Highlight graphics
    this.highlightGraphics = this.scene.add.graphics()
      .setDepth(1001);
  }

  showStep(stepIndex) {
    if (stepIndex >= this.steps.length) {
      this.completeTutorial();
      return;
    }

    const step = this.steps[stepIndex];

    // Clear previous highlights
    if (this.highlightGraphics) {
      this.highlightGraphics.clear();
    }

    // Destroy previous message box
    if (this.messageBox) {
      this.messageBox.destroy();
    }

    // Create message box
    this.messageBox = this.createMessageBox(step.message, step.position);

    // Create highlight if specified
    if (step.highlight) {
      this.createHighlight(step.highlight);
    }

    // Handle auto-progression for wait objectives
    if (step.objective === 'wait' && step.duration) {
      this.scene.time.delayedCall(step.duration, () => {
        this.nextStep();
      });
    }
  }

  createMessageBox(text, position) {
    const container = this.scene.add.container(position.x, position.y)
      .setDepth(1002);

    // Background
    const bg = this.scene.add.rectangle(0, 0, 500, 120, 0x1e293b, 0.95)
      .setStrokeStyle(2, 0x3b82f6);

    // Text
    const messageText = this.scene.add.text(0, -20, text, {
      fontSize: '16px',
      color: '#e2e8f0',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 460 }
    }).setOrigin(0.5);

    // Next button for acknowledge objectives
    const currentStep = this.steps[this.currentStep];
    if (currentStep.objective === 'acknowledge' || currentStep.objective === 'complete') {
      const button = this.scene.add.rectangle(0, 35, 120, 35, 0x3b82f6)
        .setStrokeStyle(1, 0x60a5fa)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.nextStep())
        .on('pointerover', () => button.setFillStyle(0x2563eb))
        .on('pointerout', () => button.setFillStyle(0x3b82f6));

      const buttonText = this.scene.add.text(0, 35,
        currentStep.objective === 'complete' ? 'Start Playing!' : 'Got it!', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      container.add([bg, messageText, button, buttonText]);
    } else {
      container.add([bg, messageText]);
    }

    // Pulse animation
    this.scene.tweens.add({
      targets: container,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return container;
  }

  createHighlight(elementType) {
    let x, y, width, height;

    switch (elementType) {
      case 'planet':
        x = 640;
        y = 360;
        width = 200;
        height = 200;
        break;
      case 'generator_solar':
        x = 1150;
        y = 80;
        width = 180;
        height = 40;
        break;
      case 'resources':
        x = 180;
        y = 60;
        width = 250;
        height = 60;
        break;
      case 'galaxy_button':
        x = 640;
        y = 680;
        width = 150;
        height = 40;
        break;
      default:
        return;
    }

    // Draw highlight circle/box
    this.highlightGraphics.lineStyle(3, 0x3b82f6, 1);
    this.highlightGraphics.strokeRoundedRect(
      x - width / 2,
      y - height / 2,
      width,
      height,
      10
    );

    // Animated glow effect
    this.scene.tweens.add({
      targets: this.highlightGraphics,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  checkObjective(objective, data = {}) {
    if (!this.tutorialActive) return;

    const currentStep = this.steps[this.currentStep];

    if (currentStep.objective === objective) {
      // Handle multi-count objectives
      if (objective === 'harvest_5') {
        if (!this.harvestCount) this.harvestCount = 0;
        this.harvestCount++;

        if (this.harvestCount >= 5) {
          this.nextStep();
        } else {
          // Update message to show progress
          if (this.messageBox) {
            const textObj = this.messageBox.list.find(child => child.type === 'Text' && child.text.includes('harvest'));
            if (textObj) {
              textObj.setText(`Great! Harvest ${5 - this.harvestCount} more times. (${this.harvestCount}/5)`);
            }
          }
        }
      } else {
        this.nextStep();
      }
    }
  }

  nextStep() {
    this.currentStep++;
    this.saveTutorialProgress();

    if (this.currentStep >= this.steps.length) {
      this.completeTutorial();
    } else {
      this.showStep(this.currentStep);
    }
  }

  completeTutorial() {
    this.tutorialActive = false;
    this.tutorialComplete = true;

    // Clean up tutorial UI
    if (this.overlay) this.overlay.destroy();
    if (this.messageBox) this.messageBox.destroy();
    if (this.highlightGraphics) this.highlightGraphics.destroy();

    // Save completion
    this.saveTutorialProgress();

    // Emit completion event
    this.scene.events.emit('tutorialComplete');

    // Show celebration
    this.scene.events.emit('showAchievement', {
      title: 'Tutorial Complete!',
      description: 'You\'re ready to conquer the galaxy!',
      icon: '🎓'
    });
  }

  skipTutorial() {
    this.completeTutorial();
  }

  resetTutorial() {
    this.currentStep = 0;
    this.tutorialComplete = false;
    this.tutorialActive = false;
    this.harvestCount = 0;
    localStorage.removeItem('tutorialProgress');
  }

  saveTutorialProgress() {
    localStorage.setItem('tutorialProgress', JSON.stringify({
      complete: this.tutorialComplete,
      step: this.currentStep
    }));
  }

  isTutorialActive() {
    return this.tutorialActive;
  }

  isTutorialComplete() {
    return this.tutorialComplete;
  }

  destroy() {
    if (this.overlay) this.overlay.destroy();
    if (this.messageBox) this.messageBox.destroy();
    if (this.highlightGraphics) this.highlightGraphics.destroy();
  }
}
