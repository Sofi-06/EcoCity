import random

#for i in range(10):
 #print(random.random())

""" 
random.seed(10)
print("Primera:", random.random())

random.seed(10.00000000001)
print("Segunda:", random.random())

"""
 
import matplotlib.pyplot as plt
 
"""
datos=[random.random() for _ in range(1000)]
plt.hist(datos, bins=10)
plt.xlabel('Valor')
plt.ylabel('Frecuencia')
plt.title('Distribución Uniforme')
plt.show()
"""

import numpy as np

#Media = 0, Desviacion =1, 1000 valores
normal = np.random.normal(0, 1, 1000)

plt.hist(normal, bins=30)
plt.xlabel('Valor')
plt.ylabel('Frecuencia')
plt.title('Distribución Normal')
plt.show()