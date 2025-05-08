const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  nombres: { type: String, required: true },
  apellidoPaterno: { type: String, required: true },
  apellidoMaterno: { type: String, required: true },
  CURP: { type: String, unique: true, required: true },
  NumeroCedula: { type: String, unique: true, required: true },
  role: { type: String, default: 'Doctor' }
});

doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

doctorSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Se exporta el modelo 'Doctor' usando el esquema doctorSchema y se guardará en la colección 'doctors'
module.exports = mongoose.model('Doctor', doctorSchema);
