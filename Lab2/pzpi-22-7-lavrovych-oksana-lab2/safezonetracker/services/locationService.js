const Location = require("../models/location");

// Створити нову локацію
const createLocation = async (data) => {
  try {
    const location = await Location.create(data);
    return location;
  } catch (error) {
    throw new Error('Error creating location');
  }
};

// Отримати всі локації
const getAllLocations = async () => {
  try {
    const locations = await Location.findAll();
    return locations;
  } catch (error) {
    throw new Error('Error retrieving locations');
  }
};

// Отримати локацію за ID
const getLocationById = async (id) => {
  try {
    const location = await Location.findByPk(id);
    if (!location) throw new Error('Location not found');
    return location;
  } catch (error) {
    throw new Error('Error retrieving location');
  }
};

// Оновити дані локації
const updateLocation = async (id, data) => {
  try {
    const location = await Location.findByPk(id);
    if (!location) throw new Error('Location not found');
    await location.update(data);
    return location;
  } catch (error) {
    throw new Error('Error updating location');
  }
};

// Видалити локацію
const deleteLocation = async (id) => {
  try {
    const location = await Location.findByPk(id);
    if (!location) throw new Error('Location not found');
    await location.destroy();
    return { message: 'Location deleted successfully' };
  } catch (error) {
    throw new Error('Error deleting location');
  }
};

module.exports = {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
};
