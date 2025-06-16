const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class Location extends Model {}

Location.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    location_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: 'Location',
    tableName: 'Locations',
    timestamps: false,
  }
);

module.exports = Location;
