from flask import Flask, request, jsonify, Response
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson.objectid import ObjectId
import gridfs

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'clave_secreta'  # Debe coincidir con el servidor de usuarios

jwt_manager = JWTManager(app)

# Conectar a MongoDB usando la BD "rodilla_tasks"
client = MongoClient('mongodb://mongodb:27017/')
db = client.rodilla_tasks

# Crear instancia de GridFS para almacenar archivos
fs = gridfs.GridFS(db)

# Colección donde se guardan las tareas
tasks_collection = db.tasks

# Endpoint para obtener todas las tareas del usuario autenticado
@app.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    current_user = get_jwt_identity()  # 'sub' del token
    tasks = list(tasks_collection.find({'user_id': current_user}))
    for task in tasks:
        task['_id'] = str(task['_id'])
        if 'image_id' in task and task['image_id']:
            task['image_id'] = str(task['image_id'])
    return jsonify(tasks), 200

# Endpoint para crear una tarea (y cargar una imagen)
# Se usa multipart/form-data para enviar campos y archivos.
@app.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    current_user = get_jwt_identity()
    # Usamos request.form para obtener los campos y request.files para el archivo
    title = request.form.get('title')
    description = request.form.get('description')
    
    # Se verifica si se envió un archivo con la clave 'image'
    file = request.files.get('image')
    
    image_id = None
    if file:
        # Guardar el archivo en GridFS
        image_id = fs.put(file, filename=file.filename, content_type=file.content_type)
    
    task = {
        'title': title,
        'description': description,
        'user_id': current_user,
        'image_id': image_id  # Guarda el ObjectId de la imagen, o None si no se subió
    }
    result = tasks_collection.insert_one(task)
    return jsonify({'message': 'Tarea creada', 'task_id': str(result.inserted_id)}), 201

# Endpoint para obtener la imagen mediante su file_id
@app.route('/tasks/image/<file_id>', methods=['GET'])
def get_task_image(file_id):
    try:
        file = fs.get(ObjectId(file_id))
        # Devuelve el contenido de la imagen con el mimetype correspondiente
        return Response(file.read(), mimetype=file.content_type)
    except Exception as e:
        return jsonify({'error': 'Imagen no encontrada', 'details': str(e)}), 404

# Endpoint para eliminar una tarea por ID
@app.route('/tasks/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    current_user = get_jwt_identity()
    result = tasks_collection.delete_one({'_id': ObjectId(task_id), 'user_id': current_user})
    if result.deleted_count == 0:
        return jsonify({'error': 'Tarea no encontrada'}), 404
    return jsonify({'message': 'Tarea eliminada'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
