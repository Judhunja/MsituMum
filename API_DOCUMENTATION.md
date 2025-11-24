# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register
`POST /auth/register`

**Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "farmer|ngo|donor|government",
  "full_name": "string",
  "organization": "string (optional)",
  "phone": "string (optional)"
}
```

### Login
`POST /auth/login`

**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "role": "string",
    "full_name": "string"
  }
}
```

## Planting Sites

### Get All Sites
`GET /sites`

**Response:**
```json
[
  {
    "id": 1,
    "site_name": "Green Valley",
    "location_name": "Nairobi",
    "latitude": -1.286389,
    "longitude": 36.817223,
    "area_hectares": 50.5,
    "total_plantings": 10
  }
]
```

### Create Site
`POST /sites`

**Body:**
```json
{
  "site_name": "string",
  "location_name": "string",
  "latitude": number,
  "longitude": number,
  "area_hectares": number,
  "soil_type": "string",
  "climate_zone": "string"
}
```

## Planting Records

### Get All Plantings
`GET /planting?site_id=1&species_id=2`

### Create Planting
`POST /planting`

**Body:**
```json
{
  "site_id": 1,
  "species_id": 2,
  "seedlings_planted": 500,
  "planting_date": "2024-01-15",
  "planting_method": "pit planting",
  "pit_size_cm": 30,
  "spacing_meters": 3.0,
  "mulching": true,
  "soil_condition": "loamy",
  "soil_moisture": "moist",
  "soil_ph": 6.5,
  "initial_health": "healthy",
  "photo_url": "string",
  "notes": "string"
}
```

## Monitoring

### Add Monitoring Record
`POST /monitoring`

**Body:**
```json
{
  "planting_id": 1,
  "monitoring_date": "2024-03-15",
  "survival_count": 480,
  "average_height_cm": 45.5,
  "average_canopy_cm": 30.2,
  "health_status": "healthy|pests|drought_stress|disease",
  "mortality_cause": "string",
  "rainfall_mm": 150,
  "maintenance_activities": "weeding, watering",
  "notes": "string"
}
```

## Nurseries

### Get All Nurseries
`GET /nurseries`

### Get Nursery Details
`GET /nurseries/:id`

### Add Inventory
`POST /nurseries/:id/inventory`

**Body:**
```json
{
  "species_id": 1,
  "current_count": 1000,
  "sowing_date": "2024-01-01",
  "germination_rate": 85.5,
  "seedling_stage": "sowing|germination|hardening|ready",
  "expected_ready_date": "2024-06-01",
  "bed_number": "A-01"
}
```

## Analytics

### Get Dashboard Analytics
`GET /analytics/dashboard`

**Response:**
```json
{
  "overall": {
    "total_planted": 1240381,
    "survival_rate": 82.5
  },
  "mortality_causes": [
    {
      "mortality_cause": "drought",
      "count": 45
    }
  ],
  "species_survival": [...],
  "site_performance": [...]
}
```

### Get Survival Rates Over Time
`GET /analytics/survival-rates?period=12&site_id=1`

## Predictions

### Get Predictions for Planting
`GET /predictions/planting/:plantingId`

**Response:**
```json
{
  "survival_probability_1year": 90.5,
  "survival_probability_3year": 85.2,
  "survival_probability_5year": 80.1,
  "biomass_gain_kg": 25000,
  "carbon_sequestration_kg": 12500,
  "drought_risk_score": 0.3,
  "pest_risk_score": 0.2,
  "fire_risk_score": 0.2,
  "confidence_score": 0.85,
  "recommendations": "Increase watering; Implement IPM"
}
```

### Get Prediction Summary
`GET /predictions/summary?site_id=1`

## Biodiversity

### Get Biodiversity Records
`GET /biodiversity/site/:siteId`

### Create Biodiversity Record
`POST /biodiversity`

**Body:**
```json
{
  "site_id": 1,
  "observation_date": "2024-03-15",
  "observation_type": "baseline|follow_up",
  "bird_species_count": 15,
  "pollinator_species_count": 8,
  "plant_species_count": 25,
  "canopy_cover_percent": 45.5,
  "species_richness_index": 0.75,
  "notes": "string"
}
```

## Tree Species

### Get All Species
`GET /species`

### Get Species Details
`GET /species/:id`
