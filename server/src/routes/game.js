const express = require("express");
const mongoose = require("mongoose");
const { requireAuth } = require("../middleware/auth");
const Game = require("../models/Game");

const router = express.Router();

router.use(requireAuth);

function ensureMongoConnected(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ error: "Database not connected" });
    return false;
  }
  return true;
}

function ensureGameShape(game) {
  if (!game.resources || typeof game.resources !== 'object') {
    game.resources = { energy: Number(game.resources) || 0, altanerite: 0, homainionite: 0 };
  } else {
    game.resources.energy = Number(game.resources.energy || 0);
    game.resources.altanerite = Number(game.resources.altanerite || 0);
    game.resources.homainionite = Number(game.resources.homainionite || 0);
  }
  const genIsPlainObject = game.generators && game.generators.constructor === Object;
  if (!genIsPlainObject) {
    const old = Number(game.generators && game.generators.valueOf ? game.generators.valueOf() : game.generators) || 0;
    game.set('generators', { solarPanels: old, reactors: 0, miners: 0 }, { overwrite: true });
  } else {
    game.generators.solarPanels = Number(game.generators.solarPanels || 0);
    game.generators.reactors = Number(game.generators.reactors || 0);
    game.generators.miners = Number(game.generators.miners || 0);
  }
  if (!game.inventory || typeof game.inventory !== 'object') game.inventory = {};
  if (!game.fleet || typeof game.fleet !== 'object') game.fleet = { mainShips: 0, commShips: 0, surveillanceShips: 0, supportWings: 0, alexandriteArmy: { count: 0, level: 1 }, topazTroopers: { count: 0, level: 1 } };
  if (!game.energyAllocation || typeof game.energyAllocation !== 'object') game.energyAllocation = { craftingPct: 0 };
  if (!Array.isArray(game.craftingQueue)) game.craftingQueue = [];
}

// Shared system helpers
function makePRNG(seed) {
  let s = Number(seed) || 1;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

function generateSystemBySeed(seed, index) {
  const rand = makePRNG(seed + (index || 0) * 10007);
  const rng = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
  const planetCount = rng(4, 8);
  const types = ["altanerite", "homainionite", "gas", "ice", "rock"];
  const colors = { altanerite: "#60a5fa", homainionite: "#f472b6", gas: "#34d399", ice: "#93c5fd", rock: "#fcd34d" };
  const planets = Array.from({ length: planetCount }).map((_, i) => {
    const type = types[rng(0, types.length - 1)];
    const richness = 1 + (index || 0) * 0.15; // further systems are richer
    const lootSeed = seed + (index || 0) * 12347 + i * 891;
    return { name: `P-${i + 1}`, type, size: rng(12, 30), color: colors[type], distance: rng(40, 160), richness, lootSeed };
  });
  return { star: { name: `Star-${index || 0}` }, planets };
}

function fixedZwamsha() {
  const planets = [
    { name: "Zwamsha", type: "rock", size: 28, color: "#fcd34d", distance: 60, richness: 1.0, lootSeed: 11 },
    { name: "Z-2", type: "altanerite", size: 24, color: "#60a5fa", distance: 90, richness: 1.1, lootSeed: 12 },
    { name: "Z-3", type: "gas", size: 30, color: "#34d399", distance: 130, richness: 1.1, lootSeed: 13 },
    { name: "Z-4", type: "ice", size: 18, color: "#93c5fd", distance: 160, richness: 1.1, lootSeed: 14 }
  ];
  return { star: { name: "Zwamsha Star" }, planets };
}

function getPlanetForGame(game, planetName) {
  const index = game.systemIndex || 0;
  let system;
  if (index === 0) system = fixedZwamsha(); else system = generateSystemBySeed(game.seed || 1, index);
  return system.planets.find(p => p.name === planetName);
}

router.post("/start", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const { nationName } = req.body;
  let game = await Game.findOne({ userId });
  if (!game) {
    game = await Game.create({ userId, nationName: nationName || "Altanian Colony" });
  }
  ensureGameShape(game);
  await game.save();
  res.json({ game });
});

router.get("/state", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  ensureGameShape(game);
  await game.save();
  res.json({ game });
});

