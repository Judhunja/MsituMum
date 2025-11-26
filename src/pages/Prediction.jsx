import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Chart } from 'chart.js/auto';

export default function Prediction() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [params, setParams] = useState({
    initialTrees: 5000,
    survivalRate: 75,
    annualPlanting: 1000,
    yearsToProject: 10
  });

  const handleChange = (e) => {
    setParams({
      ...params,
      [e.target.name]: parseFloat(e.target.value)
    });
  };

  const runSimulation = () => {
    const years = [];
    const trees = [];
    
    let currentTrees = params.initialTrees;
    
    for (let i = 0; i <= params.yearsToProject; i++) {
      years.push(`Year ${i}`);
      trees.push(Math.round(currentTrees));
      
      // Apply survival rate and add new plantings
      currentTrees = (currentTrees * (params.survivalRate / 100)) + params.annualPlanting;
    }

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'Projected Tree Population',
          data: trees,
          borderColor: '#166534',
          backgroundColor: 'rgba(22, 101, 52, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Trees'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Time Period'
            }
          }
        }
      }
    });
  };

  // Cleanup chart on component unmount
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Policy Impact Simulation</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold mb-6">Simulation Parameters</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Trees: {params.initialTrees.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    name="initialTrees"
                    min="1000"
                    max="10000"
                    step="100"
                    value={params.initialTrees}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Survival Rate: {params.survivalRate}%
                  </label>
                  <input
                    type="range"
                    name="survivalRate"
                    min="50"
                    max="95"
                    step="5"
                    value={params.survivalRate}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Planting: {params.annualPlanting.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    name="annualPlanting"
                    min="500"
                    max="5000"
                    step="100"
                    value={params.annualPlanting}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years to Project: {params.yearsToProject}
                  </label>
                  <input
                    type="range"
                    name="yearsToProject"
                    min="5"
                    max="20"
                    step="1"
                    value={params.yearsToProject}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={runSimulation}
                  className="w-full py-3 px-4 bg-green-800 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Run Simulation
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold mb-4">Projection Results</h2>
              <div className="h-96">
                <canvas ref={chartRef}></canvas>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
