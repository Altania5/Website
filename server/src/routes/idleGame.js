const express = require("express");
const router = express.Router();
const Game = require("../models/Game");
const User = require("../models/User");

// Altania Lore and Story System
const ALTANIA_LORE = {
  chapters: [
    {
      id: "awakening",
      title: "The Awakening",
      energyRequired: 0,
      lore: "In the depths of space, the ancient nation of Altania slumbers on the planet Zwamsha. Once a mighty empire spanning galaxies, Altania now exists only in fragments, its people scattered and its power diminished. You, the chosen leader, must awaken this sleeping giant and restore its former glory."
    },
    {
      id: "frequency_discovery",
      title: "The Frequency Manipulator",
      energyRequired: 1000,
      lore: "Deep within Zwamsha's core lies the Frequency Manipulator - an ancient device that can convert Altanerite crystals into pure energy. This discovery marks the beginning of Altania's resurgence. The crystals resonate with frequencies that predate recorded history, holding secrets of the old empire."
    },
    {
      id: "first_ship",
      title: "The First Ship",
      energyRequired: 5000,
      lore: "With sufficient energy, you construct Altania's first interstellar vessel. This ship represents more than transportation - it is a symbol of hope, carrying the dreams of a nation ready to reclaim its place among the stars. The ship's design incorporates ancient Altanian technology, making it far more advanced than anything currently known."
    },
    {
      id: "first_conquest",
      title: "The First Conquest",
      energyRequired: 10000,
      lore: "Your first conquest beyond Zwamsha marks a turning point in Altania's history. As you establish control over new worlds, you discover that the galaxy remembers Altania's name. Ancient artifacts and forgotten technologies begin to respond to your presence, as if the universe itself recognizes the return of its rightful rulers."
    },
    {
      id: "empire_reborn",
      title: "Empire Reborn",
      energyRequired: 50000,
      lore: "With multiple worlds under your control, Altania's empire begins to take shape once more. The Frequency Manipulators across conquered worlds create a network of energy that strengthens your nation's power exponentially. You realize that Altania's fall was not an end, but merely a pause - and now the empire awakens to reclaim its destiny."
    }
  ],
  
  worlds: [
    {
      id: "zwamsha",
      name: "Zwamsha",
      energyContribution: 1000,
      description: "The ancestral homeworld of Altania, rich in Altanerite crystals and ancient technology.",
      conquered: true
    },
    {
      id: "nexara",
      name: "Nexara",
      energyContribution: 2500,
      description: "A mineral-rich world with vast deposits of rare metals and energy crystals.",
      conquered: false
    },
    {
      id: "veldris",
      name: "Veldris",
      energyContribution: 5000,
      description: "A gas giant with floating cities and massive energy harvesting stations.",
      conquered: false
    },
    {
      id: "korthos",
      name: "Korthos",
      energyContribution: 10000,
      description: "An ice world containing frozen ancient technology and crystal formations.",
      conquered: false
    },
    {
      id: "zephyria",
      name: "Zephyria",
      energyContribution: 20000,
      description: "A storm-wracked world where energy flows like rivers through the atmosphere.",
      conquered: false
    }
  ]
};

// Convert game state to required JSON format
function toIdleGameState(game) {
  const currentChapter = getCurrentChapter(game.resources.energy);
  const conqueredWorlds = ALTANIA_LORE.worlds.filter(world => 
    world.conquered || (world.id === "zwamsha") // Zwamsha starts conquered
  );
  
  return {
    "player": {
      "id": game.userId.toString(),
      "name": game.nationName,
      "energy": Math.floor(game.resources.energy),
      "altanerite": Math.floor(game.resources.altanerite),
      "location": `${game.location.galaxy} - ${game.location.system} - ${game.location.planet}`
    },
    "frequencyManipulator": {
      "active": game.fm ? game.fm.fuelBuffer > 0 || game.fm.autoFuel : false,
      "energyGenerated": game.fm ? game.fm.alexPerSecond * game.fm.energyPerAlex : 0
    },
    "resources": {
      "altanerite": Math.floor(game.resources.altanerite),
      "shipParts": calculateShipParts(game)
    },
    "worldsConquered": conqueredWorlds.map(world => ({
      "worldId": world.id,
      "name": world.name,
      "energyContribution": world.energyContribution
    })),
    "story": {
      "lore": getCurrentLore(game.resources.energy),
      "currentChapter": currentChapter
    },
    "errors": []
  };
}

