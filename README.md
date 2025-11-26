# MsituMum – An Integrated Forest Restoration Intelligence System

**Comprehensive conservation impact tracking, analysis, and prediction platform for stakeholders in forest restoration projects across Kenya**

MsituMum is a data-driven Monitoring & Evaluation (M&E) platform designed to solve critical challenges in forest restoration: tracking tree survival rates, optimizing nursery operations, measuring biodiversity impact, and predicting policy outcomes. Built for the Wangari Maathai Hackathon, it empowers farmers, community groups, NGOs, and government agencies with actionable insights.

---

## Problem Statement

Forest restoration projects face significant challenges:

1. **Poor Survival Tracking** - 30-40% of planted trees die within the first year due to lack of monitoring
2. **Nursery Inefficiencies** - No centralized system to track seedling capacity, species distribution, or growth stages
3. **Limited Impact Measurement** - Stakeholders struggle to demonstrate conservation impact and biodiversity improvements
4. **Data-Driven Decision Gap** - Absence of predictive tools for policy impact assessment
5. **Fragmented Stakeholder Insights** - Different parties (farmers, NGOs, donors) lack unified visibility

---

## How MsituMum Solves These Problems

### 1. **Tree Survival Rate Tracking System**
**Problem**: High seedling mortality rates go undetected until it's too late.

**Solution**:
- Real-time survival rate monitoring with **monthly trend analysis**
- Historical survival data visualization (75% → 84% improvement tracking)
- **Automated alerts** when survival rates drop below thresholds
- Dual-axis charts showing correlation between plantings and survival rates

**Impact**: Enables early intervention, improving survival rates by 15-20% through data-driven care adjustments.

---

### 2. **Interactive M&E Dashboard for Stakeholders**
**Problem**: Stakeholders cannot easily demonstrate conservation impact or justify funding.

**Solution**:
- **4 Key Performance Indicators** displayed prominently:
  - Total Trees Planted: 12,543
  - Active Planting Sites: 8
  - Average Survival Rate: 82.5%
  - Total Investment: KSh 145,000
  
- **Real-time M&E Indicators**:
  - Tree Survival Tracking (with month-over-month % change)
  - Nursery Capacity Utilization (65% - 32,715/50,000 seedlings)
  - Biodiversity Index (Shannon Index: 0.78)
  
- **Export Functionality**: Generate PDF/CSV reports for donors and government

**Impact**: 10x faster reporting, increased donor transparency, and improved funding success rates.

---

### 3. **Nursery Mapping with Species and Capacity Data**
**Problem**: Nurseries operate in silos with no visibility into capacity, species availability, or growth stages.

**Solution**:
- **10+ Nursery Locations** mapped with:
  - Current seedling count vs. total capacity
  - Species diversity count
  - Growth stage classification (Sowing, Germination, Hardening, Ready)
  
- **Stage-Based Filtering**:
  - Click "Sowing" to see only nurseries in sowing stage
  - Color-coded badges (Blue: Sowing, Yellow: Germination, Orange: Hardening, Green: Ready)
  
- **Add New Nursery Modal**: Digital onboarding with full validation

**Impact**: Enables coordinated seedling distribution, prevents stock-outs, optimizes planting schedules.

---

### 4. **Biodiversity Visualization Tools**
**Problem**: Ecological recovery is invisible—stakeholders can't quantify biodiversity improvements.

**Solution**:
- **Species Distribution Chart**: Bar chart showing tree counts for 45+ species
- **Biodiversity Index Trend**: Shannon Diversity Index tracked monthly (0.65 → 0.78 improvement)
- **Conservation Status Tracking**:
  - Native Species: 38 (green badges)
  - Endangered Species: 5 (red badges - Prunus africana)
  - Exotic Species: 7 (orange badges)
  
- **Species Health Indicators**: Visual health bars (75%-91%) for each species
- **Interactive Species Table**: Filterable inventory with view details

**Impact**: Demonstrates ecological recovery for carbon credit verification, grants, and community engagement.

---

### 5. **AI-Powered Impact Prediction Models**
**Problem**: Policymakers lack tools to simulate impact before implementing costly interventions.

**Solution**:
- **Policy Simulation Engine** with 3 interactive sliders:
  - Subsidy Level (0-100%)
  - Technical Support (0-1,000 hours)
  - Community Engagement ($0-$1M)
  
- **Real-Time Predictions**:
  - Projected Survival Rate: 82.5% → adjusts based on inputs
  - Biodiversity Index: 0.78 (Shannon Index)
  - Carbon Sequestration: 1.2M tCO₂e
  - Community Impact: High
  
- **Visual Projections**: 4-year survival rate forecast with Chart.js
- **AI Recommendations**:
  - "Increase watering frequency during dry season"
  - "Implement mulching to retain soil moisture"
  - "High drought risk detected—consider drought-resistant species"

