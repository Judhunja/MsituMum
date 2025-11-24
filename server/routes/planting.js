const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get all planting records
router.get('/', authenticate, async (req, res) => {
  try {
    const { site_id, species_id } = req.query;
    let query = `
      SELECT p.*, s.site_name, sp.common_name as species_name,
             u.full_name as farmer_name
      FROM planting_records p
      LEFT JOIN planting_sites s ON p.site_id = s.id
      LEFT JOIN tree_species sp ON p.species_id = sp.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (site_id) {
      query += ' AND p.site_id = ?';
      params.push(site_id);
    }
    if (species_id) {
      query += ' AND p.species_id = ?';
      params.push(species_id);
    }

    query += ' ORDER BY p.planting_date DESC';

    const plantings = await db.query(query, params);
    res.json(plantings);
  } catch (error) {
    console.error('Error fetching plantings:', error);
    res.status(500).json({ error: 'Failed to fetch plantings' });
  }
});

// Get single planting record with monitoring data
router.get('/:id', authenticate, async (req, res) => {
  try {
    const planting = await db.get(`
      SELECT p.*, s.site_name, s.latitude, s.longitude,
             sp.common_name as species_name, sp.scientific_name,
             u.full_name as farmer_name, u.phone as farmer_phone
      FROM planting_records p
      LEFT JOIN planting_sites s ON p.site_id = s.id
      LEFT JOIN tree_species sp ON p.species_id = sp.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!planting) {
      return res.status(404).json({ error: 'Planting record not found' });
    }

    // Get monitoring records
    const monitoring = await db.query(`
      SELECT * FROM monitoring_records
      WHERE planting_id = ?
      ORDER BY monitoring_date ASC
    `, [req.params.id]);

    // Calculate survival rate
    const latestMonitoring = monitoring[monitoring.length - 1];
    const survivalRate = latestMonitoring 
      ? (latestMonitoring.survival_count / planting.seedlings_planted * 100).toFixed(1)
      : 100;

    res.json({
      ...planting,
      monitoring,
      current_survival_rate: survivalRate
    });
  } catch (error) {
    console.error('Error fetching planting:', error);
    res.status(500).json({ error: 'Failed to fetch planting record' });
  }
});

// Create new planting record
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      site_id, species_id, seedlings_planted, planting_date,
      planting_method, pit_size_cm, spacing_meters, mulching,
      soil_condition, soil_moisture, soil_ph, initial_health,
      photo_url, gps_accuracy, notes
    } = req.body;

    const result = await db.run(`
      INSERT INTO planting_records (
        site_id, user_id, species_id, seedlings_planted, planting_date,
        planting_method, pit_size_cm, spacing_meters, mulching,
        soil_condition, soil_moisture, soil_ph, initial_health,
        photo_url, gps_accuracy, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      site_id, req.user.id, species_id, seedlings_planted, planting_date,
      planting_method, pit_size_cm, spacing_meters, mulching ? 1 : 0,
      soil_condition, soil_moisture, soil_ph, initial_health,
      photo_url, gps_accuracy, notes
    ]);

    res.status(201).json({
      message: 'Planting record created successfully',
      id: result.id
    });
  } catch (error) {
    console.error('Error creating planting record:', error);
    res.status(500).json({ error: 'Failed to create planting record' });
  }
});

// Update planting record
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      planting_method, pit_size_cm, spacing_meters, mulching,
      soil_condition, soil_moisture, soil_ph, notes
    } = req.body;

    await db.run(`
      UPDATE planting_records 
      SET planting_method = ?, pit_size_cm = ?, spacing_meters = ?, mulching = ?,
          soil_condition = ?, soil_moisture = ?, soil_ph = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `, [
      planting_method, pit_size_cm, spacing_meters, mulching ? 1 : 0,
      soil_condition, soil_moisture, soil_ph, notes,
      req.params.id, req.user.id
    ]);

    res.json({ message: 'Planting record updated successfully' });
  } catch (error) {
    console.error('Error updating planting record:', error);
    res.status(500).json({ error: 'Failed to update planting record' });
  }
});

module.exports = router;