function getCurrentChapter(energy) {
  const chapters = ALTANIA_LORE.chapters;
  let currentChapter = chapters[0];
  
  for (let i = chapters.length - 1; i >= 0; i--) {
    if (energy >= chapters[i].energyRequired) {
      currentChapter = chapters[i];
      break;
    }
  }
  
  return currentChapter.title;
}

function getCurrentLore(energy) {
  const chapters = ALTANIA_LORE.chapters;
  let currentLore = chapters[0].lore;
  
  for (let i = chapters.length - 1; i >= 0; i--) {
    if (energy >= chapters[i].energyRequired) {
      currentLore = chapters[i].lore;
      break;
    }
  }
  
  return currentLore;
}

function calculateShipParts(game) {
  // Ship parts based on available resources
  const iron = game.inventory?.iron || 0;
  const copper = game.inventory?.copper || 0;
  const fuel = game.inventory?.fuel || 0;
  const plastic = game.inventory?.plastic || 0;
  
  return Math.floor((iron + copper + fuel + plastic) / 4);
}

// Get current game state
router.get("/state", async (req, res) => {
  try {
    const userId = req.user.sub;
    const game = await Game.findOne({ userId });
    
    if (!game) {
      return res.status(404).json({
        "player": {
          "id": userId,
          "name": "New Nation",
          "energy": 0,
          "altanerite": 0,
          "location": "Altanian - Zwamsha - Zwamsha"
        },
        "frequencyManipulator": {
          "active": false,
          "energyGenerated": 0
        },
        "resources": {
          "altanerite": 0,
          "shipParts": 0
        },
        "worldsConquered": [
          {
            "worldId": "zwamsha",
            "name": "Zwamsha",
            "energyContribution": 1000
          }
        ],
        "story": {
          "lore": ALTANIA_LORE.chapters[0].lore,
          "currentChapter": ALTANIA_LORE.chapters[0].title
        },
        "errors": [
          {
            "code": "GAME_NOT_STARTED",
            "message": "Game not initialized. Please start a new game."
          }
        ]
      });
    }
    
    // Update game state with passive generation
    await updateGameState(game);
    
    res.json(toIdleGameState(game));
  } catch (error) {
    res.status(500).json({
      "player": {
        "id": req.user?.sub || "unknown",
        "name": "Error",
        "energy": 0,
        "altanerite": 0,
        "location": "Unknown"
      },
      "frequencyManipulator": {
        "active": false,
        "energyGenerated": 0
      },
      "resources": {
        "altanerite": 0,
        "shipParts": 0
      },
      "worldsConquered": [],
      "story": {
        "lore": "An error occurred while loading the game state.",
        "currentChapter": "Error"
      },
      "errors": [
        {
          "code": "SERVER_ERROR",
          "message": error.message
        }
      ]
    });
  }
});

// Feed Altanerite to Frequency Manipulator
router.post("/feed-frequency-manipulator", async (req, res) => {
  try {
    const userId = req.user.sub;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        "player": {
          "id": userId,
          "name": "Error",
          "energy": 0,
          "altanerite": 0,
          "location": "Unknown"
        },
        "frequencyManipulator": {
          "active": false,
          "energyGenerated": 0
        },
        "resources": {
          "altanerite": 0,
          "shipParts": 0
        },
        "worldsConquered": [],
        "story": {
          "lore": "Invalid amount provided.",
          "currentChapter": "Error"
        },
        "errors": [
          {
            "code": "INVALID_AMOUNT",
            "message": "Amount must be a positive number"
          }
        ]
      });
    }
    
    const game = await Game.findOne({ userId });
    if (!game) {
      return res.status(404).json({
        "player": {
          "id": userId,
          "name": "Error",
          "energy": 0,
          "altanerite": 0,
          "location": "Unknown"
        },
        "frequencyManipulator": {
          "active": false,
          "energyGenerated": 0
        },
        "resources": {
          "altanerite": 0,
          "shipParts": 0
        },
        "worldsConquered": [],
        "story": {
          "lore": "Game not found.",
          "currentChapter": "Error"
        },
        "errors": [
          {
            "code": "GAME_NOT_FOUND",
            "message": "Game not initialized"
          }
        ]
      });
    }
    
    const feedAmount = Math.min(amount, game.resources.altanerite);
    
    if (feedAmount <= 0) {
      return res.status(400).json({
        ...toIdleGameState(game),
        "errors": [
          {
            "code": "INSUFFICIENT_ALTANERITE",
            "message": "Not enough Altanerite to feed the Frequency Manipulator"
          }
        ]
      });
    }
    
    // Initialize FM if not exists
    if (!game.fm) {
      game.fm = {
        fuelBuffer: 0,
        autoFuel: false,
        alexPerSecond: 0.1,
        energyPerAlex: 100
      };
    }
    
    // Feed Altanerite to Frequency Manipulator
    game.resources.altanerite -= feedAmount;
    game.fm.fuelBuffer += feedAmount;
    
    await game.save();
    
    res.json(toIdleGameState(game));
  } catch (error) {
    res.status(500).json({
      "player": {
        "id": req.user?.sub || "unknown",
        "name": "Error",
        "energy": 0,
        "altanerite": 0,
        "location": "Unknown"
      },
      "frequencyManipulator": {
        "active": false,
        "energyGenerated": 0
      },
      "resources": {
        "altanerite": 0,
        "shipParts": 0
      },
      "worldsConquered": [],
      "story": {
        "lore": "An error occurred while feeding the Frequency Manipulator.",
        "currentChapter": "Error"
      },
      "errors": [
        {
          "code": "SERVER_ERROR",
          "message": error.message
        }
      ]
    });
  }
});