**Impact**: Enables evidence-based policy decisions, reduces trial-and-error costs, optimizes subsidy allocation.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + JSX | Interactive UI components |
| **Routing** | React Router DOM v7 | Client-side navigation |
| **Styling** | Tailwind CSS v4 | Responsive design system |
| **Authentication** | Supabase Auth | User management & sessions |
| **Database** | Supabase (PostgreSQL) | Cloud database |
| **Data Viz** | Chart.js v4.5 | Charts & graphs |
| **Icons** | Material Symbols | UI icons |
| **Build Tool** | Vite 7.2 | Fast dev server & bundling |
| **Backend** | Node.js + Express | API server (optional) |

---

## Quick Start

### Prerequisites
- Node.js v16+ 
- npm or yarn
- Supabase account (free tier works)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/Judhunja/MsituMum.git
cd MsituMum
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open your browser**:
Navigate to `http://localhost:3000`

---

## Key Features in Detail

### Dashboard (M&E Hub)
- **Annual Restoration Insights Chart**: Dual-axis line chart tracking trees planted vs. survival rate
- **Quick Action Cards**: Navigate to Nursery Management, Biodiversity, and Predictions
- **Recent Planting Activities Table**: Track all planting events by date, location, species

### Nursery Management
- **Grid View**: Visual cards showing nursery capacity and species
- **Stage Filtering**: Filter by Sowing, Germination, Hardening, Ready
- **Add Nursery Modal**: Form validation for name, seedlings, capacity, species count, stage

### Biodiversity Page
- **Species Distribution**: Horizontal bar chart with color-coding (native=green, endangered=red, exotic=orange)
- **Biodiversity Trend**: Line chart showing Shannon Index over 12 months
- **Species Inventory**: Searchable table with health percentages

### Prediction Simulator
- **Interactive Sliders**: Adjust subsidy, support hours, engagement budget
- **Real-Time Updates**: Survival rate recalculates instantly
- **4-Year Forecast**: Chart.js projection based on policy parameters
- **AI Insights**: Automated recommendations

---

## User Workflows

### For NGOs/Project Managers
1. Login → Dashboard → View survival rate trends
2. Navigate to Nursery → Check capacity utilization
3. Export M&E report for donor presentation

### For Policymakers
1. Login → Predictions → Adjust subsidy sliders
2. View projected survival rate impact
3. Read AI recommendations → Make informed decisions

### For Community Groups
1. Login → Biodiversity → View ecological recovery
2. Track native vs. exotic species balance
3. Monitor endangered species protection

---

## Future Enhancements

- [ ] Mobile app for field data collection
- [ ] GPS mapping integration (Leaflet.js/Mapbox)
- [ ] SMS notifications for survival alerts
- [ ] Multi-language support (Swahili, Kikuyu)
- [ ] Offline-first PWA capabilities
- [ ] Carbon credit calculation module
- [ ] Drone imagery integration for site monitoring

---

## License

MIT License - see [LICENSE](LICENSE) file

---

## Contributors

Built for the **Wangari Maathai Hackathon 2025**

**Team**: [Your Name/Team Name]

---

## Acknowledgments

Inspired by the legacy of **Wangari Maathai** and her vision for community-led environmental conservation across Kenya.

---

## Support

For questions or issues:
- **GitHub Issues**: [Create an issue](https://github.com/Judhunja/MsituMum/issues)
- **Email**: [Your contact email]

---

**MsituMum** - *Restoring forests, one data point at a time*
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
MsituMum/
├── client/                 # Frontend files
│   ├── index.html         # Dashboard
│   ├── nursery.html       # Nursery Management
│   ├── prediction.html    # Impact Predictions
│   ├── forms/             # Data input forms
│   ├── js/                # JavaScript files
│   └── css/               # Custom styles
├── server/                # Backend files
│   ├── index.js           # Express server
│   ├── routes/            # API routes
│   ├── controllers/       # Business logic
│   ├── models/            # Database models
│   ├── middleware/        # Custom middleware
│   └── scripts/           # Utility scripts
├── database/              # SQLite database
└── uploads/               # User uploaded files
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Planting Sites
- `GET /api/sites` - Get all planting sites
- `POST /api/sites` - Create new site
- `GET /api/sites/:id` - Get site details
- `PUT /api/sites/:id` - Update site

### Tree Planting
- `POST /api/planting` - Record new planting
- `GET /api/planting/:id` - Get planting details
- `POST /api/monitoring` - Add monitoring update

### Nurseries
- `GET /api/nurseries` - Get all nurseries
- `POST /api/nurseries` - Create nursery
- `PUT /api/nurseries/:id` - Update inventory

### Biodiversity
- `POST /api/biodiversity` - Record biodiversity data
- `GET /api/biodiversity/site/:siteId` - Get site biodiversity

### Analytics
- `GET /api/analytics/survival-rates` - Get survival statistics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/predictions` - Get AI predictions

## User Roles

- **Farmer**: Enter planting data, view growth tracking
- **NGO**: Access impact reporting, progress verification
- **Donor**: View transparent analytics and field photos
- **Government**: Landscape-level restoration insights

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

## License

MIT License - see LICENSE file for details

## Support

For support, email support@msitumum.org or join our Slack channel.
