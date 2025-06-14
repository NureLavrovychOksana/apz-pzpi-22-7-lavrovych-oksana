'use strict';

const express = require('express');
const UserRouter = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  registerUser,
  toggleUserStatus,
} = require('../services/userService');

const { authenticateToken, authorize } = require('../middleware/auth');

/*
 * =================================================================
 * ------------------------- PUBLIC ROUTES -------------------------
 *            (Не требуют аутентификации)
 * =================================================================
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input or user already exists
 */
UserRouter.post('/users/register', async (req, res) => {
  try {
    const user = await registerUser(req.body);
    // Не возвращаем хеш пароля
    user.password_hash = undefined;
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login to get a JWT
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Successful login, returns user object and token
 *       400:
 *         description: Invalid login credentials
 */
UserRouter.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);
    res.json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/*
 * =================================================================
 * ----------------------- PROTECTED ROUTES ------------------------
 *            (Требуют валидный JWT-токен)
 * =================================================================
 */

// Все роуты ниже этого будут сначала проверять наличие и валидность JWT токена
UserRouter.use(authenticateToken);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Global Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *       403:
 *         description: Access denied
 */
UserRouter.get('/users', authorize(['Global Admin']), async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID (Global Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 */
UserRouter.get('/users/:id', authorize(['Global Admin']), async (req, res) => {
  try {
    const user = await getUserById(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user data (Global Admin or user themselves)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Access denied
 */
UserRouter.put('/users/:id', async (req, res) => {
  const requestedUserId = Number(req.params.id);
  const loggedInUser = req.user;

  // Разрешаем действие, если пользователь - Global Admin ИЛИ он пытается обновить свой собственный профиль
  if (loggedInUser.role !== 'Global Admin' && loggedInUser.id !== requestedUserId) {
    return res.status(403).json({ error: 'Access denied. You can only update your own profile.' });
  }

  try {
    const user = await updateUser(requestedUserId, req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user (Global Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Access denied
 */
UserRouter.delete('/users/:id', authorize(['Global Admin']), async (req, res) => {
  try {
    await deleteUser(Number(req.params.id));
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/{id}/status:
 *   put:
 *     summary: Toggle user status between active/inactive (Global Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User status changed
 *       403:
 *         description: Access denied
 */
UserRouter.put('/users/:id/status', authorize(['Global Admin']), async (req, res) => {
  try {
    const updatedUser  = await toggleUserStatus(req.params.id);
    res.status(200).json({ message: `User status for ${updatedUser.email} has been changed to ${updatedUser.status}.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = UserRouter;

