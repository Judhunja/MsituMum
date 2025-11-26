import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import Sidebar from '../components/Sidebar';

export default function Biodiversity() {
  const speciesChartRef = useRef(null);
  const speciesChartInstance = useRef(null);
  const diversityChartRef = useRef(null);
  const diversityChartInstance = useRef(null);

  const [biodiversityData, setBiodiversityData] = useState({
    totalSpecies: 45,
    nativeSpecies: 38,
    exoticSpecies: 7,
    endangeredSpecies: 5,
    diversityIndex: 0.78
  });

  const [speciesData, setSpeciesData] = useState([
    { name: 'Grevillea robusta', count: 2450, status: 'Native', health: 85 },
    { name: 'Croton megalocarpus', count: 1890, status: 'Native', health: 88 },
    { name: 'Acacia mearnsii', count: 1650, status: 'Native', health: 82 },
    { name: 'Prunus africana', count: 980, status: 'Endangered', health: 75 },
    { name: 'Melia volkensii', count: 1230, status: 'Native', health: 90 },
    { name: 'Olea africana', count: 890, status: 'Native', health: 87 },
    { name: 'Cordia africana', count: 1120, status: 'Native', health: 86 },
    { name: 'Eucalyptus saligna', count: 1450, status: 'Exotic', health: 91 },
  ]);

  useEffect(() => {
    initializeCharts();
    
    return () => {
      if (speciesChartInstance.current) speciesChartInstance.current.destroy();
      if (diversityChartInstance.current) diversityChartInstance.current.destroy();
    };
  }, []);

  const initializeCharts = () => {
    // Species Distribution Chart
    if (speciesChartRef.current) {
      const ctx1 = speciesChartRef.current.getContext('2d');
      speciesChartInstance.current = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: speciesData.map(s => s.name),
          datasets: [{
            label: 'Tree Count',
            data: speciesData.map(s => s.count),
            backgroundColor: speciesData.map(s => 
              s.status === 'Endangered' ? '#ef4444' : 
              s.status === 'Native' ? '#166534' : '#f59e0b'
            ),
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(22, 101, 52, 0.9)',
              padding: 12,
              cornerRadius: 8
            }
          },
          scales: {
            y: { 
              beginAtZero: true,
              title: { display: true, text: 'Number of Trees' }
            }
          }
        }
      });
    }

    // Biodiversity Index Over Time
    if (diversityChartRef.current) {
      const ctx2 = diversityChartRef.current.getContext('2d');
      diversityChartInstance.current = new Chart(ctx2, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Shannon Diversity Index',
            data: [0.65, 0.68, 0.70, 0.71, 0.73, 0.74, 0.75, 0.76, 0.77, 0.77, 0.78, 0.78],
            borderColor: '#166534',
            backgroundColor: 'rgba(22, 101, 52, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 3,
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: { font: { weight: 'bold' }, color: '#166534' }
            }
          },
          scales: {
            y: { 
              min: 0, 
              max: 1,
              title: { display: true, text: 'Diversity Index (0-1)' }
            }
          }
        }
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Biodiversity Monitoring</h1>
            <p className="text-gray-600">Track species diversity and ecosystem health</p>
          </div>

          {/* Biodiversity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <p className="text-sm font-medium text-gray-600">Total Species</p>
              <p className="text-3xl font-bold text-green-800">{biodiversityData.totalSpecies}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
              <p className="text-sm font-medium text-gray-600">Native Species</p>
              <p className="text-3xl font-bold text-green-800">{biodiversityData.nativeSpecies}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <p className="text-sm font-medium text-gray-600">Exotic Species</p>
              <p className="text-3xl font-bold text-orange-700">{biodiversityData.exoticSpecies}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
              <p className="text-sm font-medium text-gray-600">Endangered</p>
              <p className="text-3xl font-bold text-red-700">{biodiversityData.endangeredSpecies}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <p className="text-sm font-medium text-gray-600">Diversity Index</p>
              <p className="text-3xl font-bold text-blue-700">{biodiversityData.diversityIndex}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Species Distribution</h3>
              <div style={{ height: '350px' }}>
                <canvas ref={speciesChartRef}></canvas>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Biodiversity Index Trend</h3>
              <div style={{ height: '350px' }}>
                <canvas ref={diversityChartRef}></canvas>
              </div>
            </div>
          </div>

          {/* Species Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Species Inventory</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Species Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {speciesData.map((species, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="material-symbols-outlined text-green-600 mr-2">park</span>
                          <span className="text-sm font-medium text-gray-900">{species.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {species.count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          species.status === 'Endangered' ? 'bg-red-100 text-red-700' :
                          species.status === 'Native' ? 'bg-green-100 text-green-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {species.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                species.health >= 85 ? 'bg-green-500' :
                                species.health >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${species.health}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{species.health}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-green-600 hover:text-green-800 font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
