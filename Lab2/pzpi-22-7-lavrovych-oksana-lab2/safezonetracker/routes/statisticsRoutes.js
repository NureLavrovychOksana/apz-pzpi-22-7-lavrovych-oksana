const express = require('express');
const router = express.Router();
const {
  getThreatStatistics,
  predictThreatLevel,
} = require('../controllers/statisticsController');

// /api/stats?startDate=2025-01-01&endDate=2025-01-31
router.get('/stats', getThreatStatistics);

// /api/predict?k=5
router.get('/predict', predictThreatLevel);

module.exports = router;
