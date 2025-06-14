const express = require('express');
const LocationService = require('../services/locationService');
const { body, param, validationResult } = require('express-validator');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const router = express.Router();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Location API',
      version: '1.0.0',
      description: 'API for managing locations',
    },
    servers: [
      {
        url: 'http://localhost:4000', // API server
      },
    ],
  },
  apis: ['./src/routes/locationRouter.js'], // Path to the files where the API routes are defined
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Adding Swagger UI
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Create a new location
/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Create a new location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location_name:
 *                 type: string
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Location created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  '/api/locations',
  [
    body('location_name').isString(),
    body('address').optional().isString(),
    body('description').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const location = await LocationService.createLocation(req.body);
      return res.status(201).json(location);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get all locations
/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Get all locations
 *     responses:
 *       200:
 *         description: List of all locations
 *       500:
 *         description: Server error
 */
router.get('/api/locations', async (req, res) => {
  try {
    const locations = await LocationService.getAllLocations();
    return res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get location by ID
/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: Get location by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Location ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Location found
 *       404:
 *         description: Location not found
 */
router.get('/api/locations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const location = await LocationService.getLocationById(Number(id));
    return res.status(200).json(location);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Update location
/**
 * @swagger
 * /api/locations/{id}:
 *   put:
 *     summary: Update location data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Location ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location_name:
 *                 type: string
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       400:
 *         description: Error updating location
 *       404:
 *         description: Location not found
 */
router.put(
  '/api/locations/:id',
  [
    param('id').isInt(),
    body('location_name').isString(),
    body('address').optional().isString(),
    body('description').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    try {
      const updatedLocation = await LocationService.updateLocation(Number(id), req.body);
      return res.status(200).json(updatedLocation);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

// Delete location
/**
 * @swagger
 * /api/locations/{id}:
 *   delete:
 *     summary: Delete location
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Location ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Location deleted successfully
 *       404:
 *         description: Location not found
 */
router.delete('/api/locations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const message = await LocationService.deleteLocation(Number(id));
    return res.status(200).json(message);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
