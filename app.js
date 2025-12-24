import React, { useState, useEffect } from 'react';
import { Car, Plus, Bell, MapPin, Wrench, AlertCircle, Home, TrendingUp, Trash2 } from 'lucide-react';

// Daftar jenis perawatan dengan interval default (dalam km)
const maintenanceTypes = [
  { id: 'oli_mesin', name: 'Oli Mesin', defaultInterval: 2500 },
  { id: 'minyak_rem', name: 'Minyak Rem', defaultInterval: 10000 },
  { id: 'kampas_rem', name: 'Kampas Rem', defaultInterval: 15000 },
  { id: 'lampu_sein', name: 'Lampu Sein', defaultInterval: 20000 },
  { id: 'lampu_depan', name: 'Lampu Depan', defaultInterval: 20000 },
  { id: 'filter_oli', name: 'Filter Oli', defaultInterval: 5000 },
  { id: 'filter_udara', name: 'Filter Udara', defaultInterval: 10000 },
];

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [vehicleName, setVehicleName] = useState('');
  const [currentOdo, setCurrentOdo] = useState('');
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [trackingStart, setTrackingStart] = useState(null);
  const [trackingDistance, setTrackingDistance] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Form states
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [maintenanceInterval, setMaintenanceInterval] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [partCost, setPartCost] = useState('');
  const [serviceCost, setServiceCost] = useState('');

  // Load data dari localStorage
  useEffect(() => {
    const savedVehicle = localStorage.getItem('vehicleName');
    const savedOdo = localStorage.getItem('currentOdo');
    const savedRecords = localStorage.getItem('maintenanceRecords');
    
    if (savedVehicle) setVehicleName(savedVehicle);
    if (savedOdo) setCurrentOdo(savedOdo);
    if (savedRecords) setMaintenanceRecords(JSON.parse(savedRecords));
  }, []);

  // Save data ke localStorage
  useEffect(() => {
    if (vehicleName) localStorage.setItem('vehicleName', vehicleName);
  }, [vehicleName]);

  useEffect(() => {
    if (currentOdo) localStorage.setItem('currentOdo', currentOdo);
  }, [currentOdo]);

  useEffect(() => {
    localStorage.setItem('maintenanceRecords', JSON.stringify(maintenanceRecords));
    checkNotifications();
  }, [maintenanceRecords, currentOdo]);

  // Cek notifikasi perawatan yang jatuh tempo
  const checkNotifications = () => {
    const notifs = [];
    const odo = parseInt(currentOdo) || 0;

    maintenanceRecords.forEach(record => {
      const nextMaintenance = record.odoAtMaintenance + record.interval;
      const remaining = nextMaintenance - odo;

      if (remaining <= 500 && remaining > 0) {
        notifs.push({
          type: 'warning',
          message: `${record.typeName} perlu diganti dalam ${remaining} km lagi`
        });
      } else if (remaining <= 0) {
        notifs.push({
          type: 'danger',
          message: `${record.typeName} sudah melewati batas! Segera ganti!`
        });
      }
    });

    setNotifications(notifs);
  };

  // Handle submit odometer
  const handleOdoSubmit = () => {
    if (currentOdo) {
      localStorage.setItem('currentOdo', currentOdo);
      alert('Odometer berhasil disimpan!');
    }
  };

  // Handle submit maintenance
  const handleMaintenanceSubmit = () => {
    if (!selectedType || !maintenanceInterval || !maintenanceDate) {
      alert('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }
    
    const typeInfo = maintenanceTypes.find(t => t.id === selectedType);
    const newRecord = {
      id: Date.now(),
      type: selectedType,
      typeName: typeInfo.name,
      interval: parseInt(maintenanceInterval),
      odoAtMaintenance: parseInt(currentOdo),
      date: maintenanceDate,
      partCost: parseInt(partCost) || 0,
      serviceCost: parseInt(serviceCost) || 0,
      totalCost: (parseInt(partCost) || 0) + (parseInt(serviceCost) || 0)
    };

    setMaintenanceRecords([...maintenanceRecords, newRecord]);
    
    // Reset form
    setShowMaintenanceForm(false);
    setSelectedType('');
    setMaintenanceInterval('');
    setMaintenanceDate('');
    setPartCost('');
    setServiceCost('');
  };

  // Handle delete maintenance record
  const handleDeleteRecord = (id) => {
    if (confirm('Yakin ingin menghapus data perawatan ini?')) {
      setMaintenanceRecords(maintenanceRecords.filter(r => r.id !== id));
    }
  };

  // Handle tracking
  const startTracking = () => {
    setTracking(true);
    setTrackingStart(parseInt(currentOdo));
    setTrackingDistance(0);
  };

  const stopTracking = () => {
    if (trackingDistance > 0) {
      const newOdo = trackingStart + trackingDistance;
      setCurrentOdo(newOdo.toString());
    }
    setTracking(false);
    setTrackingStart(null);
    setTrackingDistance(0);
  };

  const addManualDistance = (km) => {
    setTrackingDistance(trackingDistance + km);
  };

  // Render Home Tab
  const renderHome = () => (
    <div className="space-y-6">
      {/* Vehicle Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Car className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold">Informasi Kendaraan</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nama Kendaraan</label>
            <input
              type="text"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
              placeholder="Contoh: Honda Beat 2020"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Odometer Saat Ini (km)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={currentOdo}
                onChange={(e) => setCurrentOdo(e.target.value)}
                placeholder="Masukkan kilometer saat ini"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleOdoSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-orange-600" size={24} />
            <h2 className="text-xl font-bold">Peringatan Perawatan</h2>
          </div>
          
          <div className="space-y-2">
            {notifications.map((notif, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg flex items-start gap-3 ${
                  notif.type === 'danger' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <AlertCircle className={notif.type === 'danger' ? 'text-red-600' : 'text-yellow-600'} size={20} />
                <p className={notif.type === 'danger' ? 'text-red-800' : 'text-yellow-800'}>{notif.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracking */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="text-green-600" size={24} />
          <h2 className="text-xl font-bold">Pelacakan Jarak Tempuh</h2>
        </div>
        
        {!tracking ? (
          <button
            onClick={startTracking}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <MapPin size={20} />
            Mulai Pelacakan
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Odometer Awal</p>
              <p className="text-2xl font-bold">{trackingStart} km</p>
              <p className="text-sm text-gray-600 mt-2">Jarak Tempuh</p>
              <p className="text-3xl font-bold text-green-600">{trackingDistance} km</p>
              <p className="text-sm text-gray-600 mt-2">Total</p>
              <p className="text-2xl font-bold">{trackingStart + trackingDistance} km</p>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => addManualDistance(5)}
                className="py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                +5 km
              </button>
              <button
                onClick={() => addManualDistance(10)}
                className="py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                +10 km
              </button>
              <button
                onClick={() => addManualDistance(20)}
                className="py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                +20 km
              </button>
            </div>
            
            <button
              onClick={stopTracking}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Selesai & Simpan
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render Maintenance Tab
  const renderMaintenance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wrench className="text-purple-600" size={24} />
            <h2 className="text-xl font-bold">Riwayat Perawatan</h2>
          </div>
          <button
            onClick={() => setShowMaintenanceForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus size={20} />
            Tambah
          </button>
        </div>

        {showMaintenanceForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Jenis Perawatan *</label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  const type = maintenanceTypes.find(t => t.id === e.target.value);
                  setMaintenanceInterval(type?.defaultInterval || '');
                }}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Pilih jenis perawatan</option>
                {maintenanceTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Interval Perawatan (km) *</label>
              <input
                type="number"
                value={maintenanceInterval}
                onChange={(e) => setMaintenanceInterval(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tanggal Perawatan *</label>
              <input
                type="date"
                value={maintenanceDate}
                onChange={(e) => setMaintenanceDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Biaya Part (Rp)</label>
                <input
                  type="number"
                  value={partCost}
                  onChange={(e) => setPartCost(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Biaya Jasa (Rp)</label>
                <input
                  type="number"
                  value={serviceCost}
                  onChange={(e) => setServiceCost(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleMaintenanceSubmit}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Simpan
              </button>
              <button
                onClick={() => setShowMaintenanceForm(false)}
                className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {maintenanceRecords.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada riwayat perawatan</p>
          ) : (
            maintenanceRecords.map(record => {
              const odo = parseInt(currentOdo) || 0;
              const nextMaintenance = record.odoAtMaintenance + record.interval;
              const remaining = nextMaintenance - odo;
              const progress = Math.min(100, ((record.interval - remaining) / record.interval) * 100);

              return (
                <div key={record.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{record.typeName}</h3>
                      <p className="text-sm text-gray-600">Terakhir: {new Date(record.date).toLocaleDateString('id-ID')}</p>
                      <p className="text-sm text-gray-600">Pada: {record.odoAtMaintenance} km</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="text-right">
                        <p className="font-bold text-lg">Rp {record.totalCost.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-gray-500">Part: Rp {record.partCost.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-gray-500">Jasa: Rp {record.serviceCost.toLocaleString('id-ID')}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={remaining <= 0 ? 'text-red-600 font-bold' : remaining <= 500 ? 'text-orange-600' : 'text-gray-600'}>
                        {remaining <= 0 ? 'Sudah melewati batas!' : `${remaining} km lagi`}
                      </span>
                      <span className="text-gray-600">Ganti di: {nextMaintenance} km</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          remaining <= 0 ? 'bg-red-600' : remaining <= 500 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  // Render Statistics Tab
  const renderStats = () => {
    const totalSpent = maintenanceRecords.reduce((sum, record) => sum + record.totalCost, 0);
    const avgCost = maintenanceRecords.length > 0 ? totalSpent / maintenanceRecords.length : 0;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-indigo-600" size={24} />
            <h2 className="text-xl font-bold">Statistik</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Perawatan</p>
              <p className="text-3xl font-bold text-blue-600">{maintenanceRecords.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Odometer</p>
              <p className="text-3xl font-bold text-green-600">{currentOdo || 0} km</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Biaya</p>
              <p className="text-2xl font-bold text-purple-600">Rp {totalSpent.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Rata-rata Biaya</p>
              <p className="text-2xl font-bold text-orange-600">Rp {Math.round(avgCost).toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold">Riwayat Biaya</h3>
            {maintenanceRecords.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Belum ada data</p>
            ) : (
              maintenanceRecords.slice().reverse().map(record => (
                <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{record.typeName}</p>
                    <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <p className="font-bold text-lg">Rp {record.totalCost.toLocaleString('id-ID')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Car size={28} />
          {vehicleName || 'Pelacakan Perawatan Kendaraan'}
        </h1>
        <p className="text-sm mt-1 opacity-90">Kelola perawatan kendaraan Anda</p>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'maintenance' && renderMaintenance()}
        {activeTab === 'stats' && renderStats()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="container mx-auto max-w-2xl">
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center py-3 ${
                activeTab === 'home' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Home size={24} />
              <span className="text-xs mt-1">Beranda</span>
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex flex-col items-center py-3 ${
                activeTab === 'maintenance' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Wrench size={24} />
              <span className="text-xs mt-1">Perawatan</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex flex-col items-center py-3 ${
                activeTab === 'stats' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <TrendingUp size={24} />
              <span className="text-xs mt-1">Statistik</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;