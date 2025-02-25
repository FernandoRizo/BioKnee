from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson.objectid import ObjectId
import jwt

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'clave_secreta'  # Debe coincidir con el microservicio de usuarios

jwt_manager = JWTManager(app)

# Conectar a MongoDB (usar una BD distinta, por ejemplo, "rodilla_tasks")
client = MongoClient('mongodb://mongodb:27017/')
db = client.rodilla_tasks
tasks_collection = db.tasks

# Endpoint para obtener todas las tareas del usuario autenticado
@app.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    current_user = get_jwt_identity()  # 'sub' que se incluyó en el token
    tasks = list(tasks_collection.find({'user_id': current_user}))
    for task in tasks:
        task['_id'] = str(task['_id'])
    return jsonify(tasks), 200

# Endpoint para crear una nueva tarea (o registrar un archivo subido)
@app.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    current_user = get_jwt_identity()
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    # Aquí se podrían añadir campos para manejar archivos (por ejemplo, URL o metadata)
    task = {
        'title': title,
        'description': description,
        'user_id': current_user
    }
    result = tasks_collection.insert_one(task)
    return jsonify({'message': 'Tarea creada', 'task_id': str(result.inserted_id)}), 201

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
