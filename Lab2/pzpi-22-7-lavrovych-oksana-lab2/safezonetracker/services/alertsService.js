const Alert = require('../models/alert');
const WebSocket = require('ws');

// Ініціалізація WebSocket-сервера
const wss = new WebSocket.Server({ port: 8080 });
let clients = [];

// Додаємо підключення до WebSocket
wss.on('connection', (ws) => {
  clients.push(ws);

  ws.on('close', () => {
    clients = clients.filter((client) => client !== ws);
  });
});

// Функція для надсилання повідомлення через WebSocket
const sendWebSocketNotification = (message) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

// Створити нове сповіщення
const createAlert = async (data) => {
  try {
    const alert = await Alert.create(data);

    // Надсилання повідомлення через WebSocket
    sendWebSocketNotification({
      type: 'NEW_ALERT',
      data: alert,
    });

    // Сповіщення користувачів
    await NotificationService.notifyUsers(alert);

    return alert;
  } catch (error) {
    throw new Error('Error creating alert: ' + error.message);
  }
};

// Отримати всі сповіщення
const getAllAlerts = async () => {
  try {
    const alerts = await Alert.findAll();
    return alerts;
  } catch (error) {
    throw new Error('Error retrieving alerts: ' + error.message);
  }
};

// Отримати сповіщення за ID
const getAlertById = async (id) => {
  try {
    const alert = await Alert.findByPk(id);
    if (!alert) throw new Error('Alert not found');
    return alert;
  } catch (error) {
    throw new Error('Error retrieving alert');
  }
};

// Оновити статус сповіщення
const updateAlertStatus = async (id, status) => {
  try {
    const alert = await Alert.findByPk(id);
    if (!alert) throw new Error('Alert not found');
    await alert.update({ status });
    return alert;
  } catch (error) {
    throw new Error('Error updating alert status');
  }
};

// Видалити сповіщення
const deleteAlert = async (id) => {
  try {
    const alert = await Alert.findByPk(id);
    if (!alert) throw new Error('Alert not found');
    await alert.destroy();
    return { message: 'Alert deleted successfully' };
  } catch (error) {
    throw new Error('Error deleting alert');
  }
};

class NotificationService {
    // Метод для надсилання сповіщень користувачам
    static async notifyUsers(alert) {
      try {
        // Отримання списку користувачів, які підписані на сповіщення для конкретної загрози
        const subscribedUsers = await this.getSubscribedUsers(alert.threat_id);
        
        // Створення записів у таблиці UserAlert для кожного підписаного користувача
        for (const user of subscribedUsers) {
          await UserAlert.create({
            user_id: user.id,
            alert_id: alert.id,
            notification_sent: false, // Сповіщення ще не надіслано
          });
        }
      } catch (error) {
        throw new Error('Error notifying users: ' + error.message);
      }
    }
  
    // Метод для отримання користувачів, підписаних на сповіщення для конкретної загрози
    static async getSubscribedUsers(threatId) {
      try {
        const users = await User.findAll({
          include: [{
            model: ThreatSubscription, // Модель, яка зберігає підписки на загрози
            where: { threat_id: threatId }
          }]
        });
        return users;
      } catch (error) {
        throw new Error('Error fetching subscribed users: ' + error.message);
      }
    }
  }

module.exports = {
  createAlert,
  getAllAlerts,
  getAlertById,
  updateAlertStatus,
  deleteAlert,
  NotificationService
};
