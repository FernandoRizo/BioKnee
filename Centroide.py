import cv2
import numpy as np
import matplotlib.pyplot as plt

num_samples = preds_eroded.shape[0]

# Colores BGR para cada hueso
label_colors = {
    1: (0,   0, 255),   # fémur → rojo
    2: (0, 255,   0),   # tibia → verde
    3: (255, 0,   0),   # rótula → azul
}

plt.figure(figsize=(15, num_samples * 3))

for i in range(num_samples):
    img     = sample_images[i].squeeze()   # escala de grises
    true_m  = true_classes[i]
    er_mask = preds_eroded[i]              # (H, W) con etiquetas 0–3

    # — Subplot 1: input
    plt.subplot(num_samples, 4, i*4 + 1)
    plt.imshow(img, cmap='gray')
    plt.axis('off'); plt.title('Imagen MRI')

    # — Subplot 2: ground-truth
    plt.subplot(num_samples, 4, i*4 + 2)
    plt.imshow(true_m, cmap='nipy_spectral',
               vmin=0, vmax=NUM_CLASSES-1)
    plt.axis('off'); plt.title('Mascára manual')

    # Preparamos la imagen BGR para dibujar círculos y cruces
    vis = cv2.cvtColor(
        (er_mask * (255/(NUM_CLASSES-1))).astype(np.uint8),
        cv2.COLOR_GRAY2BGR
    )

    # Para cada etiqueta calculamos núcleo y centroides
    for lbl, color in label_colors.items():
        bin_mask = (er_mask == lbl).astype(np.uint8)
        if bin_mask.sum() == 0:
            continue

        # Distance transform para hallar el punto más interior
        dt = cv2.distanceTransform(bin_mask, cv2.DIST_L2, 5)
        _, maxVal, _, maxLoc = cv2.minMaxLoc(dt)
        cx, cy  = maxLoc
        radius  = int(maxVal)

        # Dibujar círculo
        cv2.circle(vis, (cx, cy), radius,
                   color=color, thickness=2)

        # Dibujar la “X” en el centro
        cv2.drawMarker(vis, (cx, cy),
                       color=color,
                       markerType=cv2.MARKER_TILTED_CROSS,
                       markerSize=20,
                       thickness=2)