// Build ship
router.post("/build-ship", async (req, res) => {
  try {
    const userId = req.user.sub;
    const game = await Game.findOne({ userId });
    
    if (!game) {
      return res.status(404).json({
        "player": {
          "id": userId,
          "name": "Error",
          "energy": 0,
          "altanerite": 0,
          "location": "Unknown"
        },
        "frequencyManipulator": {
          "active": false,
          "energyGenerated": 0
        },
        "resources": {
          "altanerite": 0,
          "shipParts": 0
        },
        "worldsConquered": [],
        "story": {
          "lore": "Game not found.",
          "currentChapter": "Error"
        },
        "errors": [
          {
            "code": "GAME_NOT_FOUND",
            "message": "Game not initialized"
          }
        ]
      });
    }
    
    const shipCost = 500; // Energy cost
    const shipPartsCost = 10; // Ship parts cost
    
    if (game.resources.energy < shipCost) {
      return res.json({
        ...toIdleGameState(game),
        "errors": [
          {
            "code": "INSUFFICIENT_ENERGY",
            "message": `Need ${shipCost} energy to build ship. Current: ${Math.floor(game.resources.energy)}`
          }
        ]
      });
    }
    
    const currentShipParts = calculateShipParts(game);
    if (currentShipParts < shipPartsCost) {
      return res.json({
        ...toIdleGameState(game),
        "errors": [
          {
            "code": "INSUFFICIENT_SHIP_PARTS",
            "message": `Need ${shipPartsCost} ship parts to build ship. Current: ${currentShipParts}`
          }
        ]
      });
    }
    
    // Build the ship
    game.resources.energy -= shipCost;
    game.ship.hasShip = true;
    game.ship.level = 1;
    game.ship.range = 1;
    
    // Consume ship parts
    const partsToConsume = Math.min(shipPartsCost, currentShipParts);
    const ironUsed = Math.min(partsToConsume, game.inventory?.iron || 0);
    const copperUsed = Math.min(partsToConsume - ironUsed, game.inventory?.copper || 0);
    const fuelUsed = Math.min(partsToConsume - ironUsed - copperUsed, game.inventory?.fuel || 0);
    const plasticUsed = Math.min(partsToConsume - ironUsed - copperUsed - fuelUsed, game.inventory?.plastic || 0);
    
    if (game.inventory) {
      game.inventory.iron = Math.max(0, (game.inventory.iron || 0) - ironUsed);
      game.inventory.copper = Math.max(0, (game.inventory.copper || 0) - copperUsed);
      game.inventory.fuel = Math.max(0, (game.inventory.fuel || 0) - fuelUsed);
      game.inventory.plastic = Math.max(0, (game.inventory.plastic || 0) - plasticUsed);
    }
    
    await game.save();
    
    res.json(toIdleGameState(game));
  } catch (error) {
    res.status(500).json({
      "player": {
        "id": req.user?.sub || "unknown",
        "name": "Error",
        "energy": 0,
        "altanerite": 0,
        "location": "Unknown"
      },
      "frequencyManipulator": {
        "active": false,
        "energyGenerated": 0
      },
      "resources": {
        "altanerite": 0,
        "shipParts": 0
      },
      "worldsConquered": [],
      "story": {
        "lore": "An error occurred while building the ship.",
        "currentChapter": "Error"
      },
      "errors": [
        {
          "code": "SERVER_ERROR",
          "message": error.message
        }
      ]
    });
  }
});

