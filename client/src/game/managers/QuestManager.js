export default class QuestManager {
  constructor(scene) {
    this.scene = scene;
    this.activeQuests = [];
    this.completedQuests = [];

    // Load saved progress
    this.loadProgress();

    // Define all quests
    this.allQuests = this.defineQuests();

    // Initialize active quests
    this.initializeQuests();
  }

  defineQuests() {
    return [
      // Beginner quests
      {
        id: 'first_harvest',
        title: 'First Harvest',
        description: 'Harvest a planet for the first time',
        type: 'harvest',
        target: 1,
        reward: { energy: 50 },
        icon: '🌍',
        tier: 1
      },
      {
        id: 'harvest_10',
        title: 'Resource Gatherer',
        description: 'Harvest 10 times',
        type: 'harvest',
        target: 10,
        reward: { energy: 100, altanerite: 50 },
        icon: '⛏️',
        tier: 1,
        prerequisite: 'first_harvest'
      },
      {
        id: 'first_generator',
        title: 'Power Up',
        description: 'Build your first generator',
        type: 'build_generator',
        target: 1,
        reward: { energy: 100 },
        icon: '⚡',
        tier: 1
      },
      {
        id: 'five_generators',
        title: 'Industrial Complex',
        description: 'Own 5 generators of any type',
        type: 'own_generators',
        target: 5,
        reward: { energy: 500, altanerite: 200 },
        icon: '🏭',
        tier: 2,
        prerequisite: 'first_generator'
      },
      {
        id: 'energy_producer',
        title: 'Energy Producer',
        description: 'Reach 10 energy per second production',
        type: 'production_rate',
        resource: 'energy',
        target: 10,
        reward: { altanerite: 500 },
        icon: '🔋',
        tier: 2
      },
      {
        id: 'reach_1000_energy',
        title: 'Power Reservoir',
        description: 'Accumulate 1,000 energy',
        type: 'resource_total',
        resource: 'energy',
        target: 1000,
        reward: { altanerite: 300 },
        icon: '💡',
        tier: 2
      },
      {
        id: 'reach_500_altanerite',
        title: 'Mineral Wealth',
        description: 'Accumulate 500 Altanerite',
        type: 'resource_total',
        resource: 'altanerite',
        target: 500,
        reward: { energy: 1000 },
        icon: '💎',
        tier: 2
      },
      {
        id: 'visit_galaxy_map',
        title: 'Space Explorer',
        description: 'Open the Galaxy Map',
        type: 'visit_galaxy',
        target: 1,
        reward: { energy: 200, altanerite: 100 },
        icon: '🗺️',
        tier: 1
      },
      {
        id: 'visit_three_planets',
        title: 'World Traveler',
        description: 'Travel to 3 different planets',
        type: 'visit_planets',
        target: 3,
        reward: { energy: 1000, altanerite: 500, homainionite: 100 },
        icon: '🚀',
        tier: 2,
        prerequisite: 'visit_galaxy_map'
      },
      {
        id: 'ten_generators',
        title: 'Mega Factory',
        description: 'Own 10 generators total',
        type: 'own_generators',
        target: 10,
        reward: { energy: 2000, altanerite: 1000 },
        icon: '🏗️',
        tier: 3,
        prerequisite: 'five_generators'
      },
      {
        id: 'reach_10000_energy',
        title: 'Energy Empire',
        description: 'Accumulate 10,000 energy',
        type: 'resource_total',
        resource: 'energy',
        target: 10000,
        reward: { altanerite: 5000 },
        icon: '⚡',
        tier: 3
      },
      {
        id: 'balanced_production',
        title: 'Balanced Economy',
        description: 'Have at least 1 of each generator type',
        type: 'generator_diversity',
        target: { solar: 1, miner: 1, reactor: 1 },
        reward: { energy: 1500, altanerite: 1500 },
        icon: '⚖️',
        tier: 2
      }
    ];
  }

  initializeQuests() {
    // Activate quests that don't have prerequisites or whose prerequisites are met
    this.allQuests.forEach(quest => {
      if (this.completedQuests.includes(quest.id)) {
        return; // Already completed
      }

      if (!quest.prerequisite || this.completedQuests.includes(quest.prerequisite)) {
        if (!this.activeQuests.find(q => q.id === quest.id)) {
          this.activateQuest(quest);
        }
      }
    });
  }

  activateQuest(quest) {
    const activeQuest = {
      ...quest,
      progress: 0,
      startTime: Date.now()
    };

    this.activeQuests.push(activeQuest);
    this.saveProgress();

    // Emit quest activated event
    this.scene.events.emit('questActivated', activeQuest);
  }

  checkProgress(gameState) {
    this.activeQuests.forEach(quest => {
      const newProgress = this.calculateProgress(quest, gameState);

      if (newProgress !== quest.progress) {
        quest.progress = newProgress;
        this.scene.events.emit('questProgress', quest);

        if (quest.progress >= quest.target) {
          this.completeQuest(quest);
        }
      }
    });

    this.saveProgress();
  }

  calculateProgress(quest, gameState) {
    switch (quest.type) {
      case 'harvest':
        // Track in external counter
        return quest.progress || 0;

      case 'build_generator':
        return quest.progress || 0;

      case 'own_generators':
        const totalGens = (gameState?.generators?.solarPanels || 0) +
                         (gameState?.generators?.miners || 0) +
                         (gameState?.generators?.reactors || 0);
        return totalGens;

      case 'production_rate':
        // Calculate from game state manager
        const rate = this.scene.gameStateManager?.getProductionRate(quest.resource) || 0;
        return rate;

      case 'resource_total':
        return gameState?.resources?.[quest.resource] || 0;

      case 'visit_galaxy':
        return quest.progress || 0;

      case 'visit_planets':
        return quest.progress || 0;

      case 'generator_diversity':
        const solar = gameState?.generators?.solarPanels || 0;
        const miner = gameState?.generators?.miners || 0;
        const reactor = gameState?.generators?.reactors || 0;

        if (solar >= 1 && miner >= 1 && reactor >= 1) {
          return quest.target; // Complete
        }
        return 0;

      default:
        return quest.progress || 0;
    }
  }

  trackAction(action, data = {}) {
    this.activeQuests.forEach(quest => {
      if (quest.type === action) {
        quest.progress = (quest.progress || 0) + (data.amount || 1);
        this.scene.events.emit('questProgress', quest);

        if (quest.progress >= quest.target) {
          this.completeQuest(quest);
        }
      }
    });

    this.saveProgress();
  }

  completeQuest(quest) {
    // Remove from active
    this.activeQuests = this.activeQuests.filter(q => q.id !== quest.id);

    // Add to completed
    this.completedQuests.push(quest.id);

    // Apply rewards
    this.applyRewards(quest.reward);

    // Save progress
    this.saveProgress();

    // Emit quest completed event
    this.scene.events.emit('questCompleted', quest);

    // Check if new quests should be activated
    this.initializeQuests();

    // Show completion notification
    this.scene.events.emit('showNotification', {
      title: 'Quest Complete!',
      description: `${quest.title}`,
      icon: quest.icon,
      color: '#10b981',
      rewards: quest.reward
    });
  }

  applyRewards(rewards) {
    // Emit reward event for backend to handle
    this.scene.socket?.emit('claim-quest-reward', rewards);
  }

  getActiveQuests() {
    return this.activeQuests;
  }

  getNextQuests() {
    // Return quests that could be activated next (show preview)
    return this.allQuests.filter(quest => {
      return !this.completedQuests.includes(quest.id) &&
             !this.activeQuests.find(q => q.id === quest.id) &&
             (!quest.prerequisite || this.completedQuests.includes(quest.prerequisite));
    }).slice(0, 3); // Show up to 3 upcoming quests
  }

  getCompletionPercentage() {
    return Math.floor((this.completedQuests.length / this.allQuests.length) * 100);
  }

  saveProgress() {
    localStorage.setItem('questProgress', JSON.stringify({
      active: this.activeQuests.map(q => ({ id: q.id, progress: q.progress })),
      completed: this.completedQuests
    }));
  }

  loadProgress() {
    const saved = localStorage.getItem('questProgress');
    if (saved) {
      const data = JSON.parse(saved);
      this.completedQuests = data.completed || [];

      // Will restore progress when quests are initialized
      this.savedActiveProgress = data.active || [];
    }
  }

  resetProgress() {
    this.activeQuests = [];
    this.completedQuests = [];
    localStorage.removeItem('questProgress');
    this.initializeQuests();
  }
}
