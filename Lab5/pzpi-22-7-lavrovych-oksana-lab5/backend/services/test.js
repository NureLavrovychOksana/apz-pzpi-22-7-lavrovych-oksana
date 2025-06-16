const { createUser, getAllUsers, getUserById, updateUser, deleteUser, loginUser, registerUser } = require('./userService');
const User = require('../models/user');

// Тест 1: Отримання всіх користувачів
const testGetAllUsers = async () => {
  try {
    const users = await getAllUsers();
    console.log('All users:', users);
  } catch (error) {
    console.error('Error fetching all users:', error);
  }
};

// Тест 2: Отримання користувача за ID
const testGetUserById = async () => {
  try {
    const user = await getUserById(7); 
    console.log('User found:', user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
  }
};

// Тест 3: Оновлення користувача
const testUpdateUser = async () => {
  try {
    const updates = { name: 'Oscar' };
    const updatedUser = await updateUser(7, updates); 
    console.log('User updated:', updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
  }
};

// Тест 4: Видалення користувача
const testDeleteUser = async () => {
  try {
    const isDeleted = await deleteUser(7); 
    if (isDeleted) {
      console.log('User deleted successfully');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

// Тест 5: Логін користувача
const testLoginUser = async () => {
  try {
    const user = await loginUser('new1267@example.com', 'newpassword123');
    console.log('User logged in:', user);
  } catch (error) {
    console.error('Error logging in:', error);
  }
};

// Тест 6: Реєстрація користувача
const testRegisterUser = async () => {
  try {
    const userData = {
      email: 'new126799@example.com',
      password: 'newpassword123',
      name: 'New',
    };
    const user = await registerUser(userData);
    console.log('User registered:', user);
  } catch (error) {
    console.error('Error registering user:', error);
  }
};


// Виконання тестів
const runTests = async () => {
  await testGetUserById();
  await testUpdateUser();
  await testDeleteUser();
};

// Запуск тестів
runTests();
