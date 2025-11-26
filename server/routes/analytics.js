const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// Get dashboard analytics
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    // Get planting records with monitoring data
    const { data: plantingData, error: plantingError } = await supabase
      .from('planting_records')
      .select('*');

    if (plantingError) {
      console.error('Error fetching planting data:', plantingError);
      return res.json({
        overall: { total_planted: 0, survival_rate: 100 },
        mortality_causes: [],
        species_survival: [],
        site_performance: []
      });
    }

    // Get monitoring records
    const { data: monitoringData, error: monitoringError } = await supabase
      .from('monitoring_records')
      .select('*');

    // Get species
    const { data: speciesData, error: speciesError } = await supabase
      .from('tree_species')
      .select('*');

    // Get sites
    const { data: sitesData, error: sitesError } = await supabase
      .from('planting_sites')
      .select('*');

    // Calculate overall metrics
    const totalPlanted = (plantingData || []).reduce((sum, p) => sum + (p.seedlings_planted || 0), 0);
    
    // Calculate survival rate from monitoring data
    let avgSurvivalRate = 100;
    if (monitoringData && monitoringData.length > 0) {
      const survivalRates = monitoringData.map(m => m.survival_count || 0);
      avgSurvivalRate = survivalRates.length > 0 
        ? survivalRates.reduce((sum, rate) => sum + rate, 0) / survivalRates.length 
        : 100;
    }

    // Get mortality causes
    const mortalityCauses = {};
    (monitoringData || []).forEach(m => {
      if (m.mortality_cause) {
        mortalityCauses[m.mortality_cause] = (mortalityCauses[m.mortality_cause] || 0) + 1;
      }
    });

    const mortalityCausesArray = Object.entries(mortalityCauses)
      .map(([cause, count]) => ({ mortality_cause: cause, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate species survival (simple aggregation)
    const speciesSurvival = (speciesData || []).map(sp => ({
      common_name: sp.common_name,
      id: sp.id,
      plantings: (plantingData || []).filter(p => p.species_id === sp.id).length,
      total_planted: (plantingData || [])
        .filter(p => p.species_id === sp.id)
        .reduce((sum, p) => sum + (p.seedlings_planted || 0), 0),
      survival_rate: 85 + Math.random() * 10 // Mock data for now
    })).filter(sp => sp.plantings > 0);

    // Calculate site performance
    const sitePerformance = (sitesData || []).map(site => ({
      id: site.id,
      site_name: site.site_name,
      total_planted: (plantingData || [])
        .filter(p => p.site_id === site.id)
        .reduce((sum, p) => sum + (p.seedlings_planted || 0), 0),
      survival_rate: 80 + Math.random() * 15 // Mock data for now
    })).filter(site => site.total_planted > 0)
      .sort((a, b) => b.survival_rate - a.survival_rate)
      .slice(0, 10);

    res.json({
      overall: {
        total_planted: totalPlanted,
        survival_rate: avgSurvivalRate
      },
      mortality_causes: mortalityCausesArray,
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
