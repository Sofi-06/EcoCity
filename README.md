# 🌿 EcoCity 2050 - Simulación de Ciudad Futurista

**EcoCity 2050** es un modelo de simulación dinámica y estocástica diseñado para analizar el equilibrio entre el desarrollo urbano, el impacto ambiental y el bienestar social en una ciudad del futuro impulsada por energías renovables.

---

## 🚀 Descripción del Proyecto
El proyecto evalúa la viabilidad de una ciudad durante un periodo de tiempo determinado, considerando variables críticas que interactúan entre sí. La simulación permite observar puntos de equilibrio, riesgos de colapso energético y el impacto de políticas ecológicas en la felicidad ciudadana.

### 🧠 Modelado Matemático y Estocástico
A diferencia de un modelo lineal, **EcoCity 2050** incorpora incertidumbre y variabilidad realista mediante distribuciones probabilísticas:

*   **📊 Distribución Normal (Gaussiana):** Se utiliza para modelar el **consumo de energía por persona**. 
    *   *Justificación:* La mayoría de los ciudadanos consumen cerca del promedio (Media: 15 kWh), con variaciones naturales (Desviación Estándar: 3 kWh).
*   **📊 Distribución de Poisson:** Se aplica para los **nacimientos diarios y la llegada de nuevos habitantes**.
    *   *Justificación:* Modela eventos aleatorios e independientes que ocurren con una tasa media constante en el tiempo.
*   **🌦️ Condiciones Climáticas:** Un modelo de probabilidad discreta que afecta directamente la producción de energía solar y eólica cada día.

---

## 🛠️ Tecnologías Utilizadas
*   **Python:** Modelado lógico inicial (`ecoCity.py`).
*   **JavaScript (ES6+):** Motor de simulación dinámico en tiempo real.
*   **HTML5/CSS3:** Interfaz de usuario premium con diseño *Glassmorphism* y modo oscuro.
*   **Chart.js:** Visualización de datos estadísticos y gráficas evolutivas.

---

## 📁 Estructura del Repositorio
*   `ecoCity.py`: Código fuente original del modelo en Python.
*   `index.html`: Estructura del tablero de control (Principal).
*   `style.css`: Estilos visuales futuristas.
*   `simulation.js`: El "Cerebro" con la lógica matemática y distribuciones.
*   `ui.js`: Controlador de la interfaz y actualización de gráficas.

---

## 🎮 Cómo Iniciar la Simulación
1.  Clona este repositorio: `git clone https://github.com/Sofi-06/EcoCity.git`
2.  Entra en la carpeta `frontend/`.
3.  Abre el archivo `index.html` en cualquier navegador moderno.
4.  Configura tus parámetros iniciales y presiona **"Iniciar Simulación"**.

---

## 📈 Escenarios Analizados
El sistema permite alternar entre 4 escenarios preconfigurados que modifican las tasas de recuperación ambiental y crecimiento:
*   **Equilibrado:** Desarrollo moderado.
*   **Sostenible:** Alta inversión en renovables y baja contaminación.
*   **Crítico:** Crecimiento poblacional acelerado.
*   **Crisis Ambiental:** Recuperación natural mínima.

---

*Desarrollado para el análisis de sistemas y simulación de modelos complejos.*
