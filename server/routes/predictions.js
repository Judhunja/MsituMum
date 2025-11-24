const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Simple prediction model based on historical data
function calculatePredictions(planting, monitoring, site) {
  // Base survival probability from current data
  const currentSurvival = monitoring.length > 0
    ? monitoring[monitoring.length - 1].survival_count / planting.seedlings_planted
    : 1.0;

  // Factors affecting survival
  const factors = {
    soil_quality: planting.soil_ph >= 6 && planting.soil_ph <= 7 ? 1.1 : 0.9,
    mulching: planting.mulching ? 1.15 : 1.0,
    initial_health: planting.initial_health === 'healthy' ? 1.1 : 0.85,
    maintenance: monitoring.some(m => m.maintenance_activities) ? 1.2 : 1.0
  };

  const adjustmentFactor = Object.values(factors).reduce((a, b) => a * b, 1) / 4;

  // Predictions with decay over time
  const survival1Year = Math.min(currentSurvival * adjustmentFactor * 0.95, 1.0);
  const survival3Year = Math.min(survival1Year * 0.85, 1.0);
  const survival5Year = Math.min(survival3Year * 0.80, 1.0);

  // Biomass gain (simplified model)
  const avgBiomassPerTree = 50; // kg per tree after 5 years
  const biomassGain = planting.seedlings_planted * survival5Year * avgBiomassPerTree;

  // Carbon sequestration (simplified: ~50% of biomass)
  const carbonSequestration = biomassGain * 0.5;

  // Risk scores (0-1, higher is worse)
  const droughtRisk = planting.soil_moisture === 'dry' ? 0.7 : 0.3;
  const pestRisk = monitoring.some(m => m.health_status === 'pests') ? 0.6 : 0.2;
  const fireRisk = site.climate_zone === 'dry' ? 0.5 : 0.2;

  // Recommendations
  const recommendations = [];
  if (droughtRisk > 0.5) recommendations.push('Increase watering frequency during dry season');
  if (pestRisk > 0.4) recommendations.push('Implement integrated pest management');
  if (!planting.mulching) recommendations.push('Add mulching to improve moisture retention');
  if (monitoring.length === 0) recommendations.push('Schedule regular monitoring visits');

  return {
    survival_probability_1year: Number((survival1Year * 100).toFixed(1)),
    survival_probability_3year: Number((survival3Year * 100).toFixed(1)),
    survival_probability_5year: Number((survival5Year * 100).toFixed(1)),
    biomass_gain_kg: Number(biomassGain.toFixed(1)),
    carbon_sequestration_kg: Number(carbonSequestration.toFixed(1)),
    drought_risk_score: Number(droughtRisk.toFixed(2)),
    pest_risk_score: Number(pestRisk.toFixed(2)),
    fire_risk_score: Number(fireRisk.toFixed(2)),
    confidence_score: monitoring.length >= 3 ? 0.85 : 0.60,
    influencing_factors: JSON.stringify(factors),
    recommendations: recommendations.join('; ')
  };
}

// Get predictions for a planting
router.get('/planting/:plantingId', authenticate, async (req, res) => {
  try {
    // Check if prediction exists
    let prediction = await db.get(`
      SELECT * FROM ai_predictions
      WHERE planting_id = ?
      ORDER BY prediction_date DESC
      LIMIT 1
    `, [req.params.plantingId]);

    // If no prediction or old (>30 days), generate new one
    if (!prediction || new Date() - new Date(prediction.prediction_date) > 30 * 24 * 60 * 60 * 1000) {
      // Get planting data
      const planting = await db.get(`
        SELECT p.*, s.climate_zone
        FROM planting_records p
        JOIN planting_sites s ON p.site_id = s.id
        WHERE p.id = ?
      `, [req.params.plantingId]);

      if (!planting) {
        return res.status(404).json({ error: 'Planting not found' });
      }

      // Get monitoring records
      const monitoring = await db.query(`
        SELECT * FROM monitoring_records
        WHERE planting_id = ?
        ORDER BY monitoring_date ASC
      `, [req.params.plantingId]);

      // Calculate predictions
      const predictions = calculatePredictions(planting, monitoring, { climate_zone: planting.climate_zone });

      // Save prediction
      const result = await db.run(`
        INSERT INTO ai_predictions (
          planting_id, prediction_date, survival_probability_1year,
          survival_probability_3year, survival_probability_5year,
          biomass_gain_kg, carbon_sequestration_kg,
          drought_risk_score, pest_risk_score, fire_risk_score,
          confidence_score, influencing_factors, recommendations
        ) VALUES (?, date('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        req.params.plantingId,
        predictions.survival_probability_1year,
        predictions.survival_probability_3year,
        predictions.survival_probability_5year,
        predictions.biomass_gain_kg,
        predictions.carbon_sequestration_kg,
        predictions.drought_risk_score,
        predictions.pest_risk_score,
        predictions.fire_risk_score,
        predictions.confidence_score,
        predictions.influencing_factors,
        predictions.recommendations
      ]);

      prediction = { id: result.id, planting_id: req.params.plantingId, ...predictions };
    }

    res.json(prediction);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Get aggregated predictions for all plantings
router.get('/summary', authenticate, async (req, res) => {
  try {
    const { site_id } = req.query;

    let query = `
      SELECT 
        COUNT(*) as total_plantings,
        AVG(survival_probability_1year) as avg_survival_1year,
        AVG(survival_probability_3year) as avg_survival_3year,
        AVG(survival_probability_5year) as avg_survival_5year,
        SUM(biomass_gain_kg) as total_biomass,
        SUM(carbon_sequestration_kg) as total_carbon,
        AVG(drought_risk_score) as avg_drought_risk,
        AVG(pest_risk_score) as avg_pest_risk,
        AVG(confidence_score) as avg_confidence
      FROM ai_predictions ap
      JOIN planting_records p ON ap.planting_id = p.id
      WHERE ap.prediction_date >= date('now', '-60 days')
    `;
    const params = [];

    if (site_id) {
      query += ' AND p.site_id = ?';
      params.push(site_id);
    }

    const summary = await db.get(query, params);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching prediction summary:', error);
    res.status(500).json({ error: 'Failed to fetch prediction summary' });
  }
});

module.exports = router;
