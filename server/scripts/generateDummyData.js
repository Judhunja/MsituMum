const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../../database/msitumum.db');
const db = new Database(dbPath);

// Kenyan context data
const kenyanRegions = [
    { name: 'Nairobi County', lat: -1.286389, lon: 36.817223 },
    { name: 'Kiambu County', lat: -1.171944, lon: 36.835833 },
    { name: 'Nakuru County', lat: -0.303099, lon: 36.080025 },
    { name: 'Mombasa County', lat: -4.043477, lon: 39.668206 },
    { name: 'Kisumu County', lat: -0.091702, lon: 34.767956 },
    { name: 'Eldoret, Uasin Gishu', lat: 0.514277, lon: 35.269779 },
    { name: 'Nyeri County', lat: -0.420974, lon: 36.947708 },
    { name: 'Machakos County', lat: -1.516790, lon: 37.263660 },
    { name: 'Kakamega County', lat: 0.281370, lon: 34.751800 },
    { name: 'Meru County', lat: 0.046830, lon: 37.648870 }
];

const kenyanTreeSpecies = [
    'Grevillea robusta', 'Croton megalocarpus', 'Acacia mearnsii',
    'Eucalyptus saligna', 'Markhamia lutea', 'Melia volkensii',
    'Senna spectabilis', 'Terminalia brownii', 'Cordia africana',
    'Prunus africana', 'Olea africana', 'Calodendrum capense'
];

const nurseryNames = [
    'Green Valley Tree Nursery', 'Wangari Maathai Memorial Nursery',
    'Karura Forest Seedlings', 'Mount Kenya Nursery Hub',
    'Rift Valley Tree Farm', 'Coastal Green Nursery',
    'Lake Basin Seedling Center', 'Highland Forest Nursery',
    'Savannah Tree Growers', 'Community Forest Nursery'
];

const farmerNames = [
    'John Kamau', 'Mary Wanjiku', 'Peter Otieno', 'Grace Akinyi',
    'Samuel Kipchoge', 'Lucy Nyambura', 'David Mwangi', 'Faith Chemutai',
    'Joseph Omondi', 'Jane Wambui', 'Michael Kibet', 'Catherine Njeri',
    'Daniel Mutua', 'Rebecca Chebet', 'Patrick Korir', 'Agnes Muthoni'
];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

console.log('🌱 Starting to generate Kenyan farmer context dummy data...\n');

// Generate users (farmers)
console.log('Creating farmer users...');
const userIds = [];
const hashedPassword = bcrypt.hashSync('password123', 10);

for (let i = 0; i < 15; i++) {
    const farmerName = farmerNames[i];
    const username = farmerName.toLowerCase().replace(/\s+/g, '_');
    const email = `${username}@msitumum.ke`;
    const phone = `+2547${randomInt(10000000, 99999999)}`;
    
    try {
        // Check if user exists first
        const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
        
        if (existing) {
            userIds.push(existing.id);
            console.log(`  ℹ Using existing user: ${farmerName} (ID: ${existing.id})`);
        } else {
            const result = db.prepare(`
                INSERT INTO users (username, email, password, role, full_name, phone, created_at)
                VALUES (?, ?, ?, 'farmer', ?, ?, datetime('now'))
            `).run(username, email, hashedPassword, farmerName, phone);
            
            userIds.push(result.lastInsertRowid);
            console.log(`  ✓ Created user: ${farmerName} (${email})`);
        }
    } catch (error) {
        console.log(`  ⚠ Error with user ${farmerName}: ${error.message}`);
    }
}

// Generate nurseries
console.log('\nCreating tree nurseries...');
const nurseryIds = [];

