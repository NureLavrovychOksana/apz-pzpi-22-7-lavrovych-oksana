const { Op, fn, col, literal, QueryTypes } = require('sequelize');
const sequelize = require('../db');
const Threat = require('../models/threat');
const IoTData = require('../models/iotdata');

// Статистичний аналіз загроз
async function getThreatStatistics(req, res) {
  try {
    const { startDate, endDate } = req.query;

    // Частота загроз
    const frequency = await Threat.findAll({
      attributes: ['threat_type', [fn('COUNT', col('id')), 'frequency']],
      where: {
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: ['threat_type'],
    });

    // Розподіл за рівнем серйозності
    const severityDist = await Threat.findAll({
      attributes: ['severity_level', [fn('COUNT', col('id')), 'count']],
      where: {
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: ['severity_level'],
      order: [['severity_level', 'ASC']],
    });

    // Фізичні параметри
    const [params] = await sequelize.query(
      `
      SELECT
        ROUND(AVG(temperature), 2) AS avg_temp,
        MIN(temperature) AS min_temp,
        MAX(temperature) AS max_temp,
        ROUND(AVG(humidity), 2) AS avg_humidity,
        MIN(humidity) AS min_humidity,
        MAX(humidity) AS max_humidity,
        ROUND(AVG(gas_level), 2) AS avg_gas,
        MIN(gas_level) AS min_gas,
        MAX(gas_level) AS max_gas
      FROM iotdata
      WHERE timestamp BETWEEN :startDate AND :endDate
      `,
      {
        replacements: { startDate, endDate },
        type: QueryTypes.SELECT,
      }
    );

    res.json({
      frequencyByType: frequency,
      severityDistribution: severityDist,
      physicalParams: params,
    });
  } catch (error) {
    console.error('Error in getThreatStatistics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Прогнозування рівня загрози (ковзне середнє)
async function predictThreatLevel(req, res) {
  try {
    const k = parseInt(req.query.k) || 5;

    const [result] = await sequelize.query(
      `
      SELECT ROUND(AVG(severity_level), 2) AS predicted_severity
      FROM (
        SELECT severity_level
        FROM threats
        ORDER BY created_at DESC
        LIMIT :k
      ) AS last_k
      `,
      {
        replacements: { k },
        type: QueryTypes.SELECT,
      }
    );

    res.json({
      predictedSeverity: result?.predicted_severity || 0,
    });
  } catch (error) {
    console.error('Error in predictThreatLevel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getThreatStatistics,
  predictThreatLevel,
};
