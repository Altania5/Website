export default class AchievementManager {
  constructor(scene) {
    this.scene = scene;
    this.unlockedAchievements = [];
    this.achievementProgress = {};

    // Load saved progress
    this.loadProgress();

    // Define all achievements
    this.achievements = this.defineAchievements();
  }

  defineAchievements() {
    return [
      // Harvesting achievements
      {
        id: 'harvester_novice',
        title: 'Novice Harvester',
        description: 'Harvest 50 times',
        category: 'harvesting',
        requirement: { type: 'harvest_count', target: 50 },
        reward: { title: 'Harvester' },
        icon: '🌱',
        rarity: 'common'
      },
      {
        id: 'harvester_expert',
        title: 'Expert Harvester',
        description: 'Harvest 500 times',
        category: 'harvesting',
        requirement: { type: 'harvest_count', target: 500 },
        reward: { title: 'Master Harvester' },
        icon: '🌳',
        rarity: 'rare'
      },
      {
        id: 'harvester_master',
        title: 'Legendary Harvester',
        description: 'Harvest 2,000 times',
        category: 'harvesting',
        requirement: { type: 'harvest_count', target: 2000 },
        reward: { title: 'Legendary Gatherer' },
        icon: '🌲',
        rarity: 'legendary'
      },

      // Generator achievements
      {
        id: 'generator_starter',
        title: 'Power Beginner',
        description: 'Build 5 generators',
        category: 'generators',
        requirement: { type: 'total_generators', target: 5 },
        icon: '⚙️',
        rarity: 'common'
      },
      {
        id: 'generator_baron',
        title: 'Industry Baron',
        description: 'Build 25 generators',
        category: 'generators',
        requirement: { type: 'total_generators', target: 25 },
        icon: '🏭',
        rarity: 'uncommon'
      },
      {
        id: 'generator_tycoon',
        title: 'Industrial Tycoon',
        description: 'Build 100 generators',
        category: 'generators',
        requirement: { type: 'total_generators', target: 100 },
        icon: '🏗️',
        rarity: 'rare'
      },

      // Resource achievements
      {
        id: 'energy_millionaire',
        title: 'Energy Millionaire',
        description: 'Accumulate 1,000,000 total energy',
        category: 'resources',
        requirement: { type: 'total_earned', resource: 'energy', target: 1000000 },
        icon: '💰',
        rarity: 'rare'
      },
      {
        id: 'altanerite_collector',
        title: 'Altanerite Collector',
        description: 'Accumulate 100,000 total Altanerite',
        category: 'resources',
        requirement: { type: 'total_earned', resource: 'altanerite', target: 100000 },
        icon: '💎',
        rarity: 'rare'
      },

      // Production achievements
      {
        id: 'fast_producer',
        title: 'Speed Producer',
        description: 'Reach 100 energy per second',
        category: 'production',
        requirement: { type: 'production_rate', resource: 'energy', target: 100 },
        icon: '⚡',
        rarity: 'uncommon'
      },
      {
        id: 'mega_producer',
        title: 'Mega Producer',
        description: 'Reach 1,000 energy per second',
        category: 'production',
        requirement: { type: 'production_rate', resource: 'energy', target: 1000 },
        icon: '🌟',
        rarity: 'epic'
      },

      // Exploration achievements
      {
        id: 'explorer',
        title: 'System Explorer',
        description: 'Visit all 3 planets in the Zwamsha system',
        category: 'exploration',
        requirement: { type: 'unique_planets', target: 3 },
        icon: '🗺️',
        rarity: 'uncommon'
      },
      {
        id: 'frequent_flyer',
        title: 'Frequent Flyer',
        description: 'Travel between planets 50 times',
        category: 'exploration',
        requirement: { type: 'travel_count', target: 50 },
        icon: '✈️',
        rarity: 'rare'
      },

      // Special achievements
      {
        id: 'first_steps',
        title: 'First Steps',
        description: 'Complete the tutorial',
        category: 'special',
        requirement: { type: 'tutorial_complete' },
        icon: '👶',
        rarity: 'common'
      },
      {
        id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Reach 1,000 energy in under 10 minutes',
        category: 'special',
        requirement: { type: 'speed_run', resource: 'energy', target: 1000, timeLimit: 600000 },
        icon: '🏃',
        rarity: 'epic'
      },
      {
        id: 'dedicated',
        title: 'Dedicated Player',
        description: 'Play for 1 hour total',
        category: 'special',
        requirement: { type: 'play_time', target: 3600000 },
        icon: '⏰',
        rarity: 'uncommon'
      },
      {
        id: 'diversified',
        title: 'Diversified Empire',
        description: 'Own 10+ of each generator type',
        category: 'generators',
        requirement: { type: 'diversified_generators', target: { solar: 10, miner: 10, reactor: 10 } },
        icon: '🌈',
        rarity: 'epic'
      },
      {
        id: 'quest_master',
        title: 'Quest Master',
        description: 'Complete 10 quests',
        category: 'special',
        requirement: { type: 'quests_completed', target: 10 },
        icon: '📜',
        rarity: 'rare'
      }
    ];
  }

  checkAchievements(gameState, stats = {}) {
    this.achievements.forEach(achievement => {
      if (this.unlockedAchievements.includes(achievement.id)) {
        return; // Already unlocked
      }

      const progress = this.calculateProgress(achievement, gameState, stats);
      this.achievementProgress[achievement.id] = progress;

      if (progress >= 1) {
        this.unlockAchievement(achievement);
      }
    });
  }

  calculateProgress(achievement, gameState, stats) {
    const req = achievement.requirement;

    switch (req.type) {
      case 'harvest_count':
        return (stats.totalHarvests || 0) / req.target;

      case 'total_generators':
        const totalGens = (gameState?.generators?.solarPanels || 0) +
                         (gameState?.generators?.miners || 0) +
                         (gameState?.generators?.reactors || 0);
        return totalGens / req.target;

      case 'total_earned':
        return (stats[`total_${req.resource}_earned`] || 0) / req.target;

      case 'production_rate':
        const rate = this.scene.gameStateManager?.getProductionRate(req.resource) || 0;
        return rate / req.target;

      case 'unique_planets':
        return (stats.uniquePlanetsVisited?.length || 0) / req.target;

      case 'travel_count':
        return (stats.totalTravels || 0) / req.target;

      case 'tutorial_complete':
        return stats.tutorialComplete ? 1 : 0;

      case 'speed_run':
        if (stats.playTime <= req.timeLimit && (gameState?.resources?.[req.resource] || 0) >= req.target) {
          return 1;
        }
        return 0;

      case 'play_time':
        return (stats.totalPlayTime || 0) / req.target;

      case 'diversified_generators':
        const solar = gameState?.generators?.solarPanels || 0;
        const miner = gameState?.generators?.miners || 0;
        const reactor = gameState?.generators?.reactors || 0;

        if (solar >= req.target.solar && miner >= req.target.miner && reactor >= req.target.reactor) {
          return 1;
        }
        return Math.min(solar / req.target.solar, miner / req.target.miner, reactor / req.target.reactor);

      case 'quests_completed':
        return (stats.questsCompleted || 0) / req.target;

      default:
        return 0;
    }
  }

  unlockAchievement(achievement) {
    this.unlockedAchievements.push(achievement.id);
    this.saveProgress();

    // Emit achievement unlocked event
    this.scene.events.emit('achievementUnlocked', achievement);

    // Show notification
    this.showAchievementPopup(achievement);

    // Play sound effect if available
    // this.scene.sound.play('achievement');
  }

  showAchievementPopup(achievement) {
    // Emit notification event for UI to handle
    this.scene.events.emit('showNotification', {
      title: 'Achievement Unlocked!',
      description: achievement.title,
      subtitle: achievement.description,
      icon: achievement.icon,
      color: this.getRarityColor(achievement.rarity),
      duration: 5000,
      type: 'achievement'
    });
  }

  getRarityColor(rarity) {
    const colors = {
      common: '#9ca3af',
      uncommon: '#10b981',
      rare: '#3b82f6',
      epic: '#a855f7',
      legendary: '#f59e0b'
    };
    return colors[rarity] || '#ffffff';
  }

  getAchievements() {
    return this.achievements.map(achievement => ({
      ...achievement,
      unlocked: this.unlockedAchievements.includes(achievement.id),
      progress: this.achievementProgress[achievement.id] || 0
    }));
  }

  getUnlockedAchievements() {
    return this.achievements.filter(a => this.unlockedAchievements.includes(a.id));
  }

  getLockedAchievements() {
    return this.achievements.filter(a => !this.unlockedAchievements.includes(a.id));
  }

  getAchievementsByCategory(category) {
    return this.getAchievements().filter(a => a.category === category);
  }

  getCompletionPercentage() {
    return Math.floor((this.unlockedAchievements.length / this.achievements.length) * 100);
  }

  saveProgress() {
    localStorage.setItem('achievements', JSON.stringify({
      unlocked: this.unlockedAchievements,
      progress: this.achievementProgress
    }));
  }

  loadProgress() {
    const saved = localStorage.getItem('achievements');
    if (saved) {
      const data = JSON.parse(saved);
      this.unlockedAchievements = data.unlocked || [];
      this.achievementProgress = data.progress || {};
    }
  }

  resetProgress() {
    this.unlockedAchievements = [];
    this.achievementProgress = {};
    localStorage.removeItem('achievements');
  }
}
