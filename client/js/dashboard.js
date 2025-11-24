// Dashboard functionality
let survivalChart = null;
let speciesChart = null;

async function loadDashboardData() {
  try {
    const data = await apiCall('/analytics/dashboard');
    updateDashboardMetrics(data);
    updateCharts(data);
    updateMortalityBreakdown(data);
    updatePerformanceTable(data);
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showNotification('Failed to load dashboard data', 'error');
  }
}

function updateDashboardMetrics(data) {
  // Overall survival rate
  const survivalRate = data.overall.survival_rate || 0;
  document.getElementById('overall-survival').textContent = formatPercentage(survivalRate);
  document.getElementById('survival-change').textContent = '+2.1%'; // Mock data

  // Total planted
  const totalPlanted = data.overall.total_planted || 0;
  document.getElementById('total-planted').textContent = formatNumber(totalPlanted);
  document.getElementById('planted-change').textContent = '+5.8%'; // Mock data

  // Top mortality cause
  if (data.mortality_causes && data.mortality_causes.length > 0) {
    const topCause = data.mortality_causes[0].mortality_cause || 'Unknown';
    document.getElementById('top-mortality').textContent = 
      topCause.charAt(0).toUpperCase() + topCause.slice(1).replace('_', ' ');
  }
}

function updateCharts(data) {
  // Destroy existing charts
  if (survivalChart) survivalChart.destroy();
  if (speciesChart) speciesChart.destroy();

  // Site-level survival chart (mock time series data)
  const survivalCtx = document.getElementById('survivalChart').getContext('2d');
  survivalChart = new Chart(survivalCtx, {
    type: 'line',
    data: {
      labels: ['1M', '3M', '6M', '9M', '12M'],
      datasets: [{
        label: 'Survival Rate',
        data: [95, 92, 88, 85, data.overall.survival_rate || 82],
        borderColor: '#48bb78',
        backgroundColor: 'rgba(72, 187, 120, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 70,
          max: 100
        }
      }
    }
  });

  // Species survival chart
  const speciesCtx = document.getElementById('speciesChart').getContext('2d');
  const speciesData = data.species_survival || [];
  
  speciesChart = new Chart(speciesCtx, {
    type: 'line',
    data: {
      labels: ['1M', '3M', '6M', '9M', '12M'],
      datasets: speciesData.slice(0, 3).map((species, index) => ({
        label: species.common_name,
        data: generateMockTimeSeriesData(species.survival_rate),
        borderColor: ['#48bb78', '#68d391', '#c0a081'][index],
        tension: 0.4,
        fill: false
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: true,
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 60,
          max: 100
        }
      }
    }
  });

  // Update average
  const avgSurvival = speciesData.reduce((sum, s) => sum + (s.survival_rate || 0), 0) / (speciesData.length || 1);
  document.getElementById('species-avg').textContent = formatPercentage(avgSurvival);
}

function generateMockTimeSeriesData(finalValue) {
  // Generate declining values that end at finalValue
  const variation = 15;
  return [
    Math.min(100, finalValue + variation),
    Math.min(100, finalValue + variation * 0.7),
    Math.min(100, finalValue + variation * 0.4),
    Math.min(100, finalValue + variation * 0.2),
    finalValue
  ];
}

function updateMortalityBreakdown(data) {
  const container = document.getElementById('mortality-list');
  const causes = data.mortality_causes || [];
  
  if (causes.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No mortality data available</p>';
    return;
  }

  const total = causes.reduce((sum, c) => sum + c.count, 0);
  const colors = ['blue-500', 'orange-500', 'purple-500', 'teal-500', 'red-500'];

  container.innerHTML = causes.map((cause, index) => {
    const percentage = (cause.count / total * 100).toFixed(0);
    const label = cause.mortality_cause ? 
      cause.mortality_cause.charAt(0).toUpperCase() + cause.mortality_cause.slice(1).replace('_', ' ') : 
      'Unknown';
    
    return `
      <div class="flex flex-col gap-1">
        <div class="flex justify-between items-center text-sm">
          <p class="text-gray-600">${label}</p>
          <p class="font-medium text-gray-800">${percentage}%</p>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-${colors[index % colors.length]} h-2 rounded-full" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function updatePerformanceTable(data) {
  const tbody = document.getElementById('performance-table');
  const sites = data.site_performance || [];

  if (sites.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No data available</td></tr>';
    return;
  }

  tbody.innerHTML = sites.map(site => {
    const change = (Math.random() * 10 - 2).toFixed(1); // Mock change data
    const changeClass = change >= 0 ? 'text-green-600' : 'text-red-500';
    const changeSign = change >= 0 ? '+' : '';

    return `
      <tr class="bg-white border-b border-gray-200">
        <th class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap" scope="row">${site.site_name}</th>
        <td class="px-6 py-4">${formatNumber(site.total_planted)}</td>
        <td class="px-6 py-4">${formatPercentage(site.survival_rate)}</td>
        <td class="px-6 py-4 ${changeClass}">${changeSign}${change}%</td>
      </tr>
    `;
  }).join('');
}

async function loadSites() {
  try {
    const sites = await apiCall('/sites');
    const select = document.getElementById('filter-site');
    select.innerHTML = '<option value="">Site: All</option>' +
      sites.map(site => `<option value="${site.id}">${site.site_name}</option>`).join('');
  } catch (error) {
    console.error('Error loading sites:', error);
  }
}

function applyFilters() {
  // Reload dashboard with filters
  loadDashboardData();
}

function downloadReport() {
  showNotification('Report download will be implemented', 'info');
}

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  loadSites();
});
