const express = require('express');
const IoTDataService = require('../services/IoTDataService');
const { body, param, query, validationResult } = require('express-validator');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const IotDataRouter = express.Router();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IoT Data API',
      version: '1.0.0',
      description: 'API for managing IoT data',
    },
    servers: [
      {
        url: 'http://localhost:4000', // API server
      },
    ],
  },
  apis: ['./src/routes/iotDataRouter.js'], // Path to the files where the API routes are defined
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Adding Swagger UI
IotDataRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Create new IoT data
/**
 * @swagger
 * /api/iot-data:
 *   post:
 *     summary: Create new IoT data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               temperature:
 *                 type: number
 *                 format: float
 *               humidity:
 *                 type: number
 *                 format: float
 *               gas_level:
 *                 type: number
 *                 format: float
 *               smoke_detected:
 *                 type: boolean
 *               alert_level:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               location_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: IoT data created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
IotDataRouter.post(
  '/api/iot-data',
  [
    body('temperature').isFloat(),
    body('humidity').isFloat(),
    body('gas_level').isFloat(),
    body('smoke_detected').isBoolean(),
    body('alert_level').isInt({ min: 1, max: 10 }),
    body('location_id').isInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const iotData = await IoTDataService.createIoTData(req.body);
      return res.status(201).json(iotData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get all IoT data
/**
 * @swagger
 * /api/iot-data:
 *   get:
 *     summary: Get all IoT data
 *     responses:
 *       200:
 *         description: List of all IoT data
 *       500:
 *         description: Server error
 */
IotDataRouter.get('/api/iot-data', async (req, res) => {
  try {
    const iotData = await IoTDataService.getAllIoTData();
    return res.status(200).json(iotData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get IoT data by ID
/**
 * @swagger
 * /api/iot-data/{id}:
 *   get:
 *     summary: Get IoT data by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: IoT data ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: IoT data found
 *       404:
 *         description: IoT data not found
 */
IotDataRouter.get('/api/iot-data/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const iotData = await IoTDataService.getIoTDataById(Number(id));
    return res.status(200).json(iotData);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get IoT data by alert level
/**
 * @swagger
 * /api/iot-data/alerts/{alert_level}:
 *   get:
 *     summary: Get IoT data by alert level
 *     parameters:
 *       - in: path
 *         name: alert_level
 *         required: true
 *         description: Alert level
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *     responses:
 *       200:
 *         description: IoT data found
 *       500:
 *         description: Server error
 */
IotDataRouter.get(
  '/api/iot-data/alerts/:alert_level',
  [
    param('alert_level').isInt({ min: 1, max: 10 }),
  ],
  async (req, res) => {
    const { alert_level } = req.params;
    try {
      const iotData = await IoTDataService.getIoTDataByAlertLevel(Number(alert_level));
      return res.status(200).json(iotData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get recent IoT data for monitoring
/**
 * @swagger
 * /api/iot-data/recent:
 *   get:
 *     summary: Get recent IoT data for monitoring
 *     responses:
 *       200:
 *         description: Recent IoT data
 *       500:
 *         description: Server error
 */
IotDataRouter.get('/api/iot-data/recent', async (req, res) => {
  try {
    const iotData = await IoTDataService.getRecentIoTData();
    return res.status(200).json(iotData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware для перевірки ролі адміністратора
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Доступ заборонено' });
  };

/**
 * @swagger
 * /api/admin/iot-data/cleanup:
 *   delete:
 *     summary: Очищення старих IoT-даних
 *     description: Видалення IoT-даних, які більше не використовуються для аналітики.
 *     tags:
 *       - IoT Data
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Дата до якої потрібно видалити дані.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             before_date:
 *               type: string
 *               format: date-time
 *               example: "2023-01-01T00:00:00Z"
 *     responses:
 *       200:
 *         description: Успішно видалено IoT-дані.
 *       400:
 *         description: Необхідно вказати before_date.
 *       403:
 *         description: Доступ заборонено.
 *       500:
 *         description: Внутрішня помилка сервера.
 */
  // Ендпоінт для очищення старих IoT-даних
  IotDataRouter.delete('/api/admin/iot-data/cleanup', isAdmin, async (req, res) => {
    const { before_date } = req.body; // Отримуємо дату з тіла запиту
  
    if (!before_date) {
      return res.status(400).json({ message: 'Необхідно вказати before_date.' });
    }
  
    try {
      const deletedCount = await cleanupOldIoTData(new Date(before_date));
      return res.status(200).json({ message: `Успішно видалено ${deletedCount} записів.` });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });

module.exports = IotDataRouter;
