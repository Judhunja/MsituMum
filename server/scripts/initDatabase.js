const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbDir = path.join(__dirname, '../../database');
const dbPath = path.join(dbDir, 'msitumum.db');

// Create database directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
console.log('Connected to SQLite database');

const schema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('farmer', 'ngo', 'donor', 'government', 'admin')),
  full_name TEXT,
  organization TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Planting sites table
CREATE TABLE IF NOT EXISTS planting_sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  site_name TEXT NOT NULL,
  location_name TEXT,
  latitude REAL,
  longitude REAL,
  area_hectares REAL,
  soil_type TEXT,
  climate_zone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tree species table
CREATE TABLE IF NOT EXISTS tree_species (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  common_name TEXT NOT NULL,
  scientific_name TEXT,
  native BOOLEAN DEFAULT 1,
  growth_rate TEXT,
  mature_height_meters REAL,
  description TEXT
);

-- Planting records table
CREATE TABLE IF NOT EXISTS planting_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  species_id INTEGER NOT NULL,
  seedlings_planted INTEGER NOT NULL,
  planting_date DATE NOT NULL,
  planting_method TEXT,
  pit_size_cm INTEGER,
  spacing_meters REAL,
  mulching BOOLEAN DEFAULT 0,
  soil_condition TEXT,
  soil_moisture TEXT,
  soil_ph REAL,
  initial_health TEXT CHECK(initial_health IN ('healthy', 'stressed')),
  photo_url TEXT,
  gps_accuracy REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES planting_sites(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (species_id) REFERENCES tree_species(id)
);

-- Monitoring records table
CREATE TABLE IF NOT EXISTS monitoring_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  planting_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  monitoring_date DATE NOT NULL,
  survival_count INTEGER NOT NULL,
  average_height_cm REAL,
  average_canopy_cm REAL,
  health_status TEXT CHECK(health_status IN ('healthy', 'pests', 'drought_stress', 'disease')),
  mortality_cause TEXT,
  rainfall_mm REAL,
  maintenance_activities TEXT,
  photo_url TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planting_id) REFERENCES planting_records(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Nurseries table
CREATE TABLE IF NOT EXISTS nurseries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  nursery_name TEXT NOT NULL,
  location_name TEXT,
  latitude REAL,
  longitude REAL,
  total_capacity INTEGER,
  total_beds INTEGER,
  soil_mix_sand_percent INTEGER,
  soil_mix_loam_percent INTEGER,
  soil_mix_compost_percent INTEGER,
  watering_schedule TEXT,
  manager_name TEXT,
  manager_phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Nursery inventory table
CREATE TABLE IF NOT EXISTS nursery_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nursery_id INTEGER NOT NULL,
  species_id INTEGER NOT NULL,
  current_count INTEGER DEFAULT 0,
  sowing_date DATE,
  germination_rate REAL,
  seedling_stage TEXT CHECK(seedling_stage IN ('sowing', 'germination', 'hardening', 'ready')),
  expected_ready_date DATE,
  bed_number TEXT,
  disease_notes TEXT,
  pest_notes TEXT,
  photo_url TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nursery_id) REFERENCES nurseries(id),
  FOREIGN KEY (species_id) REFERENCES tree_species(id)
);

-- Biodiversity records table
CREATE TABLE IF NOT EXISTS biodiversity_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  observation_date DATE NOT NULL,
  observation_type TEXT CHECK(observation_type IN ('baseline', 'follow_up')),
  bird_species_count INTEGER,
  pollinator_species_count INTEGER,
  plant_species_count INTEGER,
  wildlife_sightings TEXT,
  canopy_cover_percent REAL,
  quadrat_sampling_data TEXT,
  species_richness_index REAL,
  photo_url TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES planting_sites(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AI predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  planting_id INTEGER NOT NULL,
  prediction_date DATE NOT NULL,
  survival_probability_1year REAL,
  survival_probability_3year REAL,
  survival_probability_5year REAL,
  biomass_gain_kg REAL,
  carbon_sequestration_kg REAL,
  drought_risk_score REAL,
  pest_risk_score REAL,
  fire_risk_score REAL,
  confidence_score REAL,
  influencing_factors TEXT,
  recommendations TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planting_id) REFERENCES planting_records(id)
);

-- Cost tracking table
CREATE TABLE IF NOT EXISTS cost_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  planting_id INTEGER,
  nursery_id INTEGER,
  cost_category TEXT CHECK(cost_category IN ('seedlings', 'labor', 'transport', 'materials', 'maintenance')),
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'KES',
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planting_id) REFERENCES planting_records(id),
  FOREIGN KEY (nursery_id) REFERENCES nurseries(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_planting_site ON planting_records(site_id);
CREATE INDEX IF NOT EXISTS idx_planting_user ON planting_records(user_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_planting ON monitoring_records(planting_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_date ON monitoring_records(monitoring_date);
CREATE INDEX IF NOT EXISTS idx_nursery_inventory ON nursery_inventory(nursery_id);
CREATE INDEX IF NOT EXISTS idx_biodiversity_site ON biodiversity_records(site_id);
`;

// Insert sample tree species
const insertSpecies = `
INSERT OR IGNORE INTO tree_species (common_name, scientific_name, native, growth_rate, mature_height_meters) VALUES
  ('Acacia', 'Acacia mearnsii', 1, 'fast', 15),
  ('Teak', 'Tectona grandis', 0, 'medium', 30),
  ('Oak', 'Quercus robur', 1, 'slow', 25),
  ('Mahogany', 'Swietenia macrophylla', 0, 'medium', 35),
  ('Eucalyptus', 'Eucalyptus globulus', 0, 'fast', 40),
  ('Cedar', 'Cedrus deodara', 1, 'medium', 50),
  ('Pine', 'Pinus patula', 0, 'fast', 30),
  ('Grevillea', 'Grevillea robusta', 0, 'fast', 20),
  ('Moringa', 'Moringa oleifera', 1, 'fast', 10),
  ('Mango', 'Mangifera indica', 1, 'medium', 15);
`;

// Insert sample admin user (password: admin123)
const insertAdmin = `
INSERT OR IGNORE INTO users (username, email, password, role, full_name) VALUES
  ('admin', 'admin@msitumum.org', '$2a$10$zQK8qVZ5pMxL9D0YxH0qJ.9ZJnVYX8xT5wQ5vK7dN2cGX3qY1mY7e', 'admin', 'System Administrator');
`;

console.log('Creating database schema...');

try {
  db.exec(schema);
  console.log('✓ Database schema created successfully');
  
  db.exec(insertSpecies);
  console.log('✓ Sample tree species inserted');
  
  db.exec(insertAdmin);
  console.log('✓ Admin user created (username: admin, password: admin123)');
  
  db.close();
  console.log('\n✅ Database initialization complete!');
} catch (err) {
  console.error('Error during database initialization:', err);
  db.close();
  process.exit(1);
}
