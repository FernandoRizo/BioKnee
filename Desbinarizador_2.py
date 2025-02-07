import os
import numpy as np
import matplotlib.pyplot as plt
import time

# Directorio donde se guardarán las imágenes
output_dir = "C:/Users/dayaa/Documents/Ing biomedica/Proyectos/Modular/0376"  # Ruta de la carpeta de salida
if not os.path.exists(output_dir):
    os.makedirs(output_dir)  # Crea la carpeta si no existe

# Carga el archivo .npy con la ruta específica
imagen_array = np.load("C:/Users/dayaa/Documents/Ing biomedica/Proyectos/NPY/0376.npy") # Cambia la ruta según donde tengas los NPY a analizar.

# Muestra la serie de imágenes mediante el for
for i in range(len(imagen_array)):
    plt.imshow(imagen_array[i])
    plt.axis('off')  # Desactiva los ejes
    plt.savefig(os.path.join(output_dir, f"imagen_{i}.png"))  # Guarda la imagen en la carpeta de salida
   # plt.show() #Para mostrar cada figura del NPY