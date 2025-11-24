const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get all nurseries
router.get('/', authenticate, async (req, res) => {
  try {
    const nurseries = await db.query(`
      SELECT n.*, u.full_name as owner_name, u.organization,
             COUNT(DISTINCT ni.id) as species_count,
             SUM(ni.current_count) as total_seedlings
      FROM nurseries n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN nursery_inventory ni ON n.id = ni.nursery_id
      GROUP BY n.id
      ORDER BY n.created_at DESC
    `);
    res.json(nurseries);
  } catch (error) {
    console.error('Error fetching nurseries:', error);
    res.status(500).json({ error: 'Failed to fetch nurseries' });
  }
});

// Get single nursery with inventory
router.get('/:id', authenticate, async (req, res) => {
  try {
    const nursery = await db.get(`
      SELECT n.*, u.full_name as owner_name, u.organization, u.phone
      FROM nurseries n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.id = ?
    `, [req.params.id]);

    if (!nursery) {
      return res.status(404).json({ error: 'Nursery not found' });
    }

    // Get inventory
    const inventory = await db.query(`
      SELECT ni.*, sp.common_name, sp.scientific_name, sp.growth_rate
      FROM nursery_inventory ni
      LEFT JOIN tree_species sp ON ni.species_id = sp.id
      WHERE ni.nursery_id = ?
      ORDER BY ni.seedling_stage, ni.species_id
    `, [req.params.id]);

    // Calculate capacity utilization
    const totalSeedlings = inventory.reduce((sum, item) => sum + item.current_count, 0);
    const capacityUtilization = nursery.total_capacity 
      ? (totalSeedlings / nursery.total_capacity * 100).toFixed(1)
      : 0;

    res.json({
      ...nursery,
      inventory,
      total_seedlings: totalSeedlings,
      capacity_utilization: capacityUtilization
    });
  } catch (error) {
    console.error('Error fetching nursery:', error);
    res.status(500).json({ error: 'Failed to fetch nursery' });
  }
});

// Create new nursery
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      nursery_name, location_name, latitude, longitude,
      total_capacity, total_beds, soil_mix_sand_percent,
      soil_mix_loam_percent, soil_mix_compost_percent,
      watering_schedule, manager_name, manager_phone
    } = req.body;

    const result = await db.run(`
      INSERT INTO nurseries (
        user_id, nursery_name, location_name, latitude, longitude,
        total_capacity, total_beds, soil_mix_sand_percent,
        soil_mix_loam_percent, soil_mix_compost_percent,
        watering_schedule, manager_name, manager_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, nursery_name, location_name, latitude, longitude,
      total_capacity, total_beds, soil_mix_sand_percent,
      soil_mix_loam_percent, soil_mix_compost_percent,
      watering_schedule, manager_name, manager_phone
    ]);

    res.status(201).json({
      message: 'Nursery created successfully',
      id: result.id
    });
  } catch (error) {
    console.error('Error creating nursery:', error);
    res.status(500).json({ error: 'Failed to create nursery' });
  }
});

// Update nursery inventory
router.post('/:id/inventory', authenticate, async (req, res) => {
  try {
    const {
      species_id, current_count, sowing_date, germination_rate,
      seedling_stage, expected_ready_date, bed_number,
      disease_notes, pest_notes, photo_url
    } = req.body;

    const result = await db.run(`
      INSERT INTO nursery_inventory (
        nursery_id, species_id, current_count, sowing_date,
        germination_rate, seedling_stage, expected_ready_date,
        bed_number, disease_notes, pest_notes, photo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.params.id, species_id, current_count, sowing_date,
      germination_rate, seedling_stage, expected_ready_date,
      bed_number, disease_notes, pest_notes, photo_url
    ]);

    res.status(201).json({
      message: 'Inventory updated successfully',
      id: result.id
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

// Update inventory item
router.put('/inventory/:id', authenticate, async (req, res) => {
  try {
    const {
      current_count, germination_rate, seedling_stage,
      expected_ready_date, disease_notes, pest_notes
    } = req.body;

    await db.run(`
      UPDATE nursery_inventory 
      SET current_count = ?, germination_rate = ?, seedling_stage = ?,
          expected_ready_date = ?, disease_notes = ?, pest_notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      current_count, germination_rate, seedling_stage,
      expected_ready_date, disease_notes, pest_notes,
      req.params.id
    ]);

    res.json({ message: 'Inventory item updated successfully' });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// Get seedlings ready for transplant (forecast)
router.get('/:id/forecast', authenticate, async (req, res) => {
  try {
    const { months = 3 } = req.query;
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + parseInt(months));

    const forecast = await db.query(`
      SELECT ni.*, sp.common_name, sp.scientific_name
      FROM nursery_inventory ni
      LEFT JOIN tree_species sp ON ni.species_id = sp.id
      WHERE ni.nursery_id = ?
        AND ni.expected_ready_date <= ?
        AND ni.seedling_stage != 'ready'
      ORDER BY ni.expected_ready_date ASC
    `, [req.params.id, futureDate.toISOString().split('T')[0]]);

    res.json(forecast);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

module.exports = router;
