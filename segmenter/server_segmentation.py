# server_segmentation.py

from flask import Flask, request, jsonify
from pymongo import MongoClient
import gridfs, io, tempfile, os, base64
from PIL import Image
import numpy as np, cv2, tensorflow as tf

app = Flask(__name__)

# — Mongo + GridFS —
client = MongoClient('mongodb://localhost:27017/')
db     = client['rodilla_tasks']
fs     = gridfs.GridFS(db)

# — Params modelo TFLite —
TFLITE_FILENAME = 'U-Net_entrenada_DA_45e_GPU.tflite'
H, W            = 320, 224
NUM_CLASSES     = 4

# — Carga intérprete TFLite desde GridFS —
def load_tflite_from_gridfs(fn):
    gf = fs.find_one({'filename': fn})
    if not gf:
        raise FileNotFoundError(f"No se encontró '{fn}' en GridFS")
    tmp = tempfile.NamedTemporaryFile(suffix='.tflite', delete=False)
    tmp.write(gf.read()); tmp.flush(); tmp.close()
    return tmp.name

_model_path = load_tflite_from_gridfs(TFLITE_FILENAME)
interpreter = tf.lite.Interpreter(model_path=_model_path)
interpreter.allocate_tensors()
inp_det, out_det = interpreter.get_input_details(), interpreter.get_output_details()
os.remove(_model_path)

# — Pre / Post procesamiento —
def preprocess(pil: Image.Image):
    img = pil.convert('L').resize((W, H))
    arr = np.array(img, dtype=np.float32) / 255.0
    return arr.reshape(1, H, W, 1)

def erode_masks(mask):
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3,3))
    out = np.zeros_like(mask, dtype=np.uint8)
    for lbl in (1,2,3):
        m = (mask == lbl).astype(np.uint8) * 255
        e = cv2.erode(m, kernel, iterations=2)
        out[e>0] = lbl
    return out

def compute_centroids(er):
    cents = {}
    for lbl in (1,2,3):
        m = (er == lbl).astype(np.uint8)
        if m.sum()==0: continue
        dt = cv2.distanceTransform(m, cv2.DIST_L2, 5)
        _,_,_,loc = cv2.minMaxLoc(dt)
        cents[lbl] = loc
    return cents

def calc_Q(c):
    if all(k in c for k in (1,2,3)):
        pF = np.array(c[1]); pT = np.array(c[2]); pR = np.array(c[3])
        v1, v2 = pF-pR, pT-pR
        dot = np.dot(v1,v2); n1 = np.linalg.norm(v1); n2 = np.linalg.norm(v2)
        if n1>0 and n2>0:
            return float(np.degrees(np.arccos(dot/(n1*n2))))
    return None

@app.route('/segment', methods=['POST'])
def segment():
    f = request.files.get('image')
    if not f:
        return jsonify(error='No image'), 400

    try:
        pil = Image.open(io.BytesIO(f.read()))
    except Exception as e:
        return jsonify(error='Bad image', details=str(e)), 400

    # 1) Inferir máscara
    x    = preprocess(pil)
    interpreter.set_tensor(inp_det[0]['index'], x)
    interpreter.invoke()
    pred = interpreter.get_tensor(out_det[0]['index'])[0]  # (H,W,C)
    mask = np.argmax(pred, axis=-1).astype(np.uint8)      # (H,W)

    # 2) Erosión → centroides → Q
    eroded = erode_masks(mask)
    cents  = compute_centroids(eroded)
    angle  = calc_Q(cents)

    # 3) Generar máscara “cruda” en 0–255
    factor   = 255 // (NUM_CLASSES - 1)
    mask_vis = (mask * factor).astype(np.uint8)

    # 4) Generar overlay RGB sobre la imagen original
    vis = cv2.cvtColor(np.array(pil.resize((W,H))), cv2.COLOR_RGB2BGR)
    colors = {1:(0,0,255),2:(0,255,0),3:(255,0,0)}
    # pintar centroides
    for lbl,(x0,y0) in cents.items():
        cv2.circle(vis, (int(x0),int(y0)), 5, colors[lbl], 2)
        cv2.drawMarker(vis, (int(x0),int(y0)), colors[lbl],
                       markerType=cv2.MARKER_TILTED_CROSS,
                       markerSize=10, thickness=2)
    # pintar líneas y texto
    if angle is not None:
        pF,pT,pR = cents[1], cents[2], cents[3]
        cv2.line(vis, tuple(map(int,pR)), tuple(map(int,pF)), colors[1], 2)
        cv2.line(vis, tuple(map(int,pR)), tuple(map(int,pT)), colors[2], 2)
        cv2.putText(vis, f"Q: {angle:.1f}°",
                    (int(pR[0]+10), int(pR[1]-10)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2)

    # 5) Codificar ambas imágenes a base64
    _, buf_mask    = cv2.imencode('.png', mask_vis)
    _, buf_overlay = cv2.imencode('.png', vis)
    b64_mask       = base64.b64encode(buf_mask).decode('ascii')
    b64_overlay    = base64.b64encode(buf_overlay).decode('ascii')

    return jsonify({
      'mask_png_b64':    b64_mask,
      'overlay_png_b64': b64_overlay,
      'angle_q':         angle,
      'centroids':       {lbl:{'x':int(pt[0]),'y':int(pt[1])} for lbl,pt in cents.items()}
    }), 200

if __name__=='__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
