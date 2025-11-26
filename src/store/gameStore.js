import { create } from 'zustand';

const BUILDING_TYPES = {
  pump: {
    id: 'pump',
    name: 'Groundwater Pump',
    description: 'Automatically pumps polluted water from the aquifer.',
    baseCost: 50,
    baseProduction: 1, // Polluted Water per tick
    basePollution: 0.05,
    type: 'producer',
    output: 'pollutedWater'
  },
  purifier: {
    id: 'purifier',
    name: 'Water Purifier',
    description: 'Purifies polluted water into clean water.',
    baseCost: 150,
    baseProduction: 1, // Clean Water per tick
    basePollution: -0.02, // Reduces pollution slightly? Or just neutral? Let's say neutral for now, or small reduction.
    type: 'converter',
    input: 'pollutedWater',
    output: 'cleanWater'
  },
  bottler: {
    id: 'bottler',
    name: 'Bottling Plant',
    description: 'Packages clean water for sale.',
    baseCost: 500,
    baseProduction: 5, // Money per tick
    basePollution: 0.1, // Plastic waste
    type: 'converter',
    input: 'cleanWater',
    output: 'money'
  },
  rainwaterHarvester: {
    id: 'rainwaterHarvester',
    name: 'Rainwater Harvester',
    description: 'Collects rain. Sustainable and clean.',
    baseCost: 300,
    baseProduction: 1, // Clean Water per tick
    basePollution: 0,
    type: 'producer',
    output: 'cleanWater'
  },
  treatmentPlant: {
    id: 'treatmentPlant',
    name: 'Treatment Plant',
    description: 'Industrial scale pollution filtering.',
    baseCost: 2000,
    baseProduction: 0,
    basePollution: -0.2, // Reduces pollution
    type: 'reducer',
    output: null
  }
};

export const UPGRADE_TYPES = {
  efficientPumps: {
    id: 'efficientPumps',
    name: 'Efficient Pumps',
    description: 'Reduces pollution from pumps by 50%.',
    cost: 500,
    trigger: (state) => state.buildings.pump.count >= 5,
    effect: (state) => {
      state.buildings.pump.pollutionRate /= 2;
      state.buildings.pump.basePollution /= 2;
    }
  },
  deepDrilling: {
    id: 'deepDrilling',
    name: 'Deep Aquifer Drilling',
    description: 'Access deeper water reserves. +20% Aquifer Capacity.',
    cost: 1000,
    trigger: (state) => state.resources.money >= 800,
    effect: (state) => {
      // Logic to increase max aquifer? For now just refill it a bit
      state.stats.aquiferLevel = Math.min(100, state.stats.aquiferLevel + 20);
    }
  },
  marketing: {
    id: 'marketing',
    name: 'Green Marketing',
    description: 'Sell bottled water for 50% more.',
    cost: 2000,
    trigger: (state) => state.buildings.bottler.count >= 3,
    effect: (state) => {
      state.buildings.bottler.productionRate *= 1.5; // More money per tick
    }
  }
};

