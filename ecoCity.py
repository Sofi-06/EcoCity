import numpy as np
import matplotlib.pyplot as plt

# -----------------------------
# CONFIGURACIÓN INICIAL
# -----------------------------

dias = 40  # Tiempo de simulación

# Variables iniciales
poblacion_inicial = 1000
recursos_iniciales = 50000  # Mucho mayor duración
contaminacion_inicial = 20

# Listas para guardar los valores en el tiempo
poblacion = [poblacion_inicial]
recursos = [recursos_iniciales]
contaminacion = [contaminacion_inicial]
felicidad = []

# Parámetros del modelo
tasa_crecimiento = 0.01        # Crecimiento diario población (aumentado)
consumo_por_persona = 0.07     # Recursos consumidos por persona (muy reducido)
factor_contaminacion = 0.02    # Contaminación generada por persona (restaurado)
recuperacion_contaminacion = 8 # Reducción natural contaminación (muy aumentado)

# -----------------------------
# SIMULACIÓN
# -----------------------------

for dia in range(dias):

    # ---- POBLACIÓN ----
    # Crecimiento proporcional a la población actual
    nueva_poblacion = poblacion[-1] * (1 + tasa_crecimiento)
    poblacion.append(nueva_poblacion)

    # ---- RECURSOS ----
    # Consumo depende de cuántas personas hay
    consumo_total = nueva_poblacion * consumo_por_persona
    nuevos_recursos = recursos[-1] - consumo_total

    # Evita que los recursos sean negativos
    nuevos_recursos = max(nuevos_recursos, 0)
    recursos.append(nuevos_recursos)

    # ---- CONTAMINACIÓN ----
    # Aumenta por población y baja por recuperación natural
    nueva_contaminacion = (
        contaminacion[-1]
        + nueva_poblacion * factor_contaminacion
        - recuperacion_contaminacion
    )

    nueva_contaminacion = max(nueva_contaminacion, 0)
    contaminacion.append(nueva_contaminacion)

    # ---- FELICIDAD ----
    # Depende positivamente de recursos
    # Depende negativamente de contaminación


    # Nueva fórmula de felicidad, menos severa
    indice_felicidad = (
        (nuevos_recursos / recursos_iniciales) * 80
        - (nueva_contaminacion / 200) * 10
    )

    # Se limita entre 0 y 100
    indice_felicidad = max(0, min(100, indice_felicidad))
    felicidad.append(indice_felicidad)

    # ---- COLAPSO DE LA CIUDAD ----
    if nuevos_recursos < 50 or nueva_contaminacion > 300:
        print(f"⚠️ La ciudad entró en crisis en el día: {dia+1}")
        break

# -----------------------------
# GRÁFICAS
# -----------------------------

# 1️⃣ Población
plt.figure()
plt.plot(poblacion)
plt.title("Población en el tiempo")
plt.xlabel("Días")
plt.ylabel("Habitantes")


# 2️⃣ Contaminación
plt.figure()
plt.plot(contaminacion)
plt.title("Contaminación en el tiempo")
plt.xlabel("Días")
plt.ylabel("Nivel de contaminación")


# 3️⃣ Recursos
plt.figure()
plt.plot(recursos)
plt.title("Recursos en el tiempo")
plt.xlabel("Días")
plt.ylabel("Recursos disponibles")


# 4️⃣ Felicidad
plt.figure()
plt.plot(felicidad)
plt.title("Felicidad en el tiempo")
plt.xlabel("Días")
plt.ylabel("Índice de felicidad (0 - 100)")


# 5️⃣ Histograma de consumo energético simulado
consumo_energia = np.random.normal(15, 3, 50)

plt.figure()
plt.hist(consumo_energia, bins=10)
plt.title("Distribución del Consumo Energético")
plt.xlabel("Consumo por persona (kWh)")
plt.ylabel("Frecuencia")
plt.show()