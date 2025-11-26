import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import { Chart } from 'chart.js/auto';

export default function Dashboard() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [stats, setStats] = useState({
    totalTrees: 0,
    totalSites: 0,
    survivalRate: 0,
    totalCost: 0
  });
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadDashboardData();
    initializeChart();
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email);
      }

      // Dummy data for now
      setStats({
        totalTrees: 12543,
        totalSites: 8,
        survivalRate: 82.5,
        totalCost: 145000
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const initializeChart = () => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Trees Planted',
            data: [850, 920, 1100, 980, 1250, 1380, 1450, 1520, 1680, 1750, 1820, 1950],
            borderColor: '#166534',
            backgroundColor: 'rgba(22, 101, 52, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Survival Rate (%)',
            data: [75, 77, 79, 78, 80, 81, 82, 82, 83, 82, 83, 84],
            borderColor: '#15803d',
            backgroundColor: 'rgba(21, 128, 61, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 13, weight: 'bold' },
              color: '#166534',
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(22, 101, 52, 0.9)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Trees Planted',
              color: '#166534',
              font: { size: 12, weight: 'bold' }
            },
            ticks: {
              color: '#166534'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Survival Rate (%)',
              color: '#15803d',
              font: { size: 12, weight: 'bold' }
            },
            ticks: {
              color: '#15803d',
              callback: function(value) {
                return value + '%';
              }
            },
            grid: {
              drawOnChartArea: false,
            }
          },
          x: {
            title: {
              display: true,
              text: 'Month',
              color: '#374151',
              font: { size: 12, weight: 'bold' }
            },
            ticks: {
              color: '#374151'
            }
          }
        }
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {userName}!</h2>
              <p className="text-gray-600">Here's an overview of your forest restoration activities</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Trees Planted</p>
                  <p className="text-3xl font-bold text-green-800">{stats.totalTrees.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                  <span className="material-symbols-outlined text-4xl text-green-600">park</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Planting Sites</p>
                  <p className="text-3xl font-bold text-green-800">{stats.totalSites}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                  <span className="material-symbols-outlined text-4xl text-green-600">location_on</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Survival Rate</p>
                  <p className="text-3xl font-bold text-green-800">{stats.survivalRate}%</p>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                  <span className="material-symbols-outlined text-4xl text-green-600">eco</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Investment</p>
                  <p className="text-3xl font-bold text-green-800">KSh {stats.totalCost.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                  <span className="material-symbols-outlined text-4xl text-green-600">payments</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Annual Restoration Insights</h3>
            <div style={{ height: '400px', position: 'relative' }}>
              <canvas ref={chartRef}></canvas>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-lg shadow-md hover:shadow-lg transition border border-green-200 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <span className="material-symbols-outlined text-4xl text-green-700">add_circle</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900">Add Nursery</h3>
                  <p className="text-sm text-gray-600">Register a new tree nursery</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-lg shadow-md hover:shadow-lg transition border border-green-200 cursor-pointer" onClick={() => navigate('/nursery')}>
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <span className="material-symbols-outlined text-4xl text-green-700">nature</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900">Manage Nurseries</h3>
                  <p className="text-sm text-gray-600">View all tree nurseries</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-lg shadow-md hover:shadow-lg transition border border-green-200 cursor-pointer" onClick={() => navigate('/prediction')}>
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <span className="material-symbols-outlined text-4xl text-green-700">analytics</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900">View Predictions</h3>
                  <p className="text-sm text-gray-600">Policy impact analysis</p>
                </div>
              </div>
            </div>
          </div>

          {/* M&E Monitoring Section */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Monitoring & Evaluation Indicators</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">
                <span className="material-symbols-outlined">download</span>
                Export Report
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tree Survival Tracking</span>
                  <span className="material-symbols-outlined text-green-600">trending_up</span>
                </div>
                <p className="text-2xl font-bold text-green-800">82.5%</p>
                <p className="text-xs text-gray-600 mt-1">↑ 3.2% from last month</p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '82.5%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Nursery Capacity</span>
                  <span className="material-symbols-outlined text-blue-600">warehouse</span>
                </div>
                <p className="text-2xl font-bold text-blue-800">65%</p>
                <p className="text-xs text-gray-600 mt-1">32,715 / 50,000 seedlings</p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Biodiversity Index</span>
                  <span className="material-symbols-outlined text-purple-600">biodiversity</span>
                </div>
                <p className="text-2xl font-bold text-purple-800">0.78</p>
                <p className="text-xs text-gray-600 mt-1">Shannon Diversity Index</p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Recent Planting Activities</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Species</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trees Planted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Nov 20, 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Karura Forest</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Grevillea robusta</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">450</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Nov 18, 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Mt. Kenya Region</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Prunus africana</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">320</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Nov 15, 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Aberdare Ranges</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Olea africana</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">280</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">Monitoring</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
