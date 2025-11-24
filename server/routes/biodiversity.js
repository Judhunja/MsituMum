const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get biodiversity records for a site
router.get('/site/:siteId', authenticate, async (req, res) => {
  try {
    const records = await db.query(`
      SELECT b.*, u.full_name as observer_name
      FROM biodiversity_records b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.site_id = ?
      ORDER BY b.observation_date ASC
    `, [req.params.siteId]);

    res.json(records);
  } catch (error) {
    console.error('Error fetching biodiversity records:', error);
    res.status(500).json({ error: 'Failed to fetch biodiversity records' });
  }
});

// Create biodiversity record
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      site_id, observation_date, observation_type,
      bird_species_count, pollinator_species_count, plant_species_count,
      wildlife_sightings, canopy_cover_percent, quadrat_sampling_data,
      species_richness_index, photo_url, notes
    } = req.body;

    const result = await db.run(`
      INSERT INTO biodiversity_records (
        site_id, user_id, observation_date, observation_type,
        bird_species_count, pollinator_species_count, plant_species_count,
        wildlife_sightings, canopy_cover_percent, quadrat_sampling_data,
        species_richness_index, photo_url, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      site_id, req.user.id, observation_date, observation_type,
      bird_species_count, pollinator_species_count, plant_species_count,
      wildlife_sightings, canopy_cover_percent, quadrat_sampling_data,
      species_richness_index, photo_url, notes
    ]);

    res.status(201).json({
      message: 'Biodiversity record created successfully',
      id: result.id
    });
  } catch (error) {
    console.error('Error creating biodiversity record:', error);
    res.status(500).json({ error: 'Failed to create biodiversity record' });
  }
});

// Get biodiversity comparison (before/after)
router.get('/comparison/:siteId', authenticate, async (req, res) => {
  try {
    const baseline = await db.get(`
      SELECT * FROM biodiversity_records
      WHERE site_id = ? AND observation_type = 'baseline'
      ORDER BY observation_date ASC
      LIMIT 1
    `, [req.params.siteId]);

    const latest = await db.get(`
      SELECT * FROM biodiversity_records
      WHERE site_id = ? AND observation_type = 'follow_up'
      ORDER BY observation_date DESC
      LIMIT 1
    `, [req.params.siteId]);

    const improvement = baseline && latest ? {
      bird_species: latest.bird_species_count - baseline.bird_species_count,
      pollinator_species: latest.pollinator_species_count - baseline.pollinator_species_count,
      plant_species: latest.plant_species_count - baseline.plant_species_count,
      canopy_cover: latest.canopy_cover_percent - baseline.canopy_cover_percent,
      richness_index: latest.species_richness_index - baseline.species_richness_index
    } : null;

    res.json({
      baseline,
      latest,
      improvement
    });
  } catch (error) {
    console.error('Error fetching comparison:', error);
    res.status(500).json({ error: 'Failed to fetch comparison' });
  }
});

module.exports = router;