const useGameStore = create((set, get) => ({
  resources: {
    money: 100, // Start with some money to buy first pump
    pollutedWater: 0,
    cleanWater: 0,
    bottledWater: 0,
  },
  stats: {
    aquiferLevel: 100, // Percentage
    pollutionLevel: 20, // Percentage
    ecoScore: 50,
    day: 1,
    tickCount: 0,
    forecast: 'Risk: Low',
  },
  buildings: {
    pump: { ...BUILDING_TYPES.pump, count: 0, cost: BUILDING_TYPES.pump.baseCost, productionRate: 0, pollutionRate: 0 },
    purifier: { ...BUILDING_TYPES.purifier, count: 0, cost: BUILDING_TYPES.purifier.baseCost, productionRate: 0, pollutionRate: 0 },
    bottler: { ...BUILDING_TYPES.bottler, count: 0, cost: BUILDING_TYPES.bottler.baseCost, productionRate: 0, pollutionRate: 0 },
    rainwaterHarvester: { ...BUILDING_TYPES.rainwaterHarvester, count: 0, cost: BUILDING_TYPES.rainwaterHarvester.baseCost, productionRate: 0, pollutionRate: 0 },
    treatmentPlant: { ...BUILDING_TYPES.treatmentPlant, count: 0, cost: BUILDING_TYPES.treatmentPlant.baseCost, productionRate: 0, pollutionRate: 0 },
  },
  upgrades: {
    available: [], // IDs of upgrades available to buy
    purchased: [], // IDs of purchased upgrades
  },
  
  // Actions
  addResource: (type, amount) => set((state) => ({
    resources: {
      ...state.resources,
      [type]: state.resources[type] + amount,
    }
  })),

  checkUnlocks: () => set((state) => {
    const available = [...state.upgrades.available];
    Object.values(UPGRADE_TYPES).forEach(upgrade => {
      if (!state.upgrades.purchased.includes(upgrade.id) && !available.includes(upgrade.id)) {
        if (upgrade.trigger(state)) {
          available.push(upgrade.id);
        }
      }
    });
    return { upgrades: { ...state.upgrades, available } };
  }),

  buyUpgrade: (upgradeId) => set((state) => {
    const upgrade = UPGRADE_TYPES[upgradeId];
    if (state.resources.money < upgrade.cost) return state;

    // Apply effect
    // Note: This is tricky with Immer/Zustand if we want to mutate deep state.
    // We'll do a shallow copy strategy or just modify specific values.
    // For simplicity, we'll manually apply effects in the reducer logic or just flag it.
    // Actually, let's just flag it and apply modifiers in tick/logic?
    // Or apply permanent changes to building stats.
    
    let newBuildings = { ...state.buildings };
    
    if (upgradeId === 'efficientPumps') {
       newBuildings.pump = { 
         ...newBuildings.pump, 
         pollutionRate: newBuildings.pump.pollutionRate * 0.5,
         basePollution: newBuildings.pump.basePollution * 0.5
       };
    } else if (upgradeId === 'marketing') {
       newBuildings.bottler = {
         ...newBuildings.bottler,
         productionRate: newBuildings.bottler.productionRate * 1.5,
         baseProduction: newBuildings.bottler.baseProduction * 1.5
       };
    }

    return {
      resources: {
        ...state.resources,
        money: state.resources.money - upgrade.cost,
      },
      upgrades: {
        ...state.upgrades,
        available: state.upgrades.available.filter(id => id !== upgradeId),
        purchased: [...state.upgrades.purchased, upgradeId]
      },
      buildings: newBuildings
    };
  }),

  buyBuilding: (buildingId) => set((state) => {
    const building = state.buildings[buildingId];
    if (state.resources.money < building.cost) return state;

    const newCount = building.count + 1;
    const newCost = Math.floor(building.baseCost * Math.pow(1.15, newCount)); // 15% cost increase

    return {
      resources: {
        ...state.resources,
        money: state.resources.money - building.cost,
      },
      buildings: {
        ...state.buildings,
        [buildingId]: {
          ...building,
          count: newCount,
          cost: newCost,
          productionRate: building.baseProduction * newCount, // Simplified linear scaling
          pollutionRate: building.basePollution * newCount,
        }
      }
    };
  }),

  // The Game Loop Tick
  tick: () => set((state) => {
    const { buildings, resources, stats } = state;
    let newResources = { ...resources };
    let newStats = { ...stats };

    // 1. Pumps Produce Polluted Water
    if (buildings.pump.count > 0 && stats.aquiferLevel > 0) {
      const production = buildings.pump.productionRate;
      // Check if aquifer has enough water
      const actualProduction = Math.min(production, stats.aquiferLevel * 10); // Arbitrary scale
      
      newResources.pollutedWater += actualProduction;
      newStats.aquiferLevel = Math.max(0, stats.aquiferLevel - (actualProduction * 0.01));
      newStats.pollutionLevel = Math.min(100, stats.pollutionLevel + buildings.pump.pollutionRate);
    }

    // 2. Purifiers Convert Polluted -> Clean
    if (buildings.purifier.count > 0 && newResources.pollutedWater > 0) {
      const capacity = buildings.purifier.productionRate;
      const processed = Math.min(capacity, newResources.pollutedWater);
      
      newResources.pollutedWater -= processed;
      newResources.cleanWater += processed;
      // Purifiers might help eco score or reduce pollution slightly?
    }

    // 3. Bottlers Convert Clean -> Money
    if (buildings.bottler.count > 0 && newResources.cleanWater > 0) {
      const capacity = buildings.bottler.productionRate / 5; // Production rate is money, so we need to derive input. Let's say 1 clean water = $5
      // Wait, definition says baseProduction is 5 (Money). So input needed is 1.
      const inputNeeded = buildings.bottler.count; // 1 unit per building per tick
      const processed = Math.min(inputNeeded, newResources.cleanWater);
      
      newResources.cleanWater -= processed;
      newResources.money += processed * 5; // $5 per unit
      newStats.pollutionLevel = Math.min(100, newStats.pollutionLevel + buildings.bottler.pollutionRate);
    }

    // 4. Rainwater Harvesters Produce Clean Water
    if (buildings.rainwaterHarvester.count > 0) {
        newResources.cleanWater += buildings.rainwaterHarvester.productionRate;
    }

    // 5. Treatment Plants Reduce Pollution
    if (buildings.treatmentPlant.count > 0) {
        // pollutionRate is negative for treatment plant
        newStats.pollutionLevel = Math.max(0, newStats.pollutionLevel + buildings.treatmentPlant.pollutionRate);
    }

    // Passive Regeneration / Changes
    // Day progression: 1 day every 5 ticks
    const ticksPerDay = 5;
    const currentTick = (state.stats.tickCount || 0) + 1;
    newStats.tickCount = currentTick;

    if (currentTick % ticksPerDay === 0) {
        newStats.day += 1;
        
        // Update Forecast daily
        const dayOfWeek = (newStats.day - 1) % 7; // 0 = Mon, 6 = Sun
        const risks = ['Low', 'Low', 'Medium', 'Medium', 'High', 'High', 'None'];
        const risk = risks[dayOfWeek];
        newStats.forecast = `Risk: ${risk}`;
    }
    
    // Aquifer natural recharge (very slow)
    if (newStats.aquiferLevel < 100) {
        newStats.aquiferLevel += 0.005;
    }

    // Eco Score Calculation
    // Base 50
    // + Aquifer Health (0-25)
    // - Pollution (0-50)
    // + Clean Water Production Bonus (capped at 25)
    
    let ecoScore = 50;
    ecoScore += (newStats.aquiferLevel / 4); // Max 25
    ecoScore -= (newStats.pollutionLevel / 2); // Max penalty 50
    
    // Bonus for sustainable practices (ratio of clean vs polluted water stored)
    if (newResources.cleanWater > newResources.pollutedWater) {
        ecoScore += 5;
    }

    newStats.ecoScore = Math.max(0, Math.min(100, ecoScore));

    // Check for unlocks
    // ... (existing unlock logic) ...
    const available = [...state.upgrades.available];
    Object.values(UPGRADE_TYPES).forEach(upgrade => {
      if (!state.upgrades.purchased.includes(upgrade.id) && !available.includes(upgrade.id)) {
        if (upgrade.trigger({ resources: newResources, stats: newStats, buildings: buildings })) {
          available.push(upgrade.id);
        }
      }
    });

    // Random Event Trigger (1% chance per tick)
    let activeEvent = state.activeEvent;
    if (!activeEvent && Math.random() < 0.01) {
       const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
       activeEvent = randomEvent;
       // Apply immediately
       if (randomEvent.effect) {
         randomEvent.effect(newResources, newStats);
       }
    }

    return {
      resources: newResources,
      stats: newStats,
      upgrades: { ...state.upgrades, available },
      activeEvent: activeEvent
    };
  }),

  triggerEvent: (event) => set((state) => {
    // Apply event effects
    let newResources = { ...state.resources };
    let newStats = { ...state.stats };
    
    if (event.effect) {
       const result = event.effect(newResources, newStats);
       if (result) {
         newResources = result.resources || newResources;
         newStats = result.stats || newStats;
       }
    }

    return {
      resources: newResources,
      stats: newStats,
      activeEvent: event
    };
  }),

  clearEvent: () => set({ activeEvent: null }),

  manualCollect: () => set((state) => {
    if (state.stats.aquiferLevel <= 0) return state;

    return {
      resources: {
        ...state.resources,
        pollutedWater: state.resources.pollutedWater + 1,
      },
      stats: {
        ...state.stats,
        aquiferLevel: Math.max(0, state.stats.aquiferLevel - 0.1),
      }
    };
  }),

  purifyWater: () => set((state) => {
    if (state.resources.pollutedWater < 1) return state;

    return {
      resources: {
        ...state.resources,
        pollutedWater: state.resources.pollutedWater - 1,
        cleanWater: state.resources.cleanWater + 1,
      }
    };
  }),

  sellCleanWater: () => set((state) => {
    if (state.resources.cleanWater < 1) return state;

    return {
      resources: {
        ...state.resources,
        cleanWater: state.resources.cleanWater - 1,
        money: state.resources.money + 5,
      }
    };
  }),

  plantTree: () => set((state) => {
    if (state.resources.money < 50) return state;

    return {
      resources: {
        ...state.resources,
        money: state.resources.money - 50,
      },
      stats: {
        ...state.stats,
        pollutionLevel: Math.max(0, state.stats.pollutionLevel - 1),
      }
    };
  }),

  organizeCleanup: () => set((state) => {
    if (state.resources.money < 500) return state;

    return {
      resources: {
        ...state.resources,
        money: state.resources.money - 500,
      },
      stats: {
        ...state.stats,
        pollutionLevel: Math.max(0, state.stats.pollutionLevel - 10),
      }
    };
  }),
}));

export const EVENTS = [
  {
    id: 'rain',
    title: 'Heavy Rainfall',
    description: 'A storm replenishes the aquifer! (+10% Water Level)',
    effect: (res, stats) => {
      stats.aquiferLevel = Math.min(100, stats.aquiferLevel + 10);
    }
  },
  {
    id: 'leak',
    title: 'Pipeline Leak',
    description: 'Polluted water leaks into the ground! (+5% Pollution)',
    effect: (res, stats) => {
      stats.pollutionLevel = Math.min(100, stats.pollutionLevel + 5);
    }
  },
  {
    id: 'grant',
    title: 'Government Grant',
    description: 'You received a grant for sustainability! (+$200)',
    effect: (res, stats) => {
      res.money += 200;
    }
  }
];

export default useGameStore;