// Conquer world
router.post("/conquer-world", async (req, res) => {
  try {
    const userId = req.user.sub;
    const { worldId } = req.body;
    
    if (!worldId) {
      return res.status(400).json({
        "player": {
          "id": userId,
          "name": "Error",
          "energy": 0,
          "altanerite": 0,
          "location": "Unknown"
        },
        "frequencyManipulator": {
          "active": false,
          "energyGenerated": 0
        },
        "resources": {
          "altanerite": 0,
          "shipParts": 0
        },
        "worldsConquered": [],
        "story": {
          "lore": "Invalid world ID provided.",
          "currentChapter": "Error"
        },
        "errors": [
          {
            "code": "INVALID_WORLD_ID",
            "message": "World ID is required"
          }
        ]
      });
    }
    
    const game = await Game.findOne({ userId });
    if (!game) {
      return res.status(404).json({
        "player": {
          "id": userId,
          "name": "Error",
          "energy": 0,
          "altanerite": 0,
          "location": "Unknown"
        },
        "frequencyManipulator": {
          "active": false,
          "energyGenerated": 0
        },
        "resources": {
          "altanerite": 0,
          "shipParts": 0
        },
        "worldsConquered": [],
        "story": {
          "lore": "Game not found.",
          "currentChapter": "Error"
        },
        "errors": [
          {
            "code": "GAME_NOT_FOUND",
            "message": "Game not initialized"
          }
        ]
      });
    }
    
    const world = ALTANIA_LORE.worlds.find(w => w.id === worldId);
    if (!world) {
      return res.json({
        ...toIdleGameState(game),
        "errors": [
          {
            "code": "WORLD_NOT_FOUND",
            "message": "World not found"
          }
        ]
      });
    }
    
    if (world.conquered) {
      return res.json({
        ...toIdleGameState(game),
        "errors": [
          {
            "code": "WORLD_ALREADY_CONQUERED",
            "message": "World is already conquered"
          }
        ]
      });
    }
    
    if (!game.ship.hasShip) {
      return res.json({
        ...toIdleGameState(game),
        "errors": [
          {
            "code": "NO_SHIP",
            "message": "You need a ship to conquer worlds"
          }
        ]
      });
    }
    
    const conquestCost = world.energyContribution * 2; // Double the energy contribution as cost
    if (game.resources.energy < conquestCost) {
      return res.json({
        ...toIdleGameState(game),
        "errors": [
          {
            "code": "INSUFFICIENT_ENERGY",
            "message": `Need ${conquestCost} energy to conquer ${world.name}. Current: ${Math.floor(game.resources.energy)}`
          }
        ]
      });
    }
    
    // Conquer the world
    game.resources.energy -= conquestCost;
    world.conquered = true;
    
    // Add energy contribution from conquered world
    game.resources.energy += world.energyContribution;
    
    await game.save();
    
    res.json(toIdleGameState(game));
  } catch (error) {
    res.status(500).json({
      "player": {
        "id": req.user?.sub || "unknown",
        "name": "Error",
        "energy": 0,
        "altanerite": 0,
        "location": "Unknown"
      },
      "frequencyManipulator": {
        "active": false,
        "energyGenerated": 0
      },
      "resources": {
        "altanerite": 0,
        "shipParts": 0
      },
      "worldsConquered": [],
      "story": {
        "lore": "An error occurred while conquering the world.",
        "currentChapter": "Error"
      },
      "errors": [
        {
          "code": "SERVER_ERROR",
          "message": error.message
        }
      ]
    });
  }
});

// Update game state with passive generation
async function updateGameState(game) {
  const now = new Date();
  const lastTick = game.lastTickAt ? new Date(game.lastTickAt) : now;
  const elapsedSec = Math.max(0, (now - lastTick) / 1000);
  
  // Update Frequency Manipulator
  if (game.fm && game.fm.fuelBuffer > 0) {
    const burn = Math.min(
      game.fm.fuelBuffer,
      game.fm.alexPerSecond * elapsedSec
    );
    game.fm.fuelBuffer -= burn;
    const fmEnergy = burn * game.fm.energyPerAlex;
    game.resources.energy += fmEnergy;
  }
  
  // Update generators
  const rates = game.getProductionRatesPerSecond();
  game.resources.energy += elapsedSec * rates.energy;
  game.resources.altanerite += elapsedSec * rates.altanerite;
  game.resources.homainionite += elapsedSec * rates.homainionite;
  
  game.lastTickAt = now;
  await game.save();
}

module.exports = router;
