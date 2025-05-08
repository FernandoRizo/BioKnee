const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const Patient = require('./PatientModel'); // Nuestro modelo de usuario
const Doctor = require('./DoctorModel'); // Modelo de doctor
const app = express();

app.use(express.json());
app.use(cors()); // Permite peticiones desde React Native

// Clave secreta y URL de MongoDB (idealmente en variables de entorno)
const SECRET_KEY = process.env.SECRET_KEY || 'clave_secreta';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/users';

// Conectar a MongoDB
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error(err));

// Ruta de registro
/*app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ message: 'Usuario registrado' });
    } catch (err) {
        res.status(400).json({ error: 'Error al registrar usuario', details: err.message });
    }
});*/
app.post('/register-patient', authMiddleware, async (req, res) => {
  try {
    const { email, password, fullName, curp } = req.body;
    // doctorId se toma del token del doctor autenticado
    const doctorId = req.userId;
    
    // Crea un nuevo paciente usando el modelo Patient, asignando doctorId
    const patient = new Patient({ email, password, fullName, curp, doctorId });
    await patient.save();
    
    res.status(201).json({ message: 'Paciente registrado' });
  } catch (err) {
    console.error('Error al registrar paciente:', err);
    res.status(400).json({ error: 'Error al registrar paciente', details: err.message });
  }
});

app.post('/register-doctor', async (req, res) => {
    try {
      const { email, password, nombres, apellidoPaterno, apellidoMaterno, CURP, NumeroCedula } = req.body;
      const doctor = new Doctor({ email, password, nombres, apellidoPaterno, apellidoMaterno, CURP, NumeroCedula });
      await doctor.save();
      res.status(201).json({ message: 'Doctor registrado' });
    } catch (err) {
      
      console.error('Error al registrar doctor:', err);
      res.status(400).json({ error: 'Error al registrar Doctor', details: err.message });
    }
  });
  

// Ruta de login
app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      // Buscar primero en doctores
      let user = await Doctor.findOne({ email });
      // Si no se encuentra en doctores, buscar en pacientes
      if (!user) {
        user = await Patient.findOne({ email });
      }
      if (!user) return res.status(401).json({ error: 'Usuario no encontrado', details: err.message });
      
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });
  
      // Generar token JWT usando el _id del usuario
      const token = jwt.sign({ sub: user._id }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token });
    } catch (err) {
      res.status(400).json({ error: 'Error al iniciar sesión', details: err.message });
    }
  });

// Protección de ruta y filtrado por doctorId
app.get('/patients', authMiddleware, async (req, res) => {
  try {
    // req.userId viene del middleware authMiddleware y corresponde al id del doctor autenticado
    const patients = await Patient.find({ doctorId: req.userId }).select('-password');
    res.json(patients);
  } catch (err) {
    res.status(400).json({ error: 'Error al obtener pacientes', details: err.message });
  }
});

  
  
// Middleware de autenticación

function authMiddleware(req, res, next) {
  console.log("Authorization header:", req.headers['authorization']);
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token no proporcionado' });
  
  const token = authHeader.split(' ')[1];
  console.log("Token extraído:", token);
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error("Error de verificación del token:", err);
      return res.status(403).json({ error: 'Token inválido', details: err.message });
    }
    req.userId = decoded.sub;
    next();
  });
}



// Ruta protegida de perfil
app.get('/profile', authMiddleware, async (req, res) => {
    try {
      let user = await Doctor.findById(req.userId).select('-password');
      if (!user) {
        user = await Patient.findById(req.userId).select('-password');
      }
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: 'Error al obtener el perfil', details: err.message });
    }
  });

app.listen(3000, () => {
    console.log('Microservicio de Usuarios ejecutándose en el puerto 3000');
});
