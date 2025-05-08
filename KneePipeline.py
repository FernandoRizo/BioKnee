import numpy as np
import cv2
from tensorflow.keras.models import load_model


# 1. Parámetros globales
MODEL_PATH    = "path/to/U-Net_entrenada.h5"
IMAGE_DIR     = "data/images/"      # carpeta con tus MRI
IMG_SIZE      = (256, 256)          # tamaño que espera la U-Net
NUM_CLASSES   = 4                   # cuántas etiquetas (incluyendo fondo)

# 2. Funciones
def load_unet_model(path: str):
    """Carga y devuelve el modelo U-Net desde un .h5."""
    return load_model(path)

def load_and_preprocess_images(image_paths, target_size):
    """Carga en escala de grises, resize y normaliza [0,1]."""
    from tensorflow.keras.preprocessing.image import load_img, img_to_array
    imgs = []
    for p in image_paths:
        img = load_img(p, color_mode="grayscale", target_size=target_size)
        arr = img_to_array(img) / 255.0
        imgs.append(arr)
    return np.stack(imgs, axis=0)

def predict_classes(model, images: np.ndarray):
    """Ejecuta el modelo y extrae la clase más probable por píxel."""
    preds = model.predict(images)                   # (N, H, W, C)
    return np.argmax(preds, axis=-1).astype(np.uint8)  # (N, H, W)

def erode_masks(preds: np.ndarray, classes=[1,2,3], ksize=(3,3), iters=2):
    """Aplica erosión morfológica a cada etiqueta específica."""
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, ksize)
    eroded = []
    for pc in preds:
        er = np.zeros_like(pc, dtype=np.uint8)
        for lbl in classes:
            mask = (pc == lbl).astype(np.uint8) * 255
            e    = cv2.erode(mask, kernel, iterations=iters)
            er[e>0] = lbl
        eroded.append(er)
    return np.stack(eroded, axis=0)

def compute_centroids(eroded: np.ndarray, classes=[1,2,3]):
    """
    Para cada máscara erosionada, calcula el centroide (punto más interior)
    usando distanceTransform y minMaxLoc.
    """
    all_centroids = []
    for mask in eroded:
        cents = {}
        for lbl in classes:
            bin_m = (mask == lbl).astype(np.uint8)
            if bin_m.sum() == 0: 
                continue
            dt = cv2.distanceTransform(bin_m, cv2.DIST_L2, 5)
            _, _, _, loc = cv2.minMaxLoc(dt)
            cents[lbl] = loc
        all_centroids.append(cents)
    return all_centroids

def calculate_Q_angles(centroids_list):
    """Calcula el ángulo Q entre los vectores fémur–rótula y tibia–rótula."""
    angles = []
    for cents in centroids_list:
        if all(k in cents for k in (1,2,3)):
            pF = np.array(cents[1]); pT = np.array(cents[2]); pR = np.array(cents[3])
            v1 = pF - pR; v2 = pT - pR
            dot = np.dot(v1, v2); n1 = np.linalg.norm(v1); n2 = np.linalg.norm(v2)
            ang = 0.0 if n1==0 or n2==0 else np.degrees(np.arccos(dot/(n1*n2)))
        else:
            ang = None
        angles.append(ang)
    return angles

# 3. Pipeline principal
if __name__ == "__main__":
    import glob

    # 3.1. Cargar modelo
    model = load_unet_model(MODEL_PATH)
    # 3.2. Cargar imágenes de validación (o de prueba)
    img_paths = glob.glob(IMAGE_DIR + "*.png")
    images    = load_and_preprocess_images(img_paths, IMG_SIZE)

    # 3.3. Inferencia y extracción de clases
    preds_cls   = predict_classes(model, images)

    # 3.4. Erosión morfológica
    preds_erode = erode_masks(preds_cls)

    # 3.5. Centroides
    cents_list  = compute_centroids(preds_erode)

    # 3.6. Ángulo Q
    angles_Q    = calculate_Q_angles(cents_list)

    # 3.7. Mostrar resultados
    for idx, ang in enumerate(angles_Q):
        print(f"Imagen {idx}: ángulo Q = {ang if ang is not None else 'no definido'}°")
