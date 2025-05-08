import cv2
import numpy as np
import matplotlib.pyplot as plt

# -------------------------------------------------------------------
# Función para calcular ángulo entre dos vectores
# -------------------------------------------------------------------
def calcular_angulo(v1, v2):
    dot   = np.dot(v1, v2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    angle_rad = np.arccos(dot / (norm1 * norm2))
    return np.degrees(angle_rad)

# -------------------------------------------------------------------
# Parámetros e inicialización de la figura
# -------------------------------------------------------------------
num_samples = preds_eroded.shape[0]
label_colors = {
    1: (0,   0, 255),   # fémur → rojo
    2: (0, 255,   0),   # tibia → verde
    3: (255, 0,   0),   # rótula → azul
}

plt.figure(figsize=(15, num_samples * 3))

for i in range(num_samples):
    # — Datos de entrada y máscaras
    img     = sample_images[i].squeeze()
    true_m  = true_classes[i]
    er_mask = preds_eroded[i]

    # — Subplot 1: input
    plt.subplot(num_samples, 4, i*4 + 1)
    plt.imshow(img, cmap='gray')
    plt.axis('off'); plt.title('Imagen MRI')

    # — Subplot 2: ground-truth
    plt.subplot(num_samples, 4, i*4 + 2)
    plt.imshow(true_m, cmap='nipy_spectral', vmin=0, vmax=NUM_CLASSES-1)
    plt.axis('off'); plt.title('Máscara Manual')

    # — Preparamos BGR para dibujar
    vis = cv2.cvtColor(
        (er_mask * (255/(NUM_CLASSES-1))).astype(np.uint8),
        cv2.COLOR_GRAY2BGR
    )

    # — Detectamos centroides con distanceTransform
    centroids = {}
    for lbl, color in label_colors.items():
        bin_mask = (er_mask == lbl).astype(np.uint8)
        if bin_mask.sum() == 0:
            continue

        dt = cv2.distanceTransform(bin_mask, cv2.DIST_L2, 5)
        _, maxVal, _, maxLoc = cv2.minMaxLoc(dt)
        cx, cy = maxLoc
        centroids[lbl] = (cx, cy)

        # Dibujar círculo y “X”
        radius = int(maxVal)
        cv2.circle(vis, (cx, cy), radius, color=color, thickness=2)
        cv2.drawMarker(vis, (cx, cy), color=color,
                       markerType=cv2.MARKER_TILTED_CROSS,
                       markerSize=20, thickness=2)

    # — Cálculo del ángulo Q si están los tres centroides
    if all(k in centroids for k in (1, 2, 3)):
        p_femur  = np.array(centroids[1])
        p_tibia  = np.array(centroids[2])
        p_patela = np.array(centroids[3])

        # Vector desde rótula a fémur y desde rótula a tibia
        v1 = p_femur  - p_patela
        v2 = p_tibia  - p_patela
        ang_Q = calcular_angulo(v1, v2)

        # — Dibujo de las líneas que forman el ángulo Q
        cv2.line(vis,
                 tuple(p_patela),
                 tuple(p_femur),
                 label_colors[1],
                 thickness=2)
        cv2.line(vis,
                 tuple(p_patela),
                 tuple(p_tibia),
                 label_colors[2],
                 thickness=2)

        # Anotar en la imagen el valor de Q
        cv2.putText(vis,
                    f"Q: {ang_Q:.1f}°",
                    (int(p_patela[0]+10), int(p_patela[1]-10)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6, (255,255,255), 2)

        print(f"Sample {i}: ángulo Q = {ang_Q:.2f}°")
    else:
        print(f"Sample {i}: faltan centroides para calcular Q.")

    # — Subplot 3: máscara erosionada
    plt.subplot(num_samples, 4, i*4 + 3)
    plt.imshow(er_mask, cmap='nipy_spectral', vmin=0, vmax=NUM_CLASSES-1)
    plt.axis('off'); plt.title('Mascára erosionada')

    # — Subplot 4: visualización final
    plt.subplot(num_samples, 4, i*4 + 4)
    plt.imshow(cv2.cvtColor(vis, cv2.COLOR_BGR2RGB))
    plt.axis('off'); plt.title('Centroides & Ángulo Q')

plt.tight_layout()
plt.show()