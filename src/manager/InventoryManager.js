class InventoryManager {
  constructor(inventory = []) {
    this.inventory = inventory;
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
