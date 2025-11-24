const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get all planting sites
router.get('/', authenticate, async (req, res) => {
  try {
    const sites = await db.query(`
      SELECT s.*, u.full_name as owner_name, u.organization,
             COUNT(DISTINCT p.id) as total_plantings
      FROM planting_sites s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN planting_records p ON s.id = p.site_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    res.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// Get single site
router.get('/:id', authenticate, async (req, res) => {
  try {
    const site = await db.get(`
      SELECT s.*, u.full_name as owner_name, u.organization, u.phone
      FROM planting_sites s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    res.json(site);
  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({ error: 'Failed to fetch site' });
  }
});

// Create new site
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      site_name, location_name, latitude, longitude,
      area_hectares, soil_type, climate_zone
    } = req.body;

    const result = await db.run(`
      INSERT INTO planting_sites 
      (user_id, site_name, location_name, latitude, longitude, area_hectares, soil_type, climate_zone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, site_name, location_name, latitude, longitude, area_hectares, soil_type, climate_zone]);

    res.status(201).json({
      message: 'Site created successfully',
      id: result.id
    });
  } catch (error) {
    console.error('Error creating site:', error);
    res.status(500).json({ error: 'Failed to create site' });
  }
});

// Update site
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      site_name, location_name, latitude, longitude,
      area_hectares, soil_type, climate_zone
    } = req.body;

    await db.run(`
      UPDATE planting_sites 
      SET site_name = ?, location_name = ?, latitude = ?, longitude = ?,
          area_hectares = ?, soil_type = ?, climate_zone = ?
      WHERE id = ? AND user_id = ?
    `, [site_name, location_name, latitude, longitude, area_hectares, 
        soil_type, climate_zone, req.params.id, req.user.id]);

    res.json({ message: 'Site updated successfully' });
  } catch (error) {
    console.error('Error updating site:', error);
    res.status(500).json({ error: 'Failed to update site' });
  }
});

// Delete site
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await db.run('DELETE FROM planting_sites WHERE id = ? AND user_id = ?', 
      [req.params.id, req.user.id]);
    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Error deleting site:', error);
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

module.exports = router;
