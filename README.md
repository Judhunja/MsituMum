# MsituMum – Forest Restoration Intelligence System

An end-to-end forest restoration intelligence platform designed for farmers, community groups, NGOs, and restoration partners.

## Features

- **Tree Survival Rate Tracking** - Monitor seedling survival with detailed metrics
- **Interactive M&E Dashboards** - Real-time monitoring and evaluation
- **Nursery Mapping** - Track capacity, species, and readiness
- **Biodiversity Visualization** - Before/after ecological recovery insights
- **AI-Powered Predictions** - Survival probability and impact forecasting
- **Multi-stakeholder Views** - Customized dashboards for farmers, NGOs, donors, government

## Tech Stack

- **Frontend**: HTML, Tailwind CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Charts**: Chart.js
- **Maps**: Leaflet.js

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MsituMum
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
npm run init-db
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
