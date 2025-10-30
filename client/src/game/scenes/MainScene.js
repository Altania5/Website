import Phaser from 'phaser';
import GameStateManager from '../managers/GameStateManager';
import InputManager from '../managers/InputManager';
import ParticleManager from '../managers/ParticleManager';
import TutorialManager from '../managers/TutorialManager';
import QuestManager from '../managers/QuestManager';
import AchievementManager from '../managers/AchievementManager';
import NotificationManager from '../managers/NotificationManager';
import StatsManager from '../managers/StatsManager';
import Generator from '../objects/Generator';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#0f172a');

    // Get socket from registry
    this.socket = this.registry.get('socket');

    try {
      // Initialize managers
      this.gameStateManager = new GameStateManager(this, this.socket);
      this.inputManager = new InputManager(this);
      this.particleManager = new ParticleManager(this);
      this.notificationManager = new NotificationManager(this);
      this.statsManager = new StatsManager(this);
      this.questManager = new QuestManager(this);
      this.achievementManager = new AchievementManager(this);
      this.tutorialManager = new TutorialManager(this);

      // Get initial game state
      this.gameState = this.gameStateManager.getGameState() || {};

      // Create game elements
      this.createPlanet();
      this.createBaseGrid();
      this.createGenerators();

      // Setup event listeners
      this.setupEventListeners();

      // Start tutorial if not complete
      if (!this.tutorialManager.isTutorialComplete()) {
        this.time.delayedCall(1000, () => {
          this.tutorialManager.start();
        });
      }
    } catch (error) {
      console.error('Error in MainScene create:', error);
      // Show error message
      this.add.text(640, 360, 'Game initialization failed', {
        fontSize: '24px',
        color: '#ef4444',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }
  }
  
  createPlanet() {
    const planetType = this.gameState.location?.planet?.toLowerCase() || 'zwamsha';
    const planetKey = `planet-${planetType}`;
    
    this.planet = this.add.sprite(640, 360, planetKey)
      .setInteractive()
      .setScale(2)
      .on('pointerdown', () => this.harvestPlanet());
      
    // Idle animation - gentle rotation
    this.tweens.add({
      targets: this.planet,
      angle: 360,
      duration: 60000,
      repeat: -1,
      ease: 'Linear'
    });
    
    // Add planet name label
    this.planetLabel = this.add.text(640, 500, this.gameState.location?.planet || 'Unknown Planet', {
      fontSize: '16px',
      color: '#e2e8f0',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Add hover effect
    this.planet.on('pointerover', () => {
      this.tweens.add({
        targets: this.planet,
        scale: 2.1,
        duration: 200,
        ease: 'Power2'
      });
    });
    
    this.planet.on('pointerout', () => {
      this.tweens.add({
        targets: this.planet,
        scale: 2,
        duration: 200,
        ease: 'Power2'
      });
    });
  }
  
  createBaseGrid() {
    // Create isometric-style base grid on the left side
    this.baseGrid = this.add.grid(200, 360, 300, 300, 32, 32, 0x1e293b, 0.2);
    
    // Add grid lines for better visibility
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x374151, 0.3);
    
    for (let i = 0; i <= 10; i++) {
      const x = 50 + i * 30;
      const y = 210 + i * 30;
      graphics.moveTo(x, 210);
      graphics.lineTo(x, 510);
      graphics.moveTo(50, y);
      graphics.lineTo(350, y);
    }
    graphics.strokePath();
  }
  
  setupEventListeners() {
    // Listen for game state changes
    this.events.on('gameStateChanged', (state) => {
      this.gameState = state;
      this.updateGenerators();

      // Check quests and achievements
      if (this.questManager) {
        this.questManager.checkProgress(state);
      }
      if (this.achievementManager) {
        this.achievementManager.checkAchievements(state, this.statsManager?.getStats());
      }
    });

    // Listen for harvest results
    this.events.on('harvestResult', (result) => {
      if (result.success) {
        // Show visual feedback
        this.particleManager.showFloatingNumber(
          this.planet.x,
          this.planet.y,
          `+${result.altanerite} Altanerite`,
          '#8b5cf6'
        );

        // Track stats
        if (this.statsManager) {
          this.statsManager.trackHarvest(
            this.gameState?.location?.planet || 'Unknown',
            { altanerite: result.altanerite }
          );
        }

        // Track quest progress
        if (this.questManager) {
          this.questManager.trackAction('harvest');
        }

        // Check tutorial progress
        if (this.tutorialManager) {
          this.tutorialManager.checkObjective('harvest');
          this.tutorialManager.checkObjective('harvest_5');
        }
      }
    });

    // Listen for generator purchase results
    this.events.on('buyResult', (result) => {
      if (result.success && result.generatorType) {
        // Track stats
        if (this.statsManager) {
          this.statsManager.trackGeneratorPurchase(
            result.generatorType,
            result.cost || {}
          );
        }

        // Track quest progress
        if (this.questManager) {
          this.questManager.trackAction('build_generator');
        }

        // Check tutorial progress
        if (this.tutorialManager) {
          this.tutorialManager.checkObjective('buy_solar');
        }

        // Show celebration effect
        if (this.particleManager) {
          this.particleManager.playHarvestEffect(640, 300, 'energy');
          this.showMessage(`Generator built! 🎉`, '#10b981');
        }
      }
    });

    // Listen for quest events
    this.events.on('questCompleted', (quest) => {
      if (this.statsManager) {
        this.statsManager.trackQuestComplete();
      }
    });

    this.events.on('questProgress', (quest) => {
      // Update UI could happen here
    });

    // Listen for achievement events
    this.events.on('achievementUnlocked', (achievement) => {
      if (this.statsManager) {
        this.statsManager.trackAchievementUnlock();
      }
    });

    // Listen for tutorial completion
    this.events.on('tutorialComplete', () => {
      if (this.statsManager) {
        this.statsManager.markTutorialComplete();
      }
      if (this.achievementManager) {
        this.achievementManager.checkAchievements(this.gameState, this.statsManager.getStats());
      }
    });

    // Listen for notifications
    this.events.on('showNotification', (config) => {
      if (this.notificationManager) {
        this.notificationManager.showNotification(config);
      }
    });

    this.events.on('showAchievement', (config) => {
      if (this.notificationManager) {
        this.notificationManager.showNotification({
          ...config,
          type: 'achievement',
          duration: 5000
        });
      }
    });

    // Add keyboard controls
    this.input.keyboard.on('keydown-SPACE', () => {
      this.harvestPlanet();
    });

    this.input.keyboard.on('keydown-G', () => {
      if (this.questManager) {
        this.questManager.trackAction('visit_galaxy');
      }
      if (this.tutorialManager) {
        this.tutorialManager.checkObjective('open_galaxy');
      }
      this.scene.start('GalaxyScene');
    });

    this.input.keyboard.on('keydown-H', () => {
      this.harvestPlanet();
    });

    this.input.keyboard.on('keydown-M', () => {
      this.showMessage('Military forces: ' + (this.gameState?.fleet?.alexandriteArmy?.count || 0), '#ef4444');
    });

    this.input.keyboard.on('keydown-I', () => {
      this.showMessage('Inventory: ' + Object.keys(this.gameState?.inventory || {}).length + ' items', '#8b5cf6');
    });

    this.input.keyboard.on('keydown-E', () => {
      const energyRate = this.gameStateManager.getProductionRate('energy');
      this.showMessage(`Energy production: ${energyRate.toFixed(1)}/s`, '#fbbf24');
    });

    this.input.keyboard.on('keydown-Q', () => {
      // Show quest panel
      this.showQuestPanel();
    });

    this.input.keyboard.on('keydown-A', () => {
      // Show achievement panel
      this.showAchievementPanel();
    });
  }
  
  createGenerators() {
    this.generators = [];
    
    if (this.gameState.generators) {
      const generatorTypes = ['solar', 'miner', 'reactor'];
      let generatorIndex = 0;
      
      generatorTypes.forEach(type => {
        const count = this.gameState.generators[type] || 0;
        for (let i = 0; i < count; i++) {
          const x = 100 + (generatorIndex % 5) * 40;
          const y = 300 + Math.floor(generatorIndex / 5) * 40;
          
          const generator = new Generator(this, x, y, type);
          this.generators.push(generator);
          generatorIndex++;
        }
      });
    }
  }
  
  harvestPlanet() {
    if (!this.gameStateManager.isOnPlanet()) {
      this.showMessage('You must be on a planet to harvest!', '#ef4444');
      return;
    }
    
    // Use game state manager to harvest
    const success = this.gameStateManager.harvestPlanet();
    
    if (success) {
      // Visual feedback
      this.particleManager.playClickEffect(this.planet.x, this.planet.y, 1);
      
      // Play sound if available (disabled for now)
      // if (this.sound.get('harvest')) {
      //   this.sound.play('harvest');
      // }
      
      // Pulse animation
      this.tweens.add({
        targets: this.planet,
        scale: 2.2,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
    }
  }
  
  showFloatingNumber(text, color = '#facc15') {
    this.particleManager.showFloatingNumber(this.planet.x, this.planet.y, text, color);
  }
  
  showMessage(text, color = '#e2e8f0') {
    const message = this.add.text(640, 100, text, {
      fontSize: '18px',
      color: color,
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: message,
      alpha: 0,
      duration: 3000,
      onComplete: () => message.destroy()
    });
  }
  
  updateGenerators() {
    // Update generator count based on game state
    if (this.gameState.generators) {
      // Clear existing generators
      this.generators.forEach(gen => gen.destroy());
      this.generators = [];

      // Recreate generators
      this.createGenerators();

      // Update production effects
      this.generators.forEach(gen => {
        gen.updateProduction(this.gameState);
      });
    }
  }

  showQuestPanel() {
    if (!this.questManager) return;

    const activeQuests = this.questManager.getActiveQuests();

    if (activeQuests.length === 0) {
      this.showMessage('No active quests. Keep playing to unlock more!', '#10b981');
      return;
    }

    // Create quest panel
    const panel = this.add.container(640, 360).setDepth(1500);

    const bg = this.add.rectangle(0, 0, 600, 400, 0x1e293b, 0.95)
      .setStrokeStyle(3, 0x10b981);

    const title = this.add.text(0, -170, 'Active Quests', {
      fontSize: '24px',
      color: '#10b981',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    panel.add([bg, title]);

    // Display each quest
    activeQuests.slice(0, 4).forEach((quest, index) => {
      const yPos = -120 + (index * 80);
      const progressPercent = Math.min(100, Math.floor((quest.progress / quest.target) * 100));

      const questBg = this.add.rectangle(0, yPos, 550, 70, 0x334155, 0.8);

      const questIcon = this.add.text(-250, yPos - 10, quest.icon, {
        fontSize: '24px'
      }).setOrigin(0, 0.5);

      const questTitle = this.add.text(-220, yPos - 15, quest.title, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const questDesc = this.add.text(-220, yPos + 5, quest.description, {
        fontSize: '12px',
        color: '#cbd5e1',
        fontFamily: 'Arial'
      }).setOrigin(0, 0.5);

      const progressText = this.add.text(220, yPos, `${progressPercent}%`, {
        fontSize: '14px',
        color: '#10b981',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(1, 0.5);

      panel.add([questBg, questIcon, questTitle, questDesc, progressText]);
    });

    // Close button
    const closeBtn = this.add.rectangle(0, 170, 120, 40, 0x3b82f6)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => panel.destroy());

    const closeBtnText = this.add.text(0, 170, 'Close', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    panel.add([closeBtn, closeBtnText]);

    // Auto-close after 10 seconds
    this.time.delayedCall(10000, () => {
      if (panel.active) panel.destroy();
    });
  }

  showAchievementPanel() {
    if (!this.achievementManager) return;

    const achievements = this.achievementManager.getAchievements();
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;

    // Create achievement panel
    const panel = this.add.container(640, 360).setDepth(1500);

    const bg = this.add.rectangle(0, 0, 600, 450, 0x1e293b, 0.95)
      .setStrokeStyle(3, 0xfbbf24);

    const title = this.add.text(0, -200, 'Achievements', {
      fontSize: '24px',
      color: '#fbbf24',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const progressText = this.add.text(0, -170, `${unlockedCount} / ${totalCount} Unlocked`, {
      fontSize: '14px',
      color: '#94a3b8',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    panel.add([bg, title, progressText]);

    // Display recent achievements (unlocked + some locked)
    const displayAchievements = [
      ...achievements.filter(a => a.unlocked).slice(0, 3),
      ...achievements.filter(a => !a.unlocked).slice(0, 2)
    ].slice(0, 5);

    displayAchievements.forEach((achievement, index) => {
      const yPos = -120 + (index * 70);

      const achBg = this.add.rectangle(0, yPos, 550, 60, 0x334155, achievement.unlocked ? 0.8 : 0.4);

      const achIcon = this.add.text(-250, yPos, achievement.icon, {
        fontSize: '24px',
        alpha: achievement.unlocked ? 1 : 0.4
      }).setOrigin(0, 0.5);

      const achTitle = this.add.text(-220, yPos - 8, achievement.title, {
        fontSize: '14px',
        color: achievement.unlocked ? '#ffffff' : '#64748b',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const achDesc = this.add.text(-220, yPos + 10, achievement.description, {
        fontSize: '11px',
        color: achievement.unlocked ? '#cbd5e1' : '#475569',
        fontFamily: 'Arial'
      }).setOrigin(0, 0.5);

      const status = this.add.text(220, yPos, achievement.unlocked ? '✓' : `${Math.floor(achievement.progress * 100)}%`, {
        fontSize: '16px',
        color: achievement.unlocked ? '#10b981' : '#64748b',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(1, 0.5);

      panel.add([achBg, achIcon, achTitle, achDesc, status]);
    });

    // Close button
    const closeBtn = this.add.rectangle(0, 195, 120, 40, 0x3b82f6)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => panel.destroy());

    const closeBtnText = this.add.text(0, 195, 'Close', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    panel.add([closeBtn, closeBtnText]);

    // Auto-close after 10 seconds
    this.time.delayedCall(10000, () => {
      if (panel.active) panel.destroy();
    });
  }

  update(time, delta) {
    // Update any animations or effects
    if (this.planet) {
      // Subtle breathing effect
      const breathScale = 2 + Math.sin(time * 0.001) * 0.05;
      this.planet.setScale(breathScale);
    }

    // Periodic checks for achievements and quests
    if (this.gameState && time % 5000 < delta) {
      if (this.questManager) {
        this.questManager.checkProgress(this.gameState);
      }
      if (this.achievementManager && this.statsManager) {
        this.achievementManager.checkAchievements(this.gameState, this.statsManager.getStats());
      }
    }
  }
}