for (let i = 0; i < 10; i++) {
    const region = randomElement(kenyanRegions);
    const userId = randomElement(userIds);
    const capacity = randomInt(500, 5000);
    
    // Adjust soil mix based on region (climate-aware)
    let sandPercent, loamPercent, compostPercent;
    if (region.lat > 0) { // Northern Kenya (drier)
        sandPercent = randomInt(15, 25);
        loamPercent = randomInt(35, 45);
        compostPercent = 100 - sandPercent - loamPercent;
    } else { // Southern/Central Kenya
        sandPercent = randomInt(25, 35);
        loamPercent = randomInt(35, 45);
        compostPercent = 100 - sandPercent - loamPercent;
    }
    
    const wateringFreq = region.lat < -3 ? 'twice_daily' : 'once_daily'; // Coastal areas need more water
    
    try {
        const result = db.prepare(`
            INSERT INTO nurseries (
                user_id, nursery_name, location_name, latitude, longitude,
                total_capacity, total_beds, soil_mix_sand_percent, 
                soil_mix_loam_percent, soil_mix_compost_percent,
                watering_schedule, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).run(
            userId,
            nurseryNames[i],
            region.name,
            region.lat + randomFloat(-0.1, 0.1, 4),
            region.lon + randomFloat(-0.1, 0.1, 4),
            capacity,
            randomInt(10, 50),
            sandPercent,
            loamPercent,
            compostPercent,
            wateringFreq
        );
        
        nurseryIds.push(result.lastInsertRowid);
        console.log(`  ✓ Created nursery: ${nurseryNames[i]} in ${region.name}`);
    } catch (error) {
        console.log(`  ⚠ Error creating nursery: ${error.message}`);
    }
}

// Get tree species IDs
const treeSpecies = db.prepare('SELECT id, common_name FROM tree_species').all();
console.log(`\nFound ${treeSpecies.length} tree species in database`);

// Generate nursery inventory
console.log('\nPopulating nursery inventory...');
let inventoryCount = 0;

for (const nurseryId of nurseryIds) {
    const numSpecies = randomInt(3, 8);
    const selectedSpecies = [];
    
    for (let i = 0; i < numSpecies; i++) {
        const species = randomElement(treeSpecies);
        if (selectedSpecies.includes(species.id)) continue;
        
        selectedSpecies.push(species.id);
        
        const quantity = randomInt(50, 800);
        const healthyPercent = randomInt(85, 98);
        
        try {
            db.prepare(`
                INSERT INTO nursery_inventory (
                    nursery_id, species_id, quantity_available,
                    healthy_seedlings_percent, price_per_seedling, last_updated
                ) VALUES (?, ?, ?, ?, ?, datetime('now'))
            `).run(
                nurseryId,
                species.id,
                quantity,
                healthyPercent,
                randomFloat(10, 50),
                randomDate(new Date(2024, 0, 1), new Date()).toISOString()
            );
            
            inventoryCount++;
        } catch (error) {
            console.log(`  ⚠ Error adding inventory: ${error.message}`);
        }
    }
}
console.log(`  ✓ Created ${inventoryCount} inventory records`);

// Generate planting sites
console.log('\nCreating planting sites...');
const siteIds = [];

const siteTypes = ['private_land', 'community_land', 'public_land', 'degraded_forest'];
const siteNames = [
    'Karura Forest Restoration', 'Community Woodlot Project',
    'School Compound Greening', 'Riverbank Stabilization',
    'Degraded Land Recovery', 'Agroforestry Farm Plot',
    'Church Land Afforestation', 'Water Catchment Area',
    'Erosion Control Site', 'Urban Green Space'
];

for (let i = 0; i < 20; i++) {
    const region = randomElement(kenyanRegions);
    const userId = randomElement(userIds);
    const areaHectares = randomFloat(0.5, 20, 2);
    
    try {
        const result = db.prepare(`
            INSERT INTO planting_sites (
                user_id, site_name, location_name, latitude, longitude,
                area_hectares, soil_type, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).run(
            userId,
            i < siteNames.length ? siteNames[i] : `Planting Site ${i + 1}`,
            region.name,
            region.lat + randomFloat(-0.2, 0.2, 4),
            region.lon + randomFloat(-0.2, 0.2, 4),
            areaHectares,
            randomElement(['loamy', 'clay', 'sandy', 'mixed'])
        );
        
        siteIds.push(result.lastInsertRowid);
    } catch (error) {
        console.log(`  ⚠ Error creating site: ${error.message}`);
    }
}
console.log(`  ✓ Created ${siteIds.length} planting sites`);

// Generate planting records
console.log('\nGenerating planting records...');
let plantingCount = 0;

for (const siteId of siteIds) {
    const numPlantings = randomInt(2, 5);
    const userId = randomElement(userIds);
    
    for (let i = 0; i < numPlantings; i++) {
        const species = randomElement(treeSpecies);
        const quantity = randomInt(50, 500);
        const plantingDate = randomDate(new Date(2023, 0, 1), new Date(2024, 10, 1));
        
        // Spacing appropriate for Kenya (typically 2-3m for timber, 4-6m for fruit)
        const spacing = randomFloat(2.5, 5, 1);
        
        try {
            db.prepare(`
                INSERT INTO planting_records (
                    site_id, user_id, species_id, seedlings_planted,
                    planting_date, spacing_meters, planting_method, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `).run(
                siteId,
                userId,
                species.id,
                quantity,
                plantingDate.toISOString().split('T')[0],
                spacing,
                randomElement(['pit_planting', 'direct_seeding', 'transplanting'])
            );
            
            plantingCount++;
        } catch (error) {
            console.log(`  ⚠ Error creating planting record: ${error.message}`);
        }
    }
}
console.log(`  ✓ Created ${plantingCount} planting records`);

// Generate monitoring records
console.log('\nGenerating monitoring records...');
let monitoringCount = 0;

const plantingRecords = db.prepare('SELECT id, user_id, planting_date, seedlings_planted FROM planting_records').all();

for (const planting of plantingRecords) {
    const plantingDate = new Date(planting.planting_date);
    const monthsSincePlanting = Math.floor((new Date() - plantingDate) / (1000 * 60 * 60 * 24 * 30));
    
    if (monthsSincePlanting < 1) continue;
    
    // Create monitoring records at 1, 3, 6, 12 months
    const monitoringIntervals = [1, 3, 6, 12].filter(m => m <= monthsSincePlanting);
    
    let survivingTrees = planting.seedlings_planted;
    
    for (const months of monitoringIntervals) {
        const monitorDate = new Date(plantingDate);
        monitorDate.setMonth(monitorDate.getMonth() + months);
        
        // Realistic survival rates for Kenya (typically 70-95% in first year)
        const survivalRate = months === 1 ? randomInt(90, 98) : 
                            months === 3 ? randomInt(85, 95) :
                            months === 6 ? randomInt(80, 92) :
                            randomInt(75, 90);
        
        survivingTrees = Math.floor(survivingTrees * (survivalRate / 100));
        const avgHeightCm = months === 1 ? randomFloat(30, 60) :
                         months === 3 ? randomFloat(60, 120) :
                         months === 6 ? randomFloat(100, 200) :
                         randomFloat(150, 300);
        
        try {
            db.prepare(`
                INSERT INTO monitoring_records (
                    planting_id, user_id, monitoring_date, survival_count,
                    average_height_cm, health_status, notes, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `).run(
                planting.id,
                planting.user_id,
                monitorDate.toISOString().split('T')[0],
                survivingTrees,
                avgHeightCm,
                randomElement(['healthy', 'pests', 'drought_stress']),
                `${months}-month monitoring completed. Trees showing ${randomElement(['vigorous', 'healthy', 'steady'])} growth.`
            );
            
            monitoringCount++;
        } catch (error) {
            console.log(`  ⚠ Error creating monitoring record: ${error.message}`);
        }
    }
}
console.log(`  ✓ Created ${monitoringCount} monitoring records`);

// Generate biodiversity records
console.log('\nGenerating biodiversity observations...');
let biodiversityCount = 0;

const kenyanWildlife = [
    { species: 'Vervet Monkey', type: 'mammal' },
    { species: 'Silvery-cheeked Hornbill', type: 'bird' },
    { species: 'African Crowned Eagle', type: 'bird' },
    { species: 'Olive Baboon', type: 'mammal' },
    { species: 'Augur Buzzard', type: 'bird' },
    { species: 'Bush Duiker', type: 'mammal' },
    { species: 'African Paradise Flycatcher', type: 'bird' },
    { species: 'Leopard', type: 'mammal' },
    { species: 'Sykes Monkey', type: 'mammal' },
    { species: 'White-browed Coucal', type: 'bird' }
];

for (const siteId of siteIds) {
    const numObservations = randomInt(3, 8);
    
    for (let i = 0; i < numObservations; i++) {
        const wildlife = randomElement(kenyanWildlife);
        const observationDate = randomDate(new Date(2024, 0, 1), new Date());
        
        try {
            db.prepare(`
                INSERT INTO biodiversity_records (
                    site_id, observation_date, species_name, species_type,
                    count, notes, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            `).run(
                siteId,
                observationDate.toISOString().split('T')[0],
                wildlife.species,
                wildlife.type,
                randomInt(1, 5),
                `Observed during site inspection. ${randomElement(['Healthy population', 'Regular visitor', 'Nesting observed', 'Feeding in area'])}.`
            );
            
            biodiversityCount++;
        } catch (error) {
            console.log(`  ⚠ Error creating biodiversity record: ${error.message}`);
        }
    }
}
console.log(`  ✓ Created ${biodiversityCount} biodiversity observations`);

// Generate cost tracking
console.log('\nGenerating cost tracking records...');
let costCount = 0;

const costCategories = ['seedlings', 'labor', 'transport', 'tools', 'watering', 'maintenance'];

for (const siteId of siteIds) {
    const numCosts = randomInt(5, 12);
    
    for (let i = 0; i < numCosts; i++) {
        const category = randomElement(costCategories);
        const amount = category === 'seedlings' ? randomFloat(5000, 50000) :
                      category === 'labor' ? randomFloat(10000, 80000) :
                      category === 'transport' ? randomFloat(3000, 15000) :
                      randomFloat(2000, 20000);
        
        const date = randomDate(new Date(2023, 0, 1), new Date());
        
        try {
            db.prepare(`
                INSERT INTO cost_tracking (
                    planting_id, transaction_date, cost_category, amount,
                    description, created_at
                ) VALUES (?, ?, ?, ?, ?, datetime('now'))
            `).run(
                null, // planting_id can be null for nursery costs
                date.toISOString().split('T')[0],
                category,
                amount,
                `${category.charAt(0).toUpperCase() + category.slice(1)} expenses for site maintenance`
            );
            
            costCount++;
        } catch (error) {
            console.log(`  ⚠ Error creating cost record: ${error.message}`);
        }
    }
}
console.log(`  ✓ Created ${costCount} cost tracking records`);

// Generate AI predictions
console.log('\nGenerating AI survival predictions...');
let predictionCount = 0;

for (const siteId of siteIds) {
    const species = randomElement(treeSpecies);
    const predictionDate = randomDate(new Date(2024, 8, 1), new Date());
    
    // Realistic predictions based on Kenya's climate and conditions
    const predictedSurvival = randomFloat(75, 92, 1);
    const confidence = randomFloat(0.75, 0.95, 2);
    
    const factors = [
        { name: 'rainfall_pattern', value: randomFloat(-0.2, 0.3, 2) },
        { name: 'soil_quality', value: randomFloat(-0.1, 0.25, 2) },
        { name: 'elevation', value: randomFloat(-0.15, 0.2, 2) },
        { name: 'temperature', value: randomFloat(-0.1, 0.15, 2) }
    ];
    
    try {
        db.prepare(`
            INSERT INTO ai_predictions (
                site_id, species_id, prediction_date, predicted_survival_rate,
                confidence_score, model_factors, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `).run(
            siteId,
            species.id,
            predictionDate.toISOString().split('T')[0],
            predictedSurvival,
            confidence,
            JSON.stringify(factors)
        );
        
        predictionCount++;
    } catch (error) {
        console.log(`  ⚠ Error creating prediction: ${error.message}`);
    }
}
console.log(`  ✓ Created ${predictionCount} AI predictions`);

// Summary statistics
console.log('\n📊 Summary of generated data:');
console.log('================================');
console.log(`Users (Farmers): ${userIds.length}`);
console.log(`Nurseries: ${nurseryIds.length}`);
console.log(`Nursery Inventory Items: ${inventoryCount}`);
console.log(`Planting Sites: ${siteIds.length}`);
console.log(`Planting Records: ${plantingCount}`);
console.log(`Monitoring Records: ${monitoringCount}`);
console.log(`Biodiversity Observations: ${biodiversityCount}`);
console.log(`Cost Tracking Records: ${costCount}`);
console.log(`AI Predictions: ${predictionCount}`);
console.log('================================');

// Verify data
const stats = {
    totalTrees: db.prepare('SELECT COALESCE(SUM(seedlings_planted), 0) as total FROM planting_records').get(),
    avgSurvival: db.prepare('SELECT COALESCE(AVG(survival_count), 0) as avg FROM monitoring_records').get(),
    totalCost: db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM cost_tracking').get()
};

console.log('\n🌳 System Statistics:');
console.log(`Total Trees Planted: ${stats.totalTrees.total?.toLocaleString() || 0}`);
console.log(`Average Surviving Trees: ${stats.avgSurvival.avg?.toFixed(0) || 0} per monitoring`);
console.log(`Total Investment: KSh ${stats.totalCost.total?.toLocaleString() || 0}`);

console.log('\n✅ Dummy data generation complete!');
console.log('💡 You can now login with any farmer account:');
console.log('   Username: john_kamau (or any farmer name with underscore)');
console.log('   Password: password123\n');

db.close();
