import { auth } from './auth.js';
import { apiCall, formatNumber, formatDate } from './auth.js';

// Check authentication
if (!auth.isAuthenticated()) {
    window.location.href = '/login.html';
}

// Load dashboard data
async function loadDashboard() {
    try {
        // Fetch all data in parallel
        const [plantingData, sitesData, monitoringData] = await Promise.all([
            fetch('/api/planting', {
                headers: { 'Authorization': `Bearer ${auth.getToken()}` }
            }).then(res => res.json()),
            fetch('/api/sites', {
                headers: { 'Authorization': `Bearer ${auth.getToken()}` }
            }).then(res => res.json()),
            fetch('/api/monitoring', {
                headers: { 'Authorization': `Bearer ${auth.getToken()}` }
            }).then(res => res.json())
        ]);

        // Update stats
        document.getElementById('totalPlanted').textContent = plantingData.length;
        document.getElementById('totalSites').textContent = sitesData.length;
        document.getElementById('activeSites').textContent = sitesData.filter(s => s.status === 'active').length;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load dashboard and sites on page load
if (document.getElementById('totalPlanted')) {
    loadDashboard();
}
