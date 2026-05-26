# BioKnee

Aplicación móvil y backend de microservicios para apoyo clínico en el análisis de rodilla, con enfoque en:

- Gestión de doctores y pacientes.
- Registro y consulta de pacientes por doctor.
- Segmentación de imágenes de rodilla.
- Cálculo automático del ángulo Q a partir de centroides anatómicos.

## Arquitectura del proyecto

El repositorio está organizado en tres piezas principales:

1. **App móvil (React Native + Expo)**
   - Interfaz para registro/login.
   - Flujo para médicos: alta de pacientes y consulta de lista/detalle.
   - Pantalla de resultados de análisis.

2. **Microservicio de usuarios (`userservice`)**
   - API REST con Express + MongoDB.
   - Registro de doctores y pacientes.
   - Login con JWT.
   - Consulta de pacientes asociados al doctor autenticado.

3. **Microservicio de segmentación (`segmenter`)**
   - API REST en Flask.
   - Carga de modelo TFLite desde GridFS.
   - Segmentación de imagen, erosión de máscaras, centroides y ángulo Q.

## Estructura relevante

```text
.
├── App.js
├── HomeScreen.js
├── LoginScreen.js
├── DoctorHomeScreen.js
├── PatientListScreen.js
├── PatientDetailScreen.js
├── AngleResultScreen.js
├── userservice/
│   ├── Server_users.js
│   ├── Dockerfile
│   └── package.json
├── segmenter/
│   ├── server_segmentation.py
│   ├── Dockerfile
│   └── requirements.txt
└── docker-compose.yml
```

## Requisitos

- **Node.js** 18+
- **npm** 9+
- **Python** 3.10+
- **Docker** y **Docker Compose**
- **Expo CLI** (opcional, para desarrollo local de la app)

## Variables y puertos por defecto

### `docker-compose.yml`

- `mongo`: `27017`
- `userservice`: `3000`
- `segmenter`: `5000`

Variables declaradas actualmente:

- `SECRET_KEY=clave_secreta`
- `MONGO_URL=mongodb://mongo:27017/users` (userservice)
- `MONGO_URL=mongodb://mongo:27017/rodilla_tasks` (segmenter)

## Levantar el entorno con Docker

Desde la raíz del repositorio:

```bash
docker compose up --build
```

Esto levantará:

- MongoDB
- API de usuarios
- API de segmentación

## Ejecutar la app móvil

Instala dependencias en la raíz del proyecto:

```bash
npm install
```

Inicia Expo:

```bash
npm run start
```

También puedes usar:

```bash
npm run android
npm run ios
npm run web
```

## API de usuarios (Express)

Base URL (local): `http://localhost:3000`

### Endpoints

- `POST /register-doctor`
- `POST /register-patient` (requiere token)
- `POST /login`
- `GET /patients` (requiere token)
- `GET /profile` (requiere token)

### Header de autenticación

```http
Authorization: Bearer <token>
```

## API de segmentación (Flask)

Base URL (local): `http://localhost:5000`

### Endpoint

- `POST /segment`
  - Form-data: campo `image`

### Respuesta esperada

JSON con:

- `mask_png_b64`
- `overlay_png_b64`
- `angle_q`
- `centroids`

## Flujo funcional resumido

1. Un doctor se registra o inicia sesión.
2. El doctor registra pacientes asociados a su cuenta.
3. El doctor consulta su listado de pacientes.
4. Se envía una imagen al microservicio de segmentación.
5. El sistema devuelve máscara, overlay y ángulo Q calculado.

## Notas importantes

- El microservicio de segmentación busca el modelo TFLite en GridFS con nombre:
  - `U-Net_entrenada_DA_45e_GPU.tflite`
- En el repositorio existe un archivo `.h5`; para usar el flujo actual, debes asegurar que el `.tflite` esté cargado en la base correspondiente.
- `segmenter/server_segmentation.py` usa actualmente conexión Mongo local (`mongodb://localhost:27017/`); si se ejecuta en contenedor, conviene parametrizarlo por variable de entorno para usar `mongo` como host.

## Posibles mejoras

- Externalizar configuración en `.env` para todos los servicios.
- Añadir tests automatizados (unitarios/integración).
- Documentar contrato de API con OpenAPI/Swagger.
- Añadir pipeline CI/CD.
- Manejo robusto de errores y observabilidad (logs estructurados, métricas).

## Licencia

Pendiente de definición.
