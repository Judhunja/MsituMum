# MsituMum User Guide

## Quick Start Guide

### 1. Installation

```bash
cd MsituMum
npm install
npm run init-db
```

### 2. Start the Application

Start both frontend and backend:
```bash
npm run dev
```

Or start separately:
```bash
npm run server    # Backend API on port 5000
npm run client    # Frontend on port 3000
```

### 3. Access the Application

- **Web Interface**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api
- **Login Credentials**: 
  - Username: `admin`
  - Password: `admin123`

## User Roles

### Farmer
- **Purpose**: Enter planting data, track tree growth
- **Access**: 
  - Planting forms
  - Monitoring forms
  - Personal dashboard
  - Growth tracking tools

### NGO / Organization
- **Purpose**: Impact reporting, progress verification
- **Access**:
  - All farmer data
  - Aggregated reports
  - Export functionality
  - Performance analytics

### Donor
- **Purpose**: View transparent analytics, verify impact
- **Access**:
  - Read-only dashboards
  - Survival analytics
  - Photo verification
  - Cost-per-tree metrics

### Government
- **Purpose**: Landscape-level restoration insights
- **Access**:
  - Regional analytics
  - Policy simulation tools
  - Comprehensive reports
  - Biodiversity trends

## Core Features

### 1. Tree Survival Rate Tracking

**For Farmers:**
1. Navigate to "Data Entry" → "New Planting"
2. Fill in the planting form:
   - Tree species
   - Number of seedlings
   - GPS location
   - Planting date
   - Soil conditions
   - Upload photos

3. Record monitoring visits:
   - Navigate to "Data Entry" → "Monitoring"
   - Select planting record
   - Enter survival count
   - Measure height and canopy
   - Note health status
   - Upload progress photos

**Dashboard Views:**
- Real-time survival curves
- Mortality cause analysis
- Site-level comparisons
- Species performance

### 2. Nursery Management

**Setup Your Nursery:**
1. Go to "Nurseries" → "Add New Nursery"
2. Enter:
   - Nursery name and location
   - Total capacity
   - Number of beds
   - Soil mix composition
   - Watering schedule

**Manage Inventory:**
1. Select your nursery
2. Click "Add Inventory"
3. Enter for each species:
   - Current seedling count
   - Sowing date
   - Germination rate
   - Seedling stage
   - Expected ready date
   - Bed number

**Features:**
- Capacity tracking
- Species availability
- Readiness forecasts
- Disease/pest alerts

### 3. Biodiversity Monitoring

**Record Baseline:**
1. Navigate to "Biodiversity" → "New Observation"
2. Select observation type: "Baseline"
3. Record:
   - Bird species count
   - Pollinator species
   - Plant diversity
   - Wildlife sightings
   - Canopy cover %

**Follow-up Observations:**
- Use same form with "Follow-up" type
- System automatically calculates improvements
- View before/after comparisons

**Visualizations:**
- Species richness trends
- Ecological recovery heat maps
- Wildlife sighting charts

### 4. AI-Powered Predictions

**Access Predictions:**
1. Go to "Predictions"
2. Select a planting site
3. View:
   - 1, 3, 5-year survival probability
   - Expected biomass gain
   - Carbon sequestration estimates
   - Risk scores (drought, pests, fire)
   - Confidence level

**Policy Simulation:**
1. Adjust policy levers:
   - Subsidy levels
   - Technical support hours
   - Community engagement funding
2. Click "Run Simulation"
3. View impact projections

**AI Recommendations:**
- Watering schedules
- Maintenance activities
- Risk mitigation strategies
- Species selection advice

## Data Entry Workflows

### Complete Planting Workflow

1. **Prepare Site**
   - Create site record (Sites → Add New Site)
   - Enter location, soil type, area

2. **Obtain Seedlings**
   - Check nursery availability
   - Order from "Nurseries" → "Ready" filter

3. **Record Planting**
   - Data Entry → New Planting
   - Fill all required fields
   - Take geotagged photo

4. **Schedule Monitoring**
   - Set reminders for:
     - 1 month
     - 3 months
     - 6 months
     - 12 months