router.post("/tick", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const now = new Date();
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  const last = game.lastTickAt ? new Date(game.lastTickAt) : now;
  const elapsedSec = Math.max(0, (now - last) / 1000);
  const rates = game.getProductionRatesPerSecond();
  const producedEnergy = elapsedSec * rates.energy;
  // Frequency Manipulator burn
  if (!game.fm) game.fm = { fuelBuffer: 0, autoFuel: false, alexPerSecond: 0.1, energyPerAlex: 100 };
  let fmEnergy = 0;
  if (game.fm.fuelBuffer > 0) {
    const burn = Math.min(game.fm.fuelBuffer, game.fm.alexPerSecond * elapsedSec);
    game.fm.fuelBuffer -= burn;
    fmEnergy = burn * game.fm.energyPerAlex;
  } else if (game.fm.autoFuel) {
    const need = game.fm.alexPerSecond * elapsedSec;
    const take = Math.min(need, Number(game.inventory?.alexandrite || 0));
    if (take > 0) {
      game.inventory.alexandrite = Number(game.inventory.alexandrite || 0) - take;
      fmEnergy = take * game.fm.energyPerAlex;
    }
  }
  game.resources.energy += producedEnergy + fmEnergy;
  game.resources.altanerite += elapsedSec * rates.altanerite;
  game.resources.homainionite += elapsedSec * rates.homainionite;

  // Apply crafting automation: divert a percentage of produced energy to crafting
  const pct = Math.max(0, Math.min(100, game.energyAllocation?.craftingPct || 0));
  const diverted = producedEnergy * (pct / 100);
  if (diverted > 0 && game.craftingQueue && game.craftingQueue.length > 0) {
    let remaining = diverted;
    for (const job of game.craftingQueue) {
      if (remaining <= 0) break;
      const use = Math.min(remaining, job.remainingEnergy);
      job.remainingEnergy -= use;
      remaining -= use;
      if (job.remainingEnergy <= 0) {
        // finish job and grant output (prototype: each job produces 1 unit of target resource)
        if (game.inventory[job.type] !== undefined) {
          game.inventory[job.type] += 1;
        }
      }
    }
    // remove completed jobs
    game.craftingQueue = game.craftingQueue.filter(j => j.remainingEnergy > 0);
  }
  game.lastTickAt = now;
  await game.save();
  res.json({ game });
});

