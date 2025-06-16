const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class UserAlert extends Model {}

UserAlert.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    alert_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Alerts',
        key: 'id',
      },
    },
    notification_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'UserAlert',
    tableName: 'UserAlerts',
    timestamps: false,
  }
);

module.exports = UserAlert;
