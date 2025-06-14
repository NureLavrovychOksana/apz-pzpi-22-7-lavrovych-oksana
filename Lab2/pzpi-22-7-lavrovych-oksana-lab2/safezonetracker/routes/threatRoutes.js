const express = require('express');
const ThreatService = require('../services/threatService');
const LogicService = require('../services/logicService');
const { body, param, validationResult } = require('express-validator');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const router = express.Router();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Threat API',
      version: '1.0.0',
      description: 'API for managing threats',
    },
    servers: [
      {
        url: 'http://localhost:4000', // API server
      },
    ],
  },
  apis: ['./src/routes/threatRouter.js'], 
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Adding Swagger UI
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Create a new threat
/**
 * @swagger
 * /api/threats:
 *   post:
 *     summary: Create a new threat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               threat_type:
 *                 type: string
 *               severity_level:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *     responses:
 *       201:
 *         description: Threat created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  '/api/threats',
  [
    body('threat_type').isString(),
    body('severity_level').isInt({ min: 1, max: 10 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const threat = await ThreatService.createThreat(req.body);
      return res.status(201).json(threat);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get all threats
/**
 * @swagger
 * /api/threats:
 *   get:
 *     summary: Get all threats
 *     responses:
 *       200:
 *         description: List of all threats
 *       500:
 *         description: Server error
 */
router.get('/api/threats', async (req, res) => {
  try {
    const threats = await ThreatService.getAllThreats();
    return res.status(200).json(threats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get threat by ID
/**
 * @swagger
 * /api/threats/{id}:
 *   get:
 *     summary: Get threat by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Threat ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Threat found
 *       404:
 *         description: Threat not found
 */
router.get('/api/threats/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const threat = await ThreatService.getThreatById(Number(id));
    return res.status(200).json(threat);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Update threat
/**
 * @swagger
 * /api/threats/{id}:
 *   put:
 *     summary: Update threat data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Threat ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               threat_type:
 *                 type: string
 *               severity_level:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *     responses:
 *       200:
 *         description: Threat updated successfully
 *       400:
 *         description: Error updating threat
 *       404:
 *         description: Threat not found
 */
router.put(
  '/api/threats/:id',
  [
    param('id').isInt(),
    body('threat_type').isString(),
    body('severity_level').isInt({ min: 1, max: 10 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    try {
      const updatedThreat = await ThreatService.updateThreat(Number(id), req.body);
      return res.status(200).json(updatedThreat);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

// Delete threat
/**
 * @swagger
 * /api/threats/{id}:
 *   delete:
 *     summary: Delete threat
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Threat ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Threat deleted successfully
 *       404:
 *         description: Threat not found
 */
router.delete('/api/threats/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const message = await ThreatService.deleteThreat(Number(id));
    return res.status(200).json(message);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get current threats
/**
 * @swagger
 * /api/current-threats:
 *   get:
 *     summary: Get current threats that require attention
 *     responses:
 *       200:
 *         description: List of current threats
 *       500:
 *         description: Server error
 */
router.get('/api/current-threats', async (req, res) => {
  try {
    const threats = await ThreatService.getCurrentThreats();
    return res.status(200).json(threats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get threats by location
/**
 * @swagger
 * /api/locations/{id}/threats:
 *   get:
 *     summary: Get threats by location ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Location ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of threats for the location
 *       500:
 *         description: Server error
 */
router.get('/api/locations/:id/threats', async (req, res) => {
  const { id } = req.params;
  try {
    const threats = await ThreatService.getThreatsByLocation(Number(id));
    return res.status(200).json(threats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle incoming IoT data and create threats
/**
 * @swagger
 * /api/iot-data:
 *   post:
 *     summary: Handle IoT data and create threats
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               temperature:
 *                 type: integer
 *               gas_level:
 *                 type: integer
 *               humidity:
 *                 type: integer
 *               smoke_detected:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: IoT data processed successfully
 *       500:
 *         description: Server error
 */
router.post('/api/iot-data', async (req, res) => {
    try {
      await LogicService.handleIoTData(req.body);
      res.status(200).json({ message: 'IoT data processed successfully.' });
    } catch (error) {
      console.error('Error handling IoT data:', error);
      res.status(500).json({ message: 'Error processing IoT data.' });
    }
  });

module.exports = router;
