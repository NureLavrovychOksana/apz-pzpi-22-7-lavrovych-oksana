'use strict';

const express = require('express');
const UserRouter = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  registerUser,
  toggleUserStatus,
  changePassword,
  getSystemStatus,
  createBackup,
  restoreFromBackup,
  getLogicSettings,
  updateLogicSettings,
  getAuditLogs,
  clearAuditLogs
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
    
    // Add validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { user, token } = await loginUser(email, password);
    
    if (!user || !token) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ user, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(400).json({ error: err.message || "Login failed" });
  }
});

/*
 * =================================================================
 * ----------------------- PROTECTED ROUTES ------------------------
 *            (Требуют валидный JWT-токен)
 * =================================================================
 */

UserRouter.use(authenticateToken);
/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "oldPassword123"
 *               newPassword:
 *                 type: string
 *                 example: "newPassword456"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid old password or other error
 *       403:
 *         description: Access denied
 */
UserRouter.put('/users/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // Отримуємо ID з токена

    const result = await changePassword(userId, oldPassword, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
/*
 * =================================================================
 * ---------------------- ADMINISTRATIVE ROUTES --------------------
 *            (Требуют соответствующие права администратора)
 * =================================================================
 */

/**
 * @swagger
 * /admin/system-status:
 *   get:
 *     summary: Get system services status (Infrastructure Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System status information
 *       403:
 *         description: Access denied
 */
UserRouter.get('/admin/system-status', authorize(['Infrastructure Admin', 'Global Admin']), async (req, res) => {
  try {
    const status = await getSystemStatus();
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /admin/backup:
 *   post:
 *     summary: Create system backup (Infrastructure Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup created successfully
 *       403:
 *         description: Access denied
 */
UserRouter.post('/admin/backup', authorize(['Infrastructure Admin', 'Global Admin']), async (req, res) => {
  try {
    const result = await createBackup();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /admin/restore:
 *   post:
 *     summary: Restore system from backup (Infrastructure Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: backup
 *         type: file
 *         description: The backup file to upload
 *     responses:
 *       200:
 *         description: System restored successfully
 *       400:
 *         description: Invalid backup file
 *       403:
 *         description: Access denied
 */
UserRouter.post('/admin/restore', 
  authorize(['Infrastructure Admin', 'Global Admin']),
  upload.single('backup'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No backup file provided' });
      }
      
      const result = await restoreFromBackup(req.file.path);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /admin/logic-settings:
 *   get:
 *     summary: Get business logic settings (Business Logic Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current business logic settings
 *       403:
 *         description: Access denied
 */
UserRouter.get('/admin/logic-settings', authorize(['Business Logic Admin', 'Global Admin']), async (req, res) => {
  try {
    const settings = await getLogicSettings();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /admin/logic-settings:
 *   put:
 *     summary: Update business logic settings (Business Logic Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogicSettings'
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Invalid settings data
 *       403:
 *         description: Access denied
 */
UserRouter.put('/admin/logic-settings', authorize(['Business Logic Admin', 'Global Admin']), async (req, res) => {
  try {
    const result = await updateLogicSettings(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: Get system audit logs (Security Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of audit logs
 *       403:
 *         description: Access denied
 */
UserRouter.get('/admin/audit-logs', authorize(['Security Admin', 'Global Admin']), async (req, res) => {
  try {
    const logs = await getAuditLogs();
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /admin/audit-logs:
 *   delete:
 *     summary: Clear audit logs (Security Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logs cleared successfully
 *       403:
 *         description: Access denied
 */
UserRouter.delete('/admin/audit-logs', authorize(['Security Admin', 'Global Admin']), async (req, res) => {
  try {
    const result = await clearAuditLogs();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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

