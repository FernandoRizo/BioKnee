
 # BioKnee
-Aplicación orientada para ayudar al usuario con problemas de rótula.

+## Objetivo general
+
+BioKnee busca apoyar el análisis clínico de rodilla mediante:
+
+- Segmentación de estructuras anatómicas en imágenes.
+- Procesamiento morfológico de máscaras (erosión/desbinarización).
+- Obtención de centroides anatómicos.
+- Cálculo del ángulo Q como salida cuantitativa.
+
+---
+
+## 1) Contenido de la rama `main` (IA)
+
+En esta rama se encuentra el desarrollo del pipeline de IA y experimentación:
+
+```text
+.
+├── U_Net_BioKnee_Algoritmo.ipynb
+├── U_Net_BioKnee_Actualizada.ipynb
+├── U-net2D_Rotula.ipynb
+├── Desbinarizador_2.py
+├── ConvierT.p
+├── ConvierTT.m
+├── ConvierTT.fig
+└── Convertidor2.m
+```
+
+### Descripción breve
+
+- **Notebooks U-Net (`.ipynb`)**: entrenamiento/ajustes de modelos para segmentación de rodilla-rótula.
+- **`Desbinarizador_2.py`**: utilidades de posprocesado de máscara.
+- **Scripts/archivos auxiliares (`.m`, `.p`, `.fig`)**: apoyo para conversión/procesamiento en flujo de investigación.
+
+### Requisitos sugeridos para IA
+
+- **Python 3.10+**
+- Jupyter Notebook / JupyterLab
+- Dependencias de visión por computador y ML (según notebook)
+
+> Nota: al ser una rama enfocada en investigación, las dependencias exactas pueden variar por notebook.
+
+---
+
+## 2) Integración con la rama de aplicación móvil
+
+La aplicación móvil y los microservicios (documentados previamente) consumen el resultado de esta IA para su flujo clínico.
+
+### Arquitectura funcional (app + servicios)
+
+1. **App móvil (React Native + Expo)**
+   - Registro/login de doctor.
+   - Alta y consulta de pacientes.
+   - Visualización de resultados del análisis.
+
+2. **Microservicio de usuarios (`userservice`)**
+   - API REST con Express + MongoDB.
+   - Registro de doctores/pacientes y autenticación JWT.
+
+3. **Microservicio de segmentación (`segmenter`)**
+   - API REST en Flask.
+   - Carga del modelo TFLite desde GridFS.
+   - Segmentación + centroides + ángulo Q.
+
+### Estructura esperada en la rama móvil/microservicios
+
+```text
+.
+├── App.js
+├── HomeScreen.js
+├── LoginScreen.js
+├── DoctorHomeScreen.js
+├── PatientListScreen.js
+├── PatientDetailScreen.js
+├── AngleResultScreen.js
+├── userservice/
+│   ├── Server_users.js
+│   ├── Dockerfile
+│   └── package.json
+├── segmenter/
+│   ├── server_segmentation.py
+│   ├── Dockerfile
+│   └── requirements.txt
+└── docker-compose.yml
+```
+
+### Puertos y variables (rama app/microservicios)
+
+- `mongo`: `27017`
+- `userservice`: `3000`
+- `segmenter`: `5000`
+
+Variables comunes:
+
+- `SECRET_KEY=clave_secreta`
+- `MONGO_URL=mongodb://mongo:27017/users` (userservice)
+- `MONGO_URL=mongodb://mongo:27017/rodilla_tasks` (segmenter)
+
+### Endpoints esperados
+
+**Usuarios (Express) — `http://localhost:3000`**
+
+- `POST /register-doctor`
+- `POST /register-patient` (token)
+- `POST /login`
+- `GET /patients` (token)
+- `GET /profile` (token)
+
+Header:
+
+```http
+Authorization: Bearer <token>
+```
+
+**Segmentación (Flask) — `http://localhost:5000`**
+
+- `POST /segment` (form-data `image`)
+
+Respuesta JSON:
+
+- `mask_png_b64`
+- `overlay_png_b64`
+- `angle_q`
+- `centroids`
+
+---
+
+## Flujo funcional unificado
+
+1. La IA segmenta la imagen y extrae centroides.
+2. Se calcula el ángulo Q automáticamente.
+3. El microservicio expone estos resultados vía API.
+4. La app móvil consume y presenta los resultados al médico.
+
+---
+
+## Notas importantes
+
+- El servicio de segmentación usa un modelo TFLite en GridFS con nombre esperado:
+  - `U-Net_entrenada_DA_45e_GPU.tflite`
+- Si existe un modelo `.h5` en artefactos de entrenamiento, debe convertirse/publicarse a `.tflite` para el flujo productivo.
+- En despliegue con Docker, la conexión Mongo debería parametrizarse por entorno para apuntar al host `mongo`.
+
+---
+
+## Próximas mejoras
+
+- Versionar dependencias de notebooks IA en un `requirements.txt`/`environment.yml` específico de `main`.
+- Publicar métricas de entrenamiento y validación del modelo en un reporte reproducible.
+- Documentar contrato OpenAPI para los microservicios.
+- Integrar CI/CD para validación de notebooks y servicios.
+
+---
+
+## Licencia
+
+Este proyecto se distribuye bajo la licencia MIT. Consulta `LICENSE` para más detalles.

