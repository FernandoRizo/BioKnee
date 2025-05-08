# upload_model_tflite.py

import os
import io
from pymongo import MongoClient
import gridfs
import tensorflow as tf

# 1) Parámetros y paths
BASE_DIR       = os.path.dirname(os.path.abspath(__file__))
H5_FILENAME    = 'U-Net_entrenada_DA_45e_GPU.h5'
TFLITE_FILENAME= 'U-Net_entrenada_DA_45e_GPU.tflite'
H5_PATH        = os.path.join(BASE_DIR, H5_FILENAME)

# 2) Carga el modelo Keras y conviértelo a TFLite
print("Cargando modelo Keras desde", H5_PATH)
model = tf.keras.models.load_model(H5_PATH, compile=False)

print("Convirtiendo a TFLite…")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

# 3) Conecta a MongoDB y GridFS
client = MongoClient('mongodb://localhost:27017/')
db     = client['rodilla_tasks']
fs     = gridfs.GridFS(db)

# 4) (Opcional) Remueve versiones antiguas del mismo filename
for old in fs.find({'filename': TFLITE_FILENAME}):
    fs.delete(old._id)
    print(f"– Eliminado '{TFLITE_FILENAME}' (id {old._id}) de GridFS")

# 5) Sube el buffer TFLite directamente
buf = io.BytesIO(tflite_model)
buf.seek(0)
fs.put(buf, filename=TFLITE_FILENAME)
print(f"Modelo TFLite subido a GridFS como '{TFLITE_FILENAME}'")
