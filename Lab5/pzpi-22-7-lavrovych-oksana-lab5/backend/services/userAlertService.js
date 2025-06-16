const UserAlert = require('../models/userAlert');

// Створити сповіщення для користувача
const createUserAlert = async (data) => {
  try {
    const userAlert = await UserAlert.create(data);
    return userAlert;
  } catch (error) {
    throw new Error('Error creating user alert');
  }
};

// Отримати всі сповіщення для користувача за ID
const getUserAlertsByUserId = async (userId) => {
  try {
    const userAlerts = await UserAlert.findAll({
      where: {
        user_id: userId,
      },
    });
    return userAlerts;
  } catch (error) {
    throw new Error('Error retrieving user alerts');
  }
};

// Оновити статус сповіщення для користувача
const updateUserAlertStatus = async (id, notificationSent) => {
  try {
    const userAlert = await UserAlert.findByPk(id);
    if (!userAlert) throw new Error('User alert not found');
    await userAlert.update({ notification_sent: notificationSent });
    return userAlert;
  } catch (error) {
    throw new Error('Error updating user alert status');
  }
};

// Видалити сповіщення для користувача
const deleteUserAlert = async (id) => {
  try {
    const userAlert = await UserAlert.findByPk(id);
    if (!userAlert) throw new Error('User alert not found');
    await userAlert.destroy();
    return { message: 'User alert deleted successfully' };
  } catch (error) {
    throw new Error('Error deleting user alert');
  }
};

module.exports = {
  createUserAlert,
  getUserAlertsByUserId,
  updateUserAlertStatus,
  deleteUserAlert,
};
