const express = require('express');
const AlertsService = require('../services/alertsService');
const { body, param, validationResult } = require('express-validator');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const alertRouter = express.Router();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alert API',
      version: '1.0.0',
      description: 'API for managing alerts',
    },
    servers: [
      {
        url: 'http://localhost:4000', // API server
      },
    ],
  },
  apis: ['./src/routes/alertRouter.js'], // Path to the files where the API routes are defined
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Adding Swagger UI
alertRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Create a new alert
/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: Create a new alert
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alert_type:
 *                 type: string
 *               alert_message:
 *                 type: string
 *               threat_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Alert created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
alertRouter.post(
  '/api/alerts',
  [
    body('alert_type').optional().isString(),
    body('alert_message').isString(),
    body('threat_id').isInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const alert = await AlertsService.createAlert(req.body);
      return res.status(201).json(alert);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get all alerts
/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get all alerts
 *     responses:
 *       200:
 *         description: List of all alerts
 *       500:
 *         description: Server error
 */
alertRouter.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await AlertsService.getAllAlerts();
    return res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alert by ID
/**
 * @swagger
 * /api/alerts/{id}:
 *   get:
 *     summary: Get alert by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Alert ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Alert found
 *       404:
 *         description: Alert not found
 */
alertRouter.get('/api/alerts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const alert = await AlertsService.getAlertById(Number(id));
    return res.status(200).json(alert);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Update alert status
/**
 * @swagger
 * /api/alerts/{id}:
 *   put:
 *     summary: Update alert status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Alert ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - sent
 *                   - delivered
 *                   - read
 *     responses:
 *       200:
 *         description: Alert status updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Alert not found
 */
alertRouter.put(
  '/api/alerts/:id',
  [
    param('id').isInt(),
    body('status').isIn(['sent', 'delivered', 'read']),
  ],
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const updatedAlert = await AlertsService.updateAlertStatus(Number(id), status);
      return res.status(200).json(updatedAlert);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

// Delete alert
/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: Delete an alert
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Alert ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Alert deleted
 *       404:
 *         description: Alert not found
 */
alertRouter.delete('/api/alerts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const message = await AlertsService.deleteAlert(Number(id));
    return res.status(200).json(message);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = alertRouter;
