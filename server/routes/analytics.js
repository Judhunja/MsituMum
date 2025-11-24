const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get dashboard analytics
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    // Overall survival rate
    const survivalData = await db.get(`
      SELECT 
        SUM(p.seedlings_planted) as total_planted,
        AVG(
          CASE 
            WHEN m.survival_count IS NOT NULL 
            THEN (m.survival_count * 100.0 / p.seedlings_planted)
            ELSE 100
          END
        ) as avg_survival_rate
      FROM planting_records p
      LEFT JOIN (
        SELECT planting_id, survival_count
        FROM monitoring_records m1
        WHERE monitoring_date = (
          SELECT MAX(monitoring_date)
          FROM monitoring_records m2
          WHERE m2.planting_id = m1.planting_id
        )
      ) m ON p.id = m.planting_id
    `);

    // Top mortality causes
    const mortalityCauses = await db.query(`
      SELECT mortality_cause, COUNT(*) as count
      FROM monitoring_records
      WHERE mortality_cause IS NOT NULL
      GROUP BY mortality_cause
      ORDER BY count DESC
      LIMIT 5
    `);

    // Species survival rates
    const speciesSurvival = await db.query(`
      SELECT 
        sp.common_name,
        sp.id,
        COUNT(DISTINCT p.id) as plantings,
        SUM(p.seedlings_planted) as total_planted,
        AVG(
          CASE 
            WHEN m.survival_count IS NOT NULL 
            THEN (m.survival_count * 100.0 / p.seedlings_planted)
            ELSE 100
          END
        ) as survival_rate
      FROM tree_species sp
      LEFT JOIN planting_records p ON sp.id = p.species_id
      LEFT JOIN (
        SELECT planting_id, survival_count
        FROM monitoring_records m1
        WHERE monitoring_date = (
          SELECT MAX(monitoring_date)
          FROM monitoring_records m2
          WHERE m2.planting_id = m1.planting_id
        )
      ) m ON p.id = m.planting_id
      GROUP BY sp.id
      HAVING plantings > 0
      ORDER BY survival_rate DESC
    `);

    // Site performance
    const sitePerformance = await db.query(`
      SELECT 
        s.id,
        s.site_name,
        SUM(p.seedlings_planted) as total_planted,
        AVG(
          CASE 
            WHEN m.survival_count IS NOT NULL 
            THEN (m.survival_count * 100.0 / p.seedlings_planted)
            ELSE 100
          END
        ) as survival_rate
      FROM planting_sites s
      LEFT JOIN planting_records p ON s.id = p.site_id
      LEFT JOIN (
        SELECT planting_id, survival_count
        FROM monitoring_records m1
        WHERE monitoring_date = (
          SELECT MAX(monitoring_date)
          FROM monitoring_records m2
          WHERE m2.planting_id = m1.planting_id
        )
      ) m ON p.id = m.planting_id
      GROUP BY s.id
      ORDER BY survival_rate DESC
      LIMIT 10
    `);

    res.json({
      overall: {
        total_planted: survivalData.total_planted || 0,
        survival_rate: survivalData.avg_survival_rate || 100
      },
      mortality_causes: mortalityCauses,
      species_survival: speciesSurvival,
      site_performance: sitePerformance
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get survival rates over time
router.get('/survival-rates', authenticate, async (req, res) => {
  try {
    const { site_id, species_id, period = '12' } = req.query;
    
    let query = `
      SELECT 
        DATE(m.monitoring_date) as date,
        AVG(m.survival_count * 100.0 / p.seedlings_planted) as survival_rate,
        COUNT(DISTINCT p.id) as plantings_monitored
      FROM monitoring_records m
      JOIN planting_records p ON m.planting_id = p.id
      WHERE m.monitoring_date >= date('now', '-' || ? || ' months')
    `;
    const params = [period];

    if (site_id) {
      query += ' AND p.site_id = ?';
      params.push(site_id);
    }
    if (species_id) {
      query += ' AND p.species_id = ?';
      params.push(species_id);
    }

    query += ` GROUP BY DATE(m.monitoring_date)
               ORDER BY m.monitoring_date ASC`;

    const data = await db.query(query, params);
    res.json(data);
  } catch (error) {
    console.error('Error fetching survival rates:', error);
    res.status(500).json({ error: 'Failed to fetch survival rates' });
  }
});

// Get farmer/group productivity
router.get('/farmer-productivity', authenticate, async (req, res) => {
  try {
    const productivity = await db.query(`
      SELECT 
        u.id,
        u.full_name,
        u.organization,
        COUNT(DISTINCT p.id) as total_plantings,
        SUM(p.seedlings_planted) as total_seedlings,
        AVG(
          CASE 
            WHEN m.survival_count IS NOT NULL 
            THEN (m.survival_count * 100.0 / p.seedlings_planted)
            ELSE 100
          END
        ) as avg_survival_rate
      FROM users u
      LEFT JOIN planting_records p ON u.id = p.user_id
      LEFT JOIN (
        SELECT planting_id, survival_count
        FROM monitoring_records m1
        WHERE monitoring_date = (
          SELECT MAX(monitoring_date)
          FROM monitoring_records m2
          WHERE m2.planting_id = m1.planting_id
        )
      ) m ON p.id = m.planting_id
      WHERE u.role = 'farmer'
      GROUP BY u.id
      HAVING total_plantings > 0
      ORDER BY total_seedlings DESC
      LIMIT 20
    `);

    res.json(productivity);
  } catch (error) {
    console.error('Error fetching farmer productivity:', error);
    res.status(500).json({ error: 'Failed to fetch farmer productivity' });
  }
});

// Cost per surviving tree
router.get('/cost-per-tree', authenticate, async (req, res) => {
  try {
    const costAnalysis = await db.query(`
      SELECT 
        p.id,
        s.site_name,
        sp.common_name as species,
        p.seedlings_planted,
        COALESCE(m.survival_count, p.seedlings_planted) as surviving_trees,
        SUM(c.amount) as total_cost,
        CASE 
          WHEN COALESCE(m.survival_count, p.seedlings_planted) > 0
          THEN SUM(c.amount) / COALESCE(m.survival_count, p.seedlings_planted)
          ELSE 0
        END as cost_per_surviving_tree
      FROM planting_records p
      LEFT JOIN planting_sites s ON p.site_id = s.id
      LEFT JOIN tree_species sp ON p.species_id = sp.id
      LEFT JOIN cost_tracking c ON p.id = c.planting_id
      LEFT JOIN (
        SELECT planting_id, survival_count
        FROM monitoring_records m1
        WHERE monitoring_date = (
          SELECT MAX(monitoring_date)
          FROM monitoring_records m2
          WHERE m2.planting_id = m1.planting_id
        )
      ) m ON p.id = m.planting_id
      GROUP BY p.id
      HAVING total_cost IS NOT NULL
      ORDER BY cost_per_surviving_tree ASC
    `);

    res.json(costAnalysis);
  } catch (error) {
    console.error('Error fetching cost analysis:', error);
    res.status(500).json({ error: 'Failed to fetch cost analysis' });
  }
});

module.exports = router;