router.post("/buy-generator", async (req, res) => {
  try {
    if (!ensureMongoConnected(res)) return;
    const userId = req.user.sub;
    const { type } = req.body; // 'solarPanels' | 'reactors' | 'miners'
    const game = await Game.findOne({ userId });
    if (!game) return res.status(404).json({ error: "Game not started" });
    ensureGameShape(game);
    const costs = {
      solarPanels: { energy: 50 },
      reactors: { energy: 300, altanerite: 5 },
      miners: { energy: 100 }
    };
    const cost = costs[type];
    if (!cost) return res.status(400).json({ error: "Invalid generator type" });
    for (const key of Object.keys(cost)) {
      if ((Number(game.resources[key]) || 0) < cost[key]) {
        return res.status(400).json({ error: "Not enough resources" });
      }
    }
    for (const key of Object.keys(cost)) {
      game.resources[key] = (Number(game.resources[key]) || 0) - cost[key];
    }
    game.generators[type] = (Number(game.generators[type]) || 0) + 1;
    await game.save();
    res.json({ game });
  } catch (e) {
    console.error("/api/game/buy-generator error", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/click", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  game.resources.energy += game.clickPower;
  await game.save();
  res.json({ game });
});

router.post("/upgrade-ship", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  const cost = { energy: game.ship.level * 500, altanerite: Math.floor(game.ship.level / 2) };
  if (game.resources.energy < cost.energy || game.resources.altanerite < cost.altanerite) {
    return res.status(400).json({ error: "Not enough resources" });
  }
  game.resources.energy -= cost.energy;
  game.resources.altanerite -= cost.altanerite;
  game.ship.level += 1;
  game.ship.range += 1;
  await game.save();
  res.json({ game });
});

// Random solar system generator (deterministic per user for now is out-of-scope; simple random)
router.get("/system", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const Game = require("../models/Game");
  const game = await Game.findOne({ userId });
  // Zwamsha system is fixed for everyone
  const fixedZwamsha = () => {
    const planets = [
      { name: "Zwamsha", type: "rock", size: 28, color: "#fcd34d", distance: 60 },
      { name: "Z-2", type: "altanerite", size: 24, color: "#60a5fa", distance: 90 },
      { name: "Z-3", type: "gas", size: 30, color: "#34d399", distance: 130 },
      { name: "Z-4", type: "ice", size: 18, color: "#93c5fd", distance: 160 }
    ];
    return { star: { name: "Zwamsha Star" }, planets };
  };

  // Simple seeded RNG (LCG)
  const makePRNG = (seed) => {
    let s = Number(seed) || 1;
    return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  };

  const generateSystem = (seed, index) => {
    const rand = makePRNG(seed + (index || 0) * 10007);
    const rng = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
    const planetCount = rng(4, 8);
    const types = ["altanerite", "homainionite", "gas", "ice", "rock"];
    const colors = { altanerite: "#60a5fa", homainionite: "#f472b6", gas: "#34d399", ice: "#93c5fd", rock: "#fcd34d" };
    const planets = Array.from({ length: planetCount }).map((_, i) => {
      const type = types[rng(0, types.length - 1)];
      return { name: `P-${i + 1}`, type, size: rng(12, 30), color: colors[type], distance: rng(40, 160) };
    });
    return { star: { name: `Star-${index || 0}` }, planets };
  };

  // If current location is Zwamsha, return fixed; else seeded
  if (!game || game.location?.system === "Zwamsha") {
    return res.json(fixedZwamsha());
  }
  const seed = game.seed || 1;
  return res.json(generateSystem(seed, game.systemIndex || 0));
});

function computeFleetSize(game) {
  return (
    (game.fleet?.mainShips || 0) +
    (game.fleet?.commShips || 0) +
    (game.fleet?.surveillanceShips || 0) +
    (game.fleet?.supportWings || 0) +
    (game.ship?.hasShip ? 1 : 0)
  );
}

function computeTravelCost(game, distanceSteps) {
  const fleetSize = computeFleetSize(game) || 1;
  return 100 * fleetSize * Math.max(1, Math.abs(distanceSteps));
}

router.post("/travel", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const Game = require("../models/Game");
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  if (!game.ship.hasShip || game.location.mode !== "space") {
    return res.status(400).json({ error: "Must be in space with a ship" });
  }
  const { direction, targetIndex } = req.body; // 'next' | 'prev' | index
  let idx = game.systemIndex || 0;
  const current = idx;
  let nextIdx = current;
  if (typeof targetIndex === "number") {
    nextIdx = targetIndex;
  } else if (direction === "next") {
    nextIdx = current + 1;
  } else if (direction === "prev" && current > 0) {
    nextIdx = current - 1;
  }
  const distance = Math.abs(nextIdx - current);
  if (distance === 0) return res.json({ game, systemIndex: current });
  if ((game.ship?.range || 0) < distance) {
    return res.status(400).json({ error: "Ship range too low" });
  }
  const cost = computeTravelCost(game, distance);
  if ((game.resources.energy || 0) < cost) return res.status(400).json({ error: "Not enough energy" });
  game.resources.energy -= cost;
  idx = nextIdx;
  game.systemIndex = idx;
  game.location.system = idx === 0 ? "Zwamsha" : `System-${idx}`;
  await game.save();
  res.json({ game, systemIndex: idx });
});

router.post("/travel-cost", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const Game = require("../models/Game");
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  const { direction, targetIndex } = req.body;
  const current = game.systemIndex || 0;
  let nextIdx = current;
  if (typeof targetIndex === "number") nextIdx = targetIndex; else if (direction === "next") nextIdx = current + 1; else if (direction === "prev" && current > 0) nextIdx = current - 1;
  const distance = Math.abs(nextIdx - current);
  const cost = computeTravelCost(game, distance);
  const inSpace = game.location.mode === "space" && game.ship.hasShip;
  const rangeOk = (game.ship?.range || 0) >= distance;
  const energyOk = (game.resources.energy || 0) >= cost;
  res.json({ current, target: nextIdx, distance, cost, inSpace, rangeOk, energyOk });
});

