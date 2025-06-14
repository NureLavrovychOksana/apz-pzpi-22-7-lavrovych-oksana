const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecret';

const createUser  = async (userData) => {
    // Хешування пароля
    const saltRounds = 10; // Кількість раундів для хешування
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

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  registerUser,
  toggleUserStatus,
};
