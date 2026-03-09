import numpy as np
import matplotlib.pyplot as plt

fallas = 2
dias = 30

fallas_por_dia = np.random.poisson(fallas, dias)

print("Número de fallas por día durante 30 días:", fallas_por_dia)
print("Promedio real obtenido en la simulación:")
print(np.mean(fallas_por_dia))

plt.figure()
plt.hist(fallas_por_dia,
         bins=range(0, max(fallas_por_dia)+2),
         align='left')

plt.xlabel('Número de fallas por día')
plt.ylabel('Frecuencia (cantidad de días)')
plt.title('Distribución de fallas por día (Poisson)')
plt.show()