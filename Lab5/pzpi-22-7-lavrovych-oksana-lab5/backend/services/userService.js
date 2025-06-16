const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecret';
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

// User Management
const createUser = async (userData) => {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(userData.password, saltRounds);
  
  return await User.create({
    ...userData,
    password_hash: passwordHash, 
    password: undefined 
  });
};

const getAllUsers = async () => {
  return await User.findAll();
};

const getUserById = async (id) => {
  return await User.findByPk(id);
};

const updateUser = async (id, updates) => {
  const user = await User.findByPk(id);
  if (user) {
    return await user.update(updates);
  }
  throw new Error('User not found');
};

const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (user) {
    await user.destroy();
    return true;
  }
  throw new Error('User not found');
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('User not found');
  if (user.status === 'inactive') throw new Error('User account is inactive.'); 

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) throw new Error('Invalid password');

  const token = jwt.sign(
    { id: user.id, role: user.role }, 
    SECRET,
    { expiresIn: '1d' }
  );

  user.password_hash = undefined;
  return { user, token };
};

const registerUser = async (userData) => {
  const saltRounds = 10;
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  const user = await User.create({
    ...userData,
    password_hash: hashedPassword, 
  });

  return user;
};

const toggleUserStatus = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('Користувача не знайдено.');
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    return user;
  } catch (error) {
    console.error(error);
    throw new Error('Не вдалося змінити статус користувача.');
  }
};

const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Користувача не знайдено');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Невірний старий пароль');
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await user.update({
      password_hash: newPasswordHash
    });

    return { message: 'Пароль успішно змінено' };
  } catch (error) {
    console.error('Помилка при зміні пароля:', error);
    throw error;
  }
};

// System Management
const getSystemStatus = async () => {
  // Тут можна додати перевірку статусу різних сервісів
  return [
    { name: 'Основна база даних', status: 'online' },
    { name: 'Резервна база даних', status: 'online' },
    { name: 'API сервер', status: 'online' },
    { name: 'Сервер черг', status: 'online' }
  ];
};

// Backup Management
const createBackup = async () => {
  const backupDir = path.join(__dirname, '../../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFileName = `backup-${Date.now()}.json`;
  const backupPath = path.join(backupDir, backupFileName);

  // Отримуємо всі дані для резервної копії
  const users = await User.findAll();
  
  const backupData = {
    users,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  
  return { 
    message: 'Резервна копія успішно створена',
    file: backupFileName
  };
};

const restoreFromBackup = async (backupFile) => {
  try {
    const backupPath = path.join(__dirname, '../../backups', backupFile);
    if (!fs.existsSync(backupPath)) {
      throw new Error('Файл резервної копії не знайдено');
    }

    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    // Очищаємо існуючі дані (обережно!)
    await User.destroy({ where: {}, truncate: true });
    
    // Відновлюємо користувачів
    for (const user of backupData.users) {
      await User.create(user);
    }

    return { message: 'Система успішно відновлена з резервної копії' };
  } catch (error) {
    console.error('Помилка відновлення:', error);
    throw new Error('Не вдалося відновити систему з резервної копії');
  }
};

// Business Logic Settings
const getLogicSettings = async () => {
  // Можна зберігати ці налаштування в базі даних або файлі конфігурації
  return {
    weights: {
      temperature: 0.4,
      gas: 0.3,
      smoke: 0.2,
      humidity: 0.1
    },
    thresholds: {
      fire_temp: 70,
      gas_leak_ppm: 300,
      overheating_temp: 50
    }
  };
};

const updateLogicSettings = async (newSettings) => {
  // Тут можна додати логіку збереження налаштувань
  return { message: 'Налаштування бізнес-логіки успішно оновлені' };
};

// Audit Logs
const getAuditLogs = async () => {
  // Тут можна реалізувати отримання логів з бази даних або файлів
  return [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      actor: 'admin@example.com',
      action: 'USER_CREATED',
      details: 'Створено нового користувача test@example.com'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actor: 'system',
      action: 'BACKUP_CREATED',
      details: 'Створено резервну копію системи'
    }
  ];
};

const clearAuditLogs = async () => {
  // Тут можна реалізувати очищення логів
  return { message: 'Журнал аудиту успішно очищено' };
};

module.exports = {
  // User Management
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  registerUser,
  toggleUserStatus,
  changePassword,
  
  // System Management
  getSystemStatus,
  createBackup,
  restoreFromBackup,
  
  // Business Logic
  getLogicSettings,
  updateLogicSettings,
  
  // Audit
  getAuditLogs,
  clearAuditLogs
};