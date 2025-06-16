const Threat = require('../models/threat');
const { Op } = require('sequelize');
const Location = require('../models/location');

// Отримати загрози за рівнем серйозності
const getThreatsBySeverity = async (level) => {
  return await Threat.findAll({ where: { severity_level: level } });
};

// Створити нову загрозу
const createThreat = async (data) => {
  try {
    const threat = await Threat.create(data);
    return threat;
  } catch (error) {
    throw new Error('Error creating threat');
  }
};

// Отримати всі загрози
const getAllThreats = async () => {
  try {
    const threats = await Threat.findAll();
    return threats;
  } catch (error) {
    throw new Error('Error retrieving threats');
  }
};

// Отримати загрозу за ID
const getThreatById = async (id) => {
  try {
    const threat = await Threat.findByPk(id);
    if (!threat) throw new Error('Threat not found');
    return threat;
  } catch (error) {
    throw new Error('Error retrieving threat');
  }
};

// Оновити дані загрози
const updateThreat = async (id, data) => {
  try {
    const threat = await Threat.findByPk(id);
    if (!threat) throw new Error('Threat not found');
    await threat.update(data);
    return threat;
  } catch (error) {
    throw new Error('Error updating threat');
  }
};

// Видалити загрозу
const deleteThreat = async (id) => {
  try {
    const threat = await Threat.findByPk(id);
    if (!threat) throw new Error('Threat not found');
    await threat.destroy();
    return { message: 'Threat deleted successfully' };
  } catch (error) {
    throw new Error('Error deleting threat');
  }
};

// Отримати поточні загрози, що потребують уваги
const getCurrentThreats = async () => {
  try {
    const threats = await Threat.findAll({
      where: {
        severity_level: {
          [Op.gte]: 7, // severity_level >= 7
        },
      },
    });
    return threats;
  } catch (error) {
    throw new Error('Error retrieving current threats');
  }
};

// Отримати загрози для конкретної локації
const getThreatsByLocation = async (locationId) => {
  try {
    const threats = await Threat.findAll({
      where: {
        data_id: locationId, // data_id як зовнішній ключ для локацій
      },
    });
    return threats;
  } catch (error) {
    throw new Error('Error retrieving threats for location');
  }
};

module.exports = {
  getThreatsBySeverity,
  createThreat,
  getAllThreats,
  getThreatById,
  updateThreat,
  deleteThreat,
  getCurrentThreats,
  getThreatsByLocation,
};
