const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all species
router.get('/', async (req, res) => {
  try {
    const species = await db.query(`
      SELECT * FROM tree_species
      ORDER BY common_name ASC
    `);
    res.json(species);
  } catch (error) {
    console.error('Error fetching species:', error);
    res.status(500).json({ error: 'Failed to fetch species' });
  }
});

// Get single species
router.get('/:id', async (req, res) => {
  try {
    const species = await db.get('SELECT * FROM tree_species WHERE id = ?', [req.params.id]);
    if (!species) {
      return res.status(404).json({ error: 'Species not found' });
    }
    res.json(species);
  } catch (error) {
    console.error('Error fetching species:', error);
    res.status(500).json({ error: 'Failed to fetch species' });
  }
});

module.exports = router;
