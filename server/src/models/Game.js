const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
      unique: true,
    },
    nationName: { type: String, default: "New Nation" },
    resources: {
      energy: { type: Number, default: 0 },
      altanerite: { type: Number, default: 0 },
      homainionite: { type: Number, default: 0 },
    },
    inventory: {
      wood: { type: Number, default: 0 },
      stone: { type: Number, default: 0 },
      iron: { type: Number, default: 0 },
      copper: { type: Number, default: 0 },
      plastic: { type: Number, default: 0 },
      glass: { type: Number, default: 0 },
      alexandrite: { type: Number, default: 0 },
      diamond: { type: Number, default: 0 },
      gold: { type: Number, default: 0 },
      silver: { type: Number, default: 0 },
      dirt: { type: Number, default: 0 },
      clay: { type: Number, default: 0 },
      rope: { type: Number, default: 0 },
      water: { type: Number, default: 0 },
      lava: { type: Number, default: 0 },
      coal: { type: Number, default: 0 },
      fuel: { type: Number, default: 0 },
      miscComputerParts: { type: Number, default: 0 },
      refinedAltanerite: { type: Number, default: 0 },
      refinedAlexandrite: { type: Number, default: 0 },
      refinedIron: { type: Number, default: 0 },
      refinedCopper: { type: Number, default: 0 },
      refinedStone: { type: Number, default: 0 },
    },
    fleet: {
      mainShips: { type: Number, default: 0 },
      commShips: { type: Number, default: 0 },
      surveillanceShips: { type: Number, default: 0 },
      supportWings: { type: Number, default: 0 },
      alexandriteArmy: {
        count: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
      },
      topazTroopers: {
        count: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
      },
      nephriteNavy: {
        count: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
      },
    },
    energyAllocation: {
      craftingPct: { type: Number, default: 0 },
    },
    craftingQueue: [
      {
        type: { type: String },
        remainingEnergy: { type: Number, default: 0 },
      },
    ],
    fm: {
      fuelBuffer: { type: Number, default: 0 },
      autoFuel: { type: Boolean, default: false },
      alexPerSecond: { type: Number, default: 0.1 },
      energyPerAlex: { type: Number, default: 100 },
    },
    generators: {
      solarPanels: { type: Number, default: 0 },
      reactors: { type: Number, default: 0 },
      miners: { type: Number, default: 0 },
    },
    clickPower: { type: Number, default: 1 },
    ship: {
      hasShip: { type: Boolean, default: false },
      level: { type: Number, default: 0 },
      range: { type: Number, default: 0 },
    },
    location: {
      galaxy: { type: String, default: "Altanian" },
      system: { type: String, default: "Zwamsha" },
      planet: { type: String, default: "Zwamsha" },
      mode: { type: String, enum: ["planet", "space"], default: "planet" },
    },
    systemIndex: { type: Number, default: 0 },
    seed: { type: Number, default: () => Math.floor(Math.random() * 1e9) },
    lastTickAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

gameSchema.methods.getProductionRatesPerSecond = function () {
  // Energy from solar panels and reactors; resources from miners
  const solarPanels = Number(
    (this.generators && this.generators.solarPanels) || 0,
  );
  const reactors = Number((this.generators && this.generators.reactors) || 0);
  const miners = Number((this.generators && this.generators.miners) || 0);
  
  // Balanced production rates for better progression
  const energyRate = 2 + solarPanels * 1.5 + reactors * 8;
  const altaneriteRate = miners * 0.3;
  const homainioniteRate = miners * 0.08;
  
  return {
    energy: energyRate,
    altanerite: altaneriteRate,
    homainionite: homainioniteRate,
  };
};

module.exports = mongoose.models.Game || mongoose.model("Game", gameSchema);
