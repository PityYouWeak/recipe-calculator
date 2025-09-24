class InventoryManager {
  constructor(inventory = []) {
    this.inventory = inventory;
  }

  static async syncWithDb(userId) {
    if (navigator.onLine) {
      try {
        const response = await fetch(`/api/inventory-get?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          localStorage.removeItem('inventory');
          localStorage.setItem('inventory', JSON.stringify(data.inventory));
          console.log(data.inventory);
          return new InventoryManager(data.inventory);
        }
      } catch (err) {
        console.error('Failed to sync inventory from DB:', err);
      }
    }
    // Fallback to localStorage
    return InventoryManager.load();
  }

  addItem(item) {
    this.inventory.push(item);
    return [...this.inventory];
  }

  updateItem(id, field, value) {
    this.inventory = this.inventory.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    return [...this.inventory];
  }

  deleteItem(id) {
    this.inventory = this.inventory.filter(item => item.id !== id);
    return [...this.inventory];
  }

  static load() {
    return new InventoryManager(JSON.parse(localStorage.getItem('inventory') || '[]'));
  }

  save() {
    localStorage.setItem('inventory', JSON.stringify(this.inventory));
  }
}

export default InventoryManager;
