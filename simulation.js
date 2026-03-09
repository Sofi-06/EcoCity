/**
 * EcoCity 2050 - Simulation Module
 * Ported and enhanced from ecoCity.py
 */

class Simulation {
    constructor(config) {
        this.reset(config);
    }

    reset(config) {
        this.day = 0;
        this.maxDays = config.maxDays || 365;
        this.initialPopulation = parseInt(config.initialPopulation) || 1000;
        this.initialResources = parseInt(config.initialResources) || 50000;

        // Scenario Settings
        const scenario = config.scenario || 'balanced';
        this.scenario = scenario;

        // Current State
        this.population = this.initialPopulation;
        this.resources = this.initialResources;
        this.pollution = 20;
        this.happiness = 100;
        this.totalSolarEnergy = 0;
        this.totalWindEnergy = 0;
        this.totalDemand = 0;
        this.weather = 'Soleado';

        // Settings based on scenario
        this.params = this.getScenarioParams(scenario);

        // History for charts
        this.history = {
            days: [0],
            population: [this.initialPopulation],
            resources: [this.initialResources],
            pollution: [20],
            happiness: [100],
            energySupply: [0],
            energyDemand: [0],
            migration: [0],
            birthsFreq: {} // Track frequency for Poisson
        };

        this.isColapsed = false;
        this.colapseReason = "";
    }

    getScenarioParams(scenario) {
        switch (scenario) {
            case 'sustainable':
                return {
                    growthRate: 0.005,
                    baseConsumption: 12, // kWh
                    pollutionFactor: 0.005,
                    naturalRecovery: 12,
                    solarCapacity: 15000,
                    windCapacity: 8000
                };
            case 'critical':
                return {
                    growthRate: 0.015,
                    baseConsumption: 18,
                    pollutionFactor: 0.05,
                    naturalRecovery: 5,
                    solarCapacity: 5000,
                    windCapacity: 2000
                };
            case 'environmental':
                return {
                    growthRate: 0.008,
                    baseConsumption: 15,
                    pollutionFactor: 0.03,
                    naturalRecovery: 2, // Low recovery
                    solarCapacity: 8000,
                    windCapacity: 4000
                };
            default: // balanced
                return {
                    growthRate: 0.008,
                    baseConsumption: 15,
                    pollutionFactor: 0.02,
                    naturalRecovery: 8,
                    solarCapacity: 10000,
                    windCapacity: 5000
                };
        }
    }

    // Helper: Normal distribution (Box-Muller)
    randomNormal(mean, std) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return num * std + mean;
    }

    // Helper: Poisson distribution
    randomPoisson(lambda) {
        let L = Math.exp(-lambda);
        let k = 0;
        let p = 1;
        do {
            k++;
            p *= Math.random();
        } while (p > L);
        return k - 1;
    }

    step() {
        if (this.isColapsed || this.day >= this.maxDays) return null;

        this.day++;

        // 1. Weather update (Stochastic)
        const weatherRoll = Math.random();
        let solarYield = 1.0;
        if (weatherRoll < 0.1) {
            this.weather = 'Lluvioso ⛈️';
            solarYield = 0.1;
        } else if (weatherRoll < 0.3) {
            this.weather = 'Nublado ☁️';
            solarYield = 0.5;
        } else {
            this.weather = 'Soleado ☀️';
            solarYield = 1.0;
        }

        // 2. Births and Migration (Stochastic - Poisson)
        const lambdaBirths = Math.max(1, this.population * 0.005);
        const births = this.randomPoisson(lambdaBirths);

        // Track frequency for Poisson chart
        this.history.birthsFreq[births] = (this.history.birthsFreq[births] || 0) + 1;

        // Migration depends on happiness
        const migrationRate = (this.happiness - 50) / 1000;
        const migration = Math.floor(this.population * migrationRate);

        const populationChange = births + migration;
        this.population += populationChange;

        // 3. Energy Consumption (Normal distribution per person)
        let dailyDemand = 0;
        for (let i = 0; i < this.population; i++) {
            // Efficiency increases slightly with population (economies of scale)
            const individualConsumption = this.randomNormal(this.params.baseConsumption, 3);
            dailyDemand += individualConsumption;
        }
        this.totalDemand = dailyDemand;

        // 4. Energy Production
        const windYield = 0.4 + Math.random() * 0.6; // Wind is variable
        this.totalSolarEnergy = this.params.solarCapacity * solarYield;
        this.totalWindEnergy = this.params.windCapacity * windYield;
        const totalProduction = this.totalSolarEnergy + this.totalWindEnergy;

        // 5. Resources and Economy
        // Resources are consumed based on demand not covered by renewables
        const fossilFuelNeeded = Math.max(0, dailyDemand - totalProduction);
        this.resources -= (fossilFuelNeeded * 0.1); // Cost of energy in resources
        this.resources -= (this.population * 0.05); // General consumption

        // 6. Pollution
        // Renewable energy creates 0 pollution in operation
        // Fossil fuel creates pollution
        const newPollution = (fossilFuelNeeded * 0.001) + (this.population * this.params.pollutionFactor);
        this.pollution += newPollution - this.params.naturalRecovery;
        this.pollution = Math.max(0, this.pollution);

        // 7. Happiness Calculation
        // Formula: Resources level, Pollution impact, Population density
        const resourceScore = Math.min(100, (this.resources / this.initialResources) * 100);
        const pollutionPenalty = Math.max(0, Math.min(50, (this.pollution / 200) * 50));
        const energyDeficit = totalProduction < dailyDemand ? 15 : 0;

        this.happiness = Math.max(0, Math.min(100, (resourceScore - pollutionPenalty - energyDeficit + 20)));

        // History Update
        this.history.days.push(this.day);
        this.history.population.push(this.population);
        this.history.resources.push(this.resources);
        this.history.pollution.push(this.pollution);
        this.history.happiness.push(this.happiness);
        this.history.energyDemand.push(dailyDemand);
        this.history.energySupply.push(totalProduction);
        this.history.migration.push(migration);

        // Check Collapse
        if (this.resources <= 0) {
            this.isColapsed = true;
            this.colapseReason = "Colapso Económico: Recursos Agotados";
        } else if (this.pollution > 500) {
            this.isColapsed = true;
            this.colapseReason = "Catástrofe Ambiental: Contaminación Extrema";
        } else if (this.happiness < 5) {
            this.isColapsed = true;
            this.colapseReason = "Revuelta Social: Humedad Insoportable / Infelicidad";
        }

        return {
            day: this.day,
            events: this.generateEvents(births, migration),
            state: {
                population: Math.floor(this.population),
                resources: Math.floor(this.resources),
                pollution: Math.floor(this.pollution),
                happiness: Math.floor(this.happiness),
                weather: this.weather,
                solar: Math.floor(this.totalSolarEnergy),
                wind: Math.floor(this.totalWindEnergy),
                births: births,
                migration: migration
            }
        };
    }

    generateEvents(births, migration) {
        const events = [];
        if (births > this.population * 0.01) {
            events.push({ type: 'info', msg: `Baby Boom: ${births} nuevos ciudadanos.` });
        }
        if (migration < -50) {
            events.push({ type: 'warning', msg: `Éxodo masivo detectado por baja calidad de vida.` });
        } else if (migration > 50) {
            events.push({ type: 'info', msg: `Atracción de talento: ${migration} inmigrantes llegaron.` });
        }

        if (this.pollution > 200) {
            events.push({ type: 'danger', msg: `Alerta de Calidad de Aire: Nivel crítico!` });
        }

        return events;
    }
}