router.get("/galaxy", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const Game = require("../models/Game");
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  const current = game.systemIndex || 0;
  const systems = [];
  for (let i = Math.max(0, current - 5); i <= current + 5; i++) systems.push({ index: i, name: i === 0 ? "Zwamsha" : `System-${i}` });
  res.json({ current, systems });
});

router.post("/craft", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const Game = require("../models/Game");
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  const { type, energyRequired } = req.body;
  if (!type || typeof energyRequired !== "number" || energyRequired <= 0) return res.status(400).json({ error: "Invalid craft job" });
  if (!Array.isArray(game.craftingQueue)) game.craftingQueue = [];
  game.craftingQueue.push({ type, remainingEnergy: energyRequired });
  await game.save();
  res.json({ game });
});

router.post("/cancel-craft", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const { index } = req.body;
  const Game = require("../models/Game");
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  if (!Array.isArray(game.craftingQueue)) game.craftingQueue = [];
  if (index >= 0 && index < game.craftingQueue.length) {
    game.craftingQueue.splice(index, 1);
    await game.save();
  }
  res.json({ game });
});

router.post("/save-fleet", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const Game = require("../models/Game");
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  const { mainShips, commShips, surveillanceShips, supportWings, alexandriteArmy, topazTroopers } = req.body;
  game.fleet.mainShips = Math.max(0, Number(mainShips || 0));
  game.fleet.commShips = Math.max(0, Number(commShips || 0));
  game.fleet.surveillanceShips = Math.max(0, Number(surveillanceShips || 0));
  game.fleet.supportWings = Math.max(0, Number(supportWings || 0));
  if (alexandriteArmy) {
    game.fleet.alexandriteArmy.count = Math.max(0, Number(alexandriteArmy.count || 0));
    game.fleet.alexandriteArmy.level = Math.max(1, Number(alexandriteArmy.level || 1));
  }
  if (topazTroopers) {
    game.fleet.topazTroopers.count = Math.max(0, Number(topazTroopers.count || 0));
    game.fleet.topazTroopers.level = Math.max(1, Number(topazTroopers.level || 1));
  }
  await game.save();
  res.json({ game });
});

router.post("/allocate-energy", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const Game = require("../models/Game");
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  const { craftingPct } = req.body; // 0..100
  const pct = Math.max(0, Math.min(100, Number(craftingPct || 0)));
  game.energyAllocation.craftingPct = pct;
  await game.save();
  res.json({ game });
});

router.post("/build-ship", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const Game = require("../models/Game");
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  if (game.ship.hasShip) return res.status(400).json({ error: "Ship already built" });
  const cost = { energy: 500, altanerite: 10 };
  if (game.resources.energy < cost.energy || game.resources.altanerite < cost.altanerite) {
    return res.status(400).json({ error: "Not enough resources" });
  }
  game.resources.energy -= cost.energy;
  game.resources.altanerite -= cost.altanerite;
  game.ship.hasShip = true;
  game.ship.level = 1;
  game.ship.range = 1;
  await game.save();
  res.json({ game });
});

router.post("/launch", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const Game = require("../models/Game");
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  if (!game.ship.hasShip) return res.status(400).json({ error: "Build a ship first" });
  if (game.location.mode === "space") return res.status(400).json({ error: "Already in space" });
  game.location.mode = "space";
  await game.save();
  res.json({ game });
});

router.post("/land", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const { planetName } = req.body;
  const Game = require("../models/Game");
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  if (game.location.mode !== "space") return res.status(400).json({ error: "Not in space" });
  game.location.mode = "planet";
  game.location.planet = planetName || game.location.planet || "Zwamsha";
  await game.save();
  res.json({ game });
});

