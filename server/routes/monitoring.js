const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get monitoring records for a planting
router.get('/planting/:plantingId', authenticate, async (req, res) => {
  try {
    const records = await db.query(`
      SELECT m.*, u.full_name as observer_name
      FROM monitoring_records m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.planting_id = ?
      ORDER BY m.monitoring_date ASC
    `, [req.params.plantingId]);

    res.json(records);
  } catch (error) {
    console.error('Error fetching monitoring records:', error);
    res.status(500).json({ error: 'Failed to fetch monitoring records' });
  }
});

// Create monitoring record
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      planting_id, monitoring_date, survival_count,
      average_height_cm, average_canopy_cm, health_status,
      mortality_cause, rainfall_mm, maintenance_activities,
      photo_url, notes
    } = req.body;

    const result = await db.run(`
      INSERT INTO monitoring_records (
        planting_id, user_id, monitoring_date, survival_count,
        average_height_cm, average_canopy_cm, health_status,
        mortality_cause, rainfall_mm, maintenance_activities,
        photo_url, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      planting_id, req.user.id, monitoring_date, survival_count,
      average_height_cm, average_canopy_cm, health_status,
      mortality_cause, rainfall_mm, maintenance_activities,
      photo_url, notes
    ]);

    res.status(201).json({
      message: 'Monitoring record created successfully',
      id: result.id
    });
  } catch (error) {
    console.error('Error creating monitoring record:', error);
    res.status(500).json({ error: 'Failed to create monitoring record' });
  }
});

// Update monitoring record
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      survival_count, average_height_cm, average_canopy_cm,
      health_status, mortality_cause, rainfall_mm,
      maintenance_activities, notes
    } = req.body;

    await db.run(`
      UPDATE monitoring_records 
      SET survival_count = ?, average_height_cm = ?, average_canopy_cm = ?,
          health_status = ?, mortality_cause = ?, rainfall_mm = ?,
          maintenance_activities = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `, [
      survival_count, average_height_cm, average_canopy_cm,
      health_status, mortality_cause, rainfall_mm,
      maintenance_activities, notes,
      req.params.id, req.user.id
    ]);

    res.json({ message: 'Monitoring record updated successfully' });
  } catch (error) {
    console.error('Error updating monitoring record:', error);
    res.status(500).json({ error: 'Failed to update monitoring record' });
  }
});

module.exports = router;
