const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class IoTData extends Model {}

IoTData.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    temperature: {
      type: DataTypes.FLOAT,
    },
    humidity: {
      type: DataTypes.FLOAT,
    },
    gas_level: {
      type: DataTypes.FLOAT,
    },
    smoke_detected: {
      type: DataTypes.BOOLEAN,
    },
    alert_level: {
      type: DataTypes.INTEGER,
    },
    location_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Locations',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'IoTData',
    tableName: 'IoTData',
    timestamps: false,
  }
);

module.exports = IoTData;
