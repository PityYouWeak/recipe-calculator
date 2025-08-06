class Ingredient {
  constructor({ id, name, unit, cost, quantity }) {
    this.id = id;
    this.name = name;
    this.unit = unit;
    this.cost = cost;
    this.quantity = quantity || 1;
  }
}

export default Ingredient;
