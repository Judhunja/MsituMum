import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

export default function Nursery() {
  const [allNurseries, setAllNurseries] = useState([]);
  const [filteredNurseries, setFilteredNurseries] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    nursery_name: '',
    total_seedlings: '',
    total_capacity: '',
    species_count: '',
    stage: 'sowing'
  });

  useEffect(() => {
    loadNurseries();
  }, []);

  useEffect(() => {
    filterNurseries();
  }, [activeFilter, allNurseries]);

  const loadNurseries = () => {
    // Dummy nursery data with stages
    const dummyNurseries = [
      { id: 1, nursery_name: 'Wangari Maathai Memorial Nursery', total_seedlings: 5000, total_capacity: 10000, species_count: 8, stage: 'ready' },
      { id: 2, nursery_name: 'Green Valley Tree Nursery', total_seedlings: 3200, total_capacity: 5000, species_count: 6, stage: 'sowing' },
      { id: 3, nursery_name: 'Karura Forest Seedlings', total_seedlings: 4500, total_capacity: 8000, species_count: 10, stage: 'germination' },
      { id: 4, nursery_name: 'Mount Kenya Nursery Hub', total_seedlings: 2800, total_capacity: 6000, species_count: 5, stage: 'hardening' },
      { id: 5, nursery_name: 'Rift Valley Tree Farm', total_seedlings: 6200, total_capacity: 12000, species_count: 12, stage: 'ready' },
      { id: 6, nursery_name: 'Coastal Green Nursery', total_seedlings: 1500, total_capacity: 4000, species_count: 4, stage: 'germination' },
      { id: 7, nursery_name: 'Lake Basin Seedling Center', total_seedlings: 3800, total_capacity: 7000, species_count: 7, stage: 'sowing' },
      { id: 8, nursery_name: 'Highland Forest Nursery', total_seedlings: 4100, total_capacity: 9000, species_count: 9, stage: 'hardening' },
      { id: 9, nursery_name: 'Savannah Tree Growers', total_seedlings: 2200, total_capacity: 5500, species_count: 5, stage: 'ready' },
      { id: 10, nursery_name: 'Community Forest Nursery', total_seedlings: 1800, total_capacity: 4500, species_count: 6, stage: 'sowing' },
    ];
    setAllNurseries(dummyNurseries);
    setFilteredNurseries(dummyNurseries);
  };

  const filterNurseries = () => {
    if (activeFilter === 'all') {
      setFilteredNurseries(allNurseries);
    } else {
      setFilteredNurseries(allNurseries.filter(n => n.stage === activeFilter));
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      sowing: 'bg-blue-100 text-blue-700',
      germination: 'bg-yellow-100 text-yellow-700',
      hardening: 'bg-orange-100 text-orange-700',
      ready: 'bg-green-100 text-green-700'
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
  };

  const getStageLabel = (stage) => {
    const labels = {
      sowing: 'Sowing',
      germination: 'Germination',
      hardening: 'Hardening',
      ready: 'Ready'
    };
    return labels[stage] || stage;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNursery = (e) => {
    e.preventDefault();
    const newNursery = {
      id: allNurseries.length + 1,
      nursery_name: formData.nursery_name,
      total_seedlings: parseInt(formData.total_seedlings),
      total_capacity: parseInt(formData.total_capacity),
      species_count: parseInt(formData.species_count),
      stage: formData.stage
    };
    
    setAllNurseries(prev => [...prev, newNursery]);
    setShowAddModal(false);
    setFormData({
      nursery_name: '',
      total_seedlings: '',
      total_capacity: '',
      species_count: '',
      stage: 'sowing'
    });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Nursery Management</h1>
            <p className="text-gray-600">Visualize and manage your nursery beds and seedlings.</p>
          </div>
          <button 
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
            onClick={() => setShowAddModal(true)}
          >
            <span className="material-symbols-outlined">add</span>
            <span>Add New Nursery</span>
          </button>
        </header>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex gap-2">
              <button className="p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                <span className="material-symbols-outlined">search</span>
              </button>
              <button className="p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>
            <button className="flex items-center gap-2 bg-primary text-gray-900 px-4 py-2 rounded-lg hover:opacity-90">
              <span className="material-symbols-outlined">description</span>
              <span className="text-sm font-bold">Generate Report</span>
            </button>
          </div>

          <div className="flex gap-3 p-4 border-b overflow-x-auto">
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'all' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-green-100'}`}
              onClick={() => setActiveFilter('all')}
            >
              All Beds
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'sowing' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-green-100'}`}
              onClick={() => setActiveFilter('sowing')}
            >
              Sowing
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'germination' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-green-100'}`}
              onClick={() => setActiveFilter('germination')}
            >
              Germination
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'hardening' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-green-100'}`}
              onClick={() => setActiveFilter('hardening')}
            >
              Hardening
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'ready' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-green-100'}`}
              onClick={() => setActiveFilter('ready')}
            >
              Ready for Transplant
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {filteredNurseries.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                {activeFilter === 'all' 
                  ? 'No nurseries found. Add your first nursery!' 
                  : `No nurseries in ${getStageLabel(activeFilter)} stage.`}
              </div>
            ) : (
              filteredNurseries.map(nursery => (
                <div key={nursery.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-all cursor-pointer">
                  <div className="w-full bg-green-200 aspect-[4/3] rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-green-700">local_florist</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-gray-900 text-base font-bold">{nursery.nursery_name}</p>
                    <p className="text-gray-600 text-sm">Total: {nursery.total_seedlings.toLocaleString()} seedlings</p>
                    <p className="text-gray-600 text-sm">Capacity: {nursery.total_capacity.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStageColor(nursery.stage)}`}>
                        {getStageLabel(nursery.stage)}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                        {nursery.species_count} species
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Nursery Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Nursery</h2>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-symbols-outlined text-3xl">close</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddNursery} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nursery Name *
                  </label>
                  <input
                    type="text"
                    name="nursery_name"
                    value={formData.nursery_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Seedlings *
                    </label>
                    <input
                      type="number"
                      name="total_seedlings"
                      value={formData.total_seedlings}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Capacity *
                    </label>
                    <input
                      type="number"
                      name="total_capacity"
                      value={formData.total_capacity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Species *
                    </label>
                    <input
                      type="number"
                      name="species_count"
                      value={formData.species_count}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Growth Stage *
                    </label>
                    <select
                      name="stage"
                      value={formData.stage}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="sowing">Sowing</option>
                      <option value="germination">Germination</option>
                      <option value="hardening">Hardening</option>
                      <option value="ready">Ready for Transplant</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                  >
                    Add Nursery
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
