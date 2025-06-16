const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class Threat extends Model {}

Threat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    threat_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    severity_level: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 10,
      },
    },
    recommended_action: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    data_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'IoTData',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Threat',
    tableName: 'Threats',
    timestamps: false,
  }
);

module.exports = Threat;
