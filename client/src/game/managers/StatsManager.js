export default class StatsManager {
  constructor(scene) {
    this.scene = scene;

    // Initialize stats
    this.stats = {
      // Harvesting stats
      totalHarvests: 0,
      harvestsByPlanet: {},

      // Resource stats
      total_energy_earned: 0,
      total_altanerite_earned: 0,
      total_homainionite_earned: 0,
      total_energy_spent: 0,
      total_altanerite_spent: 0,

      // Generator stats
      totalGeneratorsBought: 0,
      generatorsBoughtByType: {
        solar: 0,
        miner: 0,
        reactor: 0
      },

      // Travel stats
      totalTravels: 0,
      uniquePlanetsVisited: [],

      // Quest stats
      questsCompleted: 0,
      questsActive: 0,

      // Time stats
      sessionStartTime: Date.now(),
      totalPlayTime: 0,
      lastSaveTime: Date.now(),

      // Achievements
      achievementsUnlocked: 0,

      // Tutorial
      tutorialComplete: false,

      // Session stats
      sessionHarvests: 0,
      sessionResourcesEarned: {
        energy: 0,
        altanerite: 0,
        homainionite: 0
      }
    };

    // Load saved stats
    this.loadStats();

    // Start tracking play time
    this.startPlayTimeTracking();
  }

  loadStats() {
    const saved = localStorage.getItem('playerStats');
    if (saved) {
      const savedStats = JSON.parse(saved);
      this.stats = { ...this.stats, ...savedStats };

      // Reset session-specific stats
      this.stats.sessionStartTime = Date.now();
      this.stats.sessionHarvests = 0;
      this.stats.sessionResourcesEarned = { energy: 0, altanerite: 0, homainionite: 0 };
    }
  }

  saveStats() {
    // Update total play time before saving
    this.updatePlayTime();

    localStorage.setItem('playerStats', JSON.stringify(this.stats));
  }

  startPlayTimeTracking() {
    // Update play time every 30 seconds
    this.playTimeInterval = setInterval(() => {
      this.updatePlayTime();
      this.saveStats();
    }, 30000);
  }

  updatePlayTime() {
    const now = Date.now();
    const sessionTime = now - this.stats.sessionStartTime;
    this.stats.totalPlayTime += (now - this.stats.lastSaveTime);
    this.stats.lastSaveTime = now;
  }

  // Track harvest action
  trackHarvest(planetName, resources) {
    this.stats.totalHarvests++;
    this.stats.sessionHarvests++;

    // Track by planet
    if (!this.stats.harvestsByPlanet[planetName]) {
      this.stats.harvestsByPlanet[planetName] = 0;
    }
    this.stats.harvestsByPlanet[planetName]++;

    // Track resources earned
    if (resources.energy) {
      this.stats.total_energy_earned += resources.energy;
      this.stats.sessionResourcesEarned.energy += resources.energy;
    }
    if (resources.altanerite) {
      this.stats.total_altanerite_earned += resources.altanerite;
      this.stats.sessionResourcesEarned.altanerite += resources.altanerite;
    }
    if (resources.homainionite) {
      this.stats.total_homainionite_earned += resources.homainionite;
      this.stats.sessionResourcesEarned.homainionite += resources.homainionite;
    }

    this.saveStats();
  }

  // Track generator purchase
  trackGeneratorPurchase(type, cost) {
    this.stats.totalGeneratorsBought++;
    this.stats.generatorsBoughtByType[type] = (this.stats.generatorsBoughtByType[type] || 0) + 1;

    // Track spending
    if (cost.energy) {
      this.stats.total_energy_spent += cost.energy;
    }
    if (cost.altanerite) {
      this.stats.total_altanerite_spent += cost.altanerite;
    }

    this.saveStats();
  }

  // Track planet travel
  trackTravel(planetName) {
    this.stats.totalTravels++;

    // Track unique planets
    if (!this.stats.uniquePlanetsVisited.includes(planetName)) {
      this.stats.uniquePlanetsVisited.push(planetName);
    }

    this.saveStats();
  }

  // Track quest completion
  trackQuestComplete() {
    this.stats.questsCompleted++;
    this.saveStats();
  }

  // Track achievement unlock
  trackAchievementUnlock() {
    this.stats.achievementsUnlocked++;
    this.saveStats();
  }

  // Mark tutorial complete
  markTutorialComplete() {
    this.stats.tutorialComplete = true;
    this.saveStats();
  }

  // Update active quests count
  updateActiveQuests(count) {
    this.stats.questsActive = count;
  }

  // Get stats for display
  getStats() {
    this.updatePlayTime();
    return { ...this.stats };
  }

  // Get session stats
  getSessionStats() {
    return {
      duration: Date.now() - this.stats.sessionStartTime,
      harvests: this.stats.sessionHarvests,
      resources: this.stats.sessionResourcesEarned
    };
  }

  // Get formatted play time
  getFormattedPlayTime() {
    const totalSeconds = Math.floor(this.stats.totalPlayTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Get efficiency metrics
  getEfficiencyMetrics() {
    const playTimeHours = this.stats.totalPlayTime / 3600000;

    return {
      harvestsPerHour: playTimeHours > 0 ? Math.round(this.stats.totalHarvests / playTimeHours) : 0,
      energyPerHour: playTimeHours > 0 ? Math.round(this.stats.total_energy_earned / playTimeHours) : 0,
      altaneritePerHour: playTimeHours > 0 ? Math.round(this.stats.total_altanerite_earned / playTimeHours) : 0
    };
  }

  // Reset stats
  resetStats() {
    this.stats = {
      totalHarvests: 0,
      harvestsByPlanet: {},
      total_energy_earned: 0,
      total_altanerite_earned: 0,
      total_homainionite_earned: 0,
      total_energy_spent: 0,
      total_altanerite_spent: 0,
      totalGeneratorsBought: 0,
      generatorsBoughtByType: { solar: 0, miner: 0, reactor: 0 },
      totalTravels: 0,
      uniquePlanetsVisited: [],
      questsCompleted: 0,
      questsActive: 0,
      sessionStartTime: Date.now(),
      totalPlayTime: 0,
      lastSaveTime: Date.now(),
      achievementsUnlocked: 0,
      tutorialComplete: false,
      sessionHarvests: 0,
      sessionResourcesEarned: { energy: 0, altanerite: 0, homainionite: 0 }
    };

    localStorage.removeItem('playerStats');
  }

  destroy() {
    // Clear interval
    if (this.playTimeInterval) {
      clearInterval(this.playTimeInterval);
    }

    // Save final stats
    this.saveStats();
  }
}