5. **Submit Monitoring**
   - Data Entry → Monitoring
   - Count survivors
   - Measure growth
   - Document issues

6. **View Analytics**
   - Check Dashboard
   - Review survival rate
   - Compare to benchmarks

## Reports and Analytics

### Generate Reports

**Survival Report:**
1. Dashboard → Download Report
2. Select:
   - Date range
   - Sites
   - Species
   - Format (PDF/Excel)

**Nursery Report:**
1. Nursery → Generate Report
2. Includes:
   - Current inventory
   - Germination rates
   - Forecast availability
   - Health issues

**Impact Report:**
1. Predictions → Export
2. Contains:
   - Survival projections
   - Carbon estimates
   - Biodiversity metrics
   - Cost analysis

### Key Metrics

- **Overall Survival Rate**: Average across all plantings
- **Cost per Surviving Tree**: Total costs / survivors
- **Species Performance**: Survival by species
- **Site Rankings**: Top/bottom performing sites
- **Biodiversity Index**: Ecological recovery score

## Best Practices

### Data Quality

✅ **DO:**
- Take clear, geotagged photos
- Record GPS coordinates accurately
- Update monitoring regularly
- Note all maintenance activities
- Document mortality causes

❌ **DON'T:**
- Estimate without measuring
- Skip monitoring periods
- Ignore diseased trees
- Forget to record costs

### Monitoring Schedule

- **Month 1**: Initial survival check
- **Month 3**: Growth measurements begin
- **Month 6**: Major assessment
- **Month 12**: Annual review
- **Ongoing**: After major events (drought, floods, pests)

### Photo Guidelines

- Include reference object for scale
- Capture entire planted area
- Show individual tree health
- Document issues clearly
- Geotagging enabled

## Troubleshooting

### Common Issues

**Can't log in:**
- Check username/password
- Clear browser cache
- Verify account is active

**Data not saving:**
- Check internet connection
- Verify all required fields filled
- Check file size for photos (<5MB)

**Charts not loading:**
- Ensure sufficient data exists
- Select appropriate date range
- Check browser compatibility

**API Errors:**
- Verify server is running
- Check network connection
- Review API documentation

### Getting Help

- **Email**: support@msitumum.org
- **Documentation**: /API_DOCUMENTATION.md
- **Issues**: GitHub repository

## Advanced Features

### Bulk Import

Import existing data:
```bash
POST /api/planting/bulk
```

### API Integration

Connect external tools:
```javascript
const response = await fetch('http://localhost:5000/api/analytics/dashboard', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

### Custom Reports

Use API to build custom analytics:
```javascript
const data = await fetch('/api/analytics/survival-rates?period=24&site_id=3');
```

## Mobile Usage

### Mobile-Friendly Features

- Responsive design
- Touch-friendly buttons
- Camera integration
- GPS auto-capture
- Offline data entry (coming soon)

### Recommended Workflow

1. Use mobile for field data entry
2. Upload photos immediately
3. Review/analyze on desktop
4. Generate reports on desktop

## Data Privacy & Security

- **Authentication**: JWT tokens
- **Role-based access**: User permissions
- **Data encryption**: HTTPS required
- **Backup**: Regular database backups
- **Audit logs**: Track all changes

## FAQ

**Q: How often should I monitor?**
A: Minimum quarterly, monthly recommended for first year.

**Q: Can I edit past records?**
A: Yes, with proper permissions. Changes are logged.

**Q: What photo formats are supported?**
A: JPG, PNG. Max 5MB per photo.

**Q: How is survival rate calculated?**
A: Latest survival count / initial planted × 100

**Q: Can multiple people share a nursery?**
A: Yes, assign multiple users to one nursery.

**Q: How accurate are predictions?**
A: Confidence score shown. Improves with more data.

## Updates and Maintenance

### Database Backup

```bash
cp database/msitumum.db database/backup_$(date +%Y%m%d).db
```

### Software Updates

```bash
git pull origin main
npm install
npm run init-db  # Only if schema changed
```

## Support and Community

- Regular training webinars
- User forums (coming soon)
- Field officer support
- Technical documentation
- Video tutorials (coming soon)
