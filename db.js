// IndexedDB Helper untuk Vehicle Maintenance App
class VehicleDB {
    constructor() {
        this.dbName = 'VehicleMaintenanceDB';
        this.version = 1;
        this.db = null;
    }

    // Initialize database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('❌ Database error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('🔄 Upgrading database...');

                // Store untuk data kendaraan
                if (!db.objectStoreNames.contains('vehicle')) {
                    db.createObjectStore('vehicle', { keyPath: 'id' });
                    console.log('✅ Created vehicle store');
                }

                // Store untuk maintenance records
                if (!db.objectStoreNames.contains('maintenance')) {
                    const maintenanceStore = db.createObjectStore('maintenance', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    maintenanceStore.createIndex('type', 'type', { unique: false });
                    maintenanceStore.createIndex('date', 'date', { unique: false });
                    console.log('✅ Created maintenance store with indexes');
                }
            };
        });
    }

    // Save vehicle data
    async saveVehicle(data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['vehicle'], 'readwrite');
            const store = tx.objectStore('vehicle');
            const request = store.put({ id: 1, ...data });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get vehicle data
    async getVehicle() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['vehicle'], 'readonly');
            const store = tx.objectStore('vehicle');
            const request = store.get(1);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Add maintenance record
    async addMaintenance(record) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['maintenance'], 'readwrite');
            const store = tx.objectStore('maintenance');
            const request = store.add(record);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get all maintenance records
    async getAllMaintenance() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['maintenance'], 'readonly');
            const store = tx.objectStore('maintenance');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Delete maintenance record
    async deleteMaintenance(id) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['maintenance'], 'readwrite');
            const store = tx.objectStore('maintenance');
            const request = store.delete(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Update maintenance record
    async updateMaintenance(id, data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['maintenance'], 'readwrite');
            const store = tx.objectStore('maintenance');
            const request = store.put({ id, ...data });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}