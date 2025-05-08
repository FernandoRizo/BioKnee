// db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // Archivo de base de datos SQLite
  logging: true  // Opcional: para evitar mensajes de log en consola
});

module.exports = sequelize;
