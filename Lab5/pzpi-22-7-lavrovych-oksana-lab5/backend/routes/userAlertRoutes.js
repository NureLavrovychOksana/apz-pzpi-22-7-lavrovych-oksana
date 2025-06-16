const express = require('express');
const UserAlertService = require('../services/userAlertService');
const { body, param, validationResult } = require('express-validator');

const userAlertRouter = express.Router();

// Створити сповіщення для користувача
userAlertRouter.post(
  '/api/user-alerts',
  [
    body('user_id').isInt(),
    body('alert_id').isInt(),
    body('notification_sent').isBoolean().optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const userAlert = await UserAlertService.createUserAlert(req.body);
      return res.status(201).json(userAlert);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Отримати всі сповіщення користувача за ID
userAlertRouter.get('/api/user-alerts/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const userAlerts = await UserAlertService.getUserAlertsByUserId(Number(user_id));
    return res.status(200).json(userAlerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Оновити статус сповіщення користувача
userAlertRouter.put(
  '/api/user-alerts/:user_alert_id',
  [
    param('user_alert_id').isInt(),
    body('notification_sent').isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { user_alert_id } = req.params;
    try {
      const updatedUserAlert = await UserAlertService.updateUserAlertNotificationStatus(
        Number(user_alert_id),
        req.body
      );
      return res.status(200).json(updatedUserAlert);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

// Видалити сповіщення користувача
userAlertRouter.delete('/api/user-alerts/:user_alert_id', async (req, res) => {
  const { user_alert_id } = req.params;
  try {
    const message = await UserAlertService.deleteUserAlert(Number(user_alert_id));
    return res.status(200).json(message);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = userAlertRouter;