router.post("/planet-click", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const { planetName } = req.body;
  const Game = require("../models/Game");
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  if (game.location.mode !== "planet") return res.status(400).json({ error: "You are not on a planet" });
  if (planetName && planetName !== game.location.planet) return res.status(400).json({ error: "You are on a different planet" });
  ensureGameShape(game);
  // Zwamsha yields common materials; other planets yield different materials (prototype)
  const onZwamsha = (game.location.planet || "").toLowerCase() === "zwamsha";
  if (!game.inventory || typeof game.inventory !== 'object') game.inventory = {};
  const grant = (key, amt) => { game.inventory[key] = Number(game.inventory[key] || 0) + amt; };

  // Helper: weighted pick with seeded RNG so each planet feels unique and consistent
  const planet = getPlanetForGame(game, game.location.planet);
  const richness = planet?.richness || (1 + (game.systemIndex || 0) * 0.15);
  const rand = makePRNG((planet?.lootSeed || 0) + (game.seed || 1) + Math.floor(Date.now() / 30000)); // slowly varying
  const pick = (weights) => {
    let total = 0; for (const w of weights) total += w.weight;
    let r = rand() * total;
    for (const w of weights) { if ((r -= w.weight) <= 0) return w.key; }
    return weights[0].key;
  };

  let gainedKey = null; let gainedAmount = 0;
  if (onZwamsha) {
    const key = pick([
      { key: 'wood', weight: 5 },
      { key: 'stone', weight: 4 },
      { key: 'alexandrite', weight: 0.5 * richness },
      { key: 'altanerite', weight: 1.0 * richness }
    ]);
    const amount = 1 + Math.floor(rand() * (1 + richness / 2));
    grant(key, amount);
    gainedKey = key; gainedAmount = amount;
  } else {
    const type = planet?.type || 'rock';
    let weights;
    switch (type) {
      case 'altanerite':
        weights = [ { key: 'altanerite', weight: 6 * richness }, { key: 'alexandrite', weight: 0.5 * richness }, { key: 'stone', weight: 2 } ];
        break;
      case 'homainionite':
        weights = [ { key: 'iron', weight: 4 * richness }, { key: 'copper', weight: 3 * richness }, { key: 'stone', weight: 2 } ];
        break;
      case 'gas':
        weights = [ { key: 'fuel', weight: 5 * richness }, { key: 'plastic', weight: 2 * richness }, { key: 'glass', weight: 1 } ];
        break;
      case 'ice':
        weights = [ { key: 'water', weight: 5 * richness }, { key: 'glass', weight: 2 * richness }, { key: 'stone', weight: 1 } ];
        break;
      case 'rock':
      default:
        weights = [ { key: 'stone', weight: 5 * richness }, { key: 'iron', weight: 2 * richness }, { key: 'copper', weight: 1 * richness } ];
        break;
    }
    const key = pick(weights);
    const amount = 1 + Math.floor(rand() * (1 + richness));
    grant(key, amount);
    gainedKey = key; gainedAmount = amount;
  }
  await game.save();
  res.json({ game, gained: { key: gainedKey, amount: gainedAmount } });
});

router.post("/fm/fuel", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const { amount } = req.body; // alexandrite units to add to buffer
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  ensureGameShape(game);
  if (!game.fm) game.fm = { fuelBuffer: 0, autoFuel: false, alexPerSecond: 0.1, energyPerAlex: 100 };
  const amt = Math.max(0, Number(amount || 0));
  if ((Number(game.inventory?.alexandrite || 0)) < amt) return res.status(400).json({ error: "Not enough alexandrite" });
  game.inventory.alexandrite = Number(game.inventory.alexandrite || 0) - amt;
  game.fm.fuelBuffer += amt;
  await game.save();
  res.json({ game });
});

router.post("/fm/auto", async (req, res) => {
  if (!ensureMongoConnected(res)) return;
  const userId = req.user.sub;
  const { autoFuel } = req.body;
  const game = await Game.findOne({ userId });
  if (!game) return res.status(404).json({ error: "Game not started" });
  if (!game.fm) game.fm = { fuelBuffer: 0, autoFuel: false, alexPerSecond: 0.1, energyPerAlex: 100 };
  game.fm.autoFuel = Boolean(autoFuel);
  await game.save();
  res.json({ game });
});

module.exports = router;


