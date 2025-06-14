const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class Alert extends Model {}

Alert.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    alert_type: {
      type: DataTypes.STRING(50),
    },
    alert_message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('sent', 'delivered', 'read'),
      defaultValue: 'sent',
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    threat_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Threats',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Alert',
    tableName: 'Alerts',
    timestamps: false,
  }
);

module.exports = Alert;
