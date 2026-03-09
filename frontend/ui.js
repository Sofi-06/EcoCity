/**
 * EcoCity 2050 - UI Module
 * Controls DOM, charts, and simulation lifecycle
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Chart Initializations
    const populationCtx = document.getElementById('populationChart').getContext('2d');
    const energyCtx = document.getElementById('energyChart').getContext('2d');
    const pollutionCtx = document.getElementById('pollutionChart').getContext('2d');

    const charts = {
        population: new Chart(populationCtx, {
            type: 'line',
            data: {
                labels: [0],
                datasets: [{
                    label: 'Población Total',
                    borderColor: '#00d2ff',
                    backgroundColor: 'rgba(0, 210, 255, 0.1)',
                    data: [1000],
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: chartOptions('#00d2ff')
        }),

        energy: new Chart(energyCtx, {
            type: 'bar',
            data: {
                labels: [0],
                datasets: [{
                    label: 'Producción',
                    backgroundColor: '#00ff88',
                    data: [0]
                }, {
                    label: 'Demanda',
                    backgroundColor: '#ff4d4d',
                    data: [0]
                }]
            },
            options: chartOptions('#00ff88')
        }),

        pollution: new Chart(pollutionCtx, {
            type: 'line',
            data: {
                labels: [0],
                datasets: [{
                    label: 'Contaminación',
                    borderColor: '#ffcc33',
                    data: [20],
                    borderWidth: 2,
                    tension: 0.3
                }, {
                    label: 'Recursos x100',
                    borderColor: '#00d2ff',
                    data: [500],
                    borderWidth: 2,
                    tension: 0.3
                }]
            },
            options: chartOptions('#ffcc33')
        }),

        poisson: new Chart(document.getElementById('poissonChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Frecuencia de Nacimientos',
                    backgroundColor: 'rgba(0, 210, 255, 0.6)',
                    borderColor: '#00d2ff',
                    borderWidth: 1,
                    data: []
                }]
            },
            options: {
                ...chartOptions('#00d2ff'),
                scales: {
                    x: {
                        title: { display: true, text: 'Nacimientos por Día', color: '#94a3b8' },
                        grid: { display: false },
                        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
                    },
                    y: {
                        title: { display: true, text: 'Frecuencia (Días)', color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
                    }
                }
            }
        })
    };

    function chartOptions(color) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.5)' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255, 255, 255, 0.5)' }
                }
            },
            plugins: {
                legend: { labels: { color: 'white', font: { size: 10 } } }
            }
        };
    }

    // 2. Simulation Lifecycle
    let simInstance = null;
    let simInterval = null;
    let currentScenario = 'balanced';

    const runBtn = document.getElementById('runSimulation');
    const resetBtn = document.getElementById('resetSimulation');
    const eventLog = document.getElementById('eventLog');
    const scenarioBtns = document.querySelectorAll('.scenario-btn');

    scenarioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            scenarioBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentScenario = btn.dataset.scenario;
            logEvent('info', `Escenario cambiado a: ${currentScenario.toUpperCase()}`);
        });
    });

    runBtn.addEventListener('click', toggleSimulation);
    resetBtn.addEventListener('click', resetSimulation);
    document.getElementById('showHelp').addEventListener('click', showHelpInstructions);

    function showHelpInstructions() {
        logEvent('system', '--- GUÍA DE SIMULACIÓN ---');
        logEvent('info', '1. Ajusta los parámetros en la barra lateral.');
        logEvent('info', '2. Elige un escenario (Sostenible, Crítico, etc).');
        logEvent('info', '3. Dale clic a INICIAR SIMULACIÓN.');
        logEvent('warning', 'Hint: ¡Cuida la contaminación o la ciudad colapsará!');
        alert("¡Hola! Para simular, solo ajusta tus parámetros y presiona el botón verde de 'Iniciar Simulación' en la barra lateral.");
    }

    function toggleSimulation() {
        if (simInterval) {
            stopSimulation();
            return;
        }

        if (!simInstance) {
            const config = {
                initialPopulation: document.getElementById('initialPopulation').value,
                initialResources: document.getElementById('initialResources').value,
                maxDays: document.getElementById('simulationDays').value,
                scenario: currentScenario
            };
            simInstance = new Simulation(config);
            resetCharts();
            logEvent('system', 'Simulación Iniciada...');
        }

        runBtn.textContent = 'Pausar Simulación';
        runBtn.classList.replace('primary-btn', 'secondary-btn');

        simInterval = setInterval(() => {
            const stepResult = simInstance.step();
            if (stepResult) {
                updateUI(stepResult);

                // Add events to log
                stepResult.events.forEach(ev => logEvent(ev.type, ev.msg));

                if (simInstance.isColapsed) {
                    stopSimulation();
                    logEvent('danger', `🚨 CRACK! ${simInstance.colapseReason}`);
                    alert(`🚨 COLAPSO: ${simInstance.colapseReason}`);
                }
            } else {
                stopSimulation();
                logEvent('system', 'Simulación Completada con éxito.');
            }
        }, 100); // Step every 100ms
    }

    function stopSimulation() {
        clearInterval(simInterval);
        simInterval = null;
        runBtn.textContent = 'Reanudar Simulación';
        runBtn.classList.replace('secondary-btn', 'primary-btn');
    }

    function resetSimulation() {
        stopSimulation();
        simInstance = null;
        runBtn.textContent = 'Iniciar Simulación';
        resetCharts();
        clearLog();
        updateUIValues(0, 100, 'Esperando...', { solar: 0, wind: 0, births: 0 });
    }

    // 3. Helper Functions
    function updateUI(res) {
        const { day, state } = res;

        // Update Stats Bar
        document.getElementById('currentDay').textContent = day;
        document.getElementById('happinessValue').textContent = `${state.happiness}%`;
        document.getElementById('happinessProgress').style.width = `${state.happiness}%`;
        document.getElementById('currentWeather').textContent = state.weather;

        // Update Bottom Bar
        document.getElementById('solarStat').textContent = `${state.solar.toLocaleString()} kWh`;
        document.getElementById('windStat').textContent = `${state.wind.toLocaleString()} kWh`;
        document.getElementById('birthStat').textContent = state.births;

        const crisis = document.getElementById('crisisStat');
        if (state.pollution > 300 || state.happiness < 20) {
            crisis.textContent = 'CRÍTICO';
            crisis.className = 'status-danger';
        } else if (state.pollution > 150) {
            crisis.textContent = 'ALERTA';
            crisis.className = 'status-warn';
        } else {
            crisis.textContent = 'ESTABLE';
            crisis.className = 'status-ok';
        }

        // Update Charts (Sincronización de etiquetas y datos)
        const maxDataPoints = 50;

        // 1. Población
        const pLabels = charts.population.data.labels;
        pLabels.push(day);
        charts.population.data.datasets[0].data.push(state.population);
        if (pLabels.length > maxDataPoints) {
            pLabels.shift();
            charts.population.data.datasets[0].data.shift();
        }
        charts.population.update('none');

        // 2. Energía
        const eLabels = charts.energy.data.labels;
        eLabels.push(day);
        charts.energy.data.datasets[0].data.push(state.solar + state.wind);
        charts.energy.data.datasets[1].data.push(Math.floor(simInstance.totalDemand));
        if (eLabels.length > 30) {
            eLabels.shift();
            charts.energy.data.datasets[0].data.shift();
            charts.energy.data.datasets[1].data.shift();
        }
        charts.energy.update('none');

        // 3. Contaminación y Recursos
        const polLabels = charts.pollution.data.labels;
        polLabels.push(day);
        charts.pollution.data.datasets[0].data.push(state.pollution);
        charts.pollution.data.datasets[1].data.push(state.resources / 100);
        if (polLabels.length > maxDataPoints) {
            polLabels.shift();
            charts.pollution.data.datasets[0].data.shift();
            charts.pollution.data.datasets[1].data.shift();
        }

        // 4. Poisson Frecuencia
        const freqData = simInstance.history.birthsFreq;
        const sortedKeys = Object.keys(freqData).sort((a, b) => parseInt(a) - parseInt(b));

        charts.poisson.data.labels = sortedKeys;
        charts.poisson.data.datasets[0].data = sortedKeys.map(k => freqData[k]);

        // Force FULL UPDATE on all
        charts.population.update('none');
        charts.energy.update('none');
        charts.pollution.update('none');
        charts.poisson.update('none');
    }

    function updateUIValues(day, happiness, weather, stats) {
        document.getElementById('currentDay').textContent = day;
        document.getElementById('happinessValue').textContent = `${happiness}%`;
        document.getElementById('happinessProgress').style.width = `${happiness}%`;
        document.getElementById('currentWeather').textContent = weather;
        document.getElementById('solarStat').textContent = stats.solar || '---';
        document.getElementById('windStat').textContent = stats.wind || '---';
        document.getElementById('birthStat').textContent = stats.births || '---';
        document.getElementById('crisisStat').textContent = 'ESPERANDO';
        document.getElementById('crisisStat').className = 'status-ok';
    }

    function logEvent(type, msg) {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
        entry.textContent = `[${time}] ${msg}`;
        eventLog.prepend(entry);
    }

    function clearLog() {
        eventLog.innerHTML = '<div class="log-entry system">Sistema reiniciado. Esperando simulación...</div>';
    }

    function resetCharts() {
        Object.values(charts).forEach(chart => {
            chart.data.labels = [0];
            chart.data.datasets.forEach(ds => ds.data = ds.data.slice(0, 1));
            chart.update();
        });
    }
});
