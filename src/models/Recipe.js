class Recipe {
  constructor({ id, name, ingredients, laborHours, laborRate, overheadPercent, markupPercent, wastePercent, createdAt }) {
    this.id = id;
    this.name = name;
    this.ingredients = ingredients || [];
    this.laborHours = laborHours || 0;
    this.laborRate = laborRate || 15;
    this.overheadPercent = overheadPercent || 10;
    this.markupPercent = markupPercent || 50;
    this.wastePercent = wastePercent || 5;
    this.createdAt = createdAt || new Date().toISOString();
    this.cost = this.calculateCost();
  }

  calculateCost() {
    const ingredientCost = this.ingredients.reduce((total, ing) => total + (ing.cost * ing.quantity), 0);
    const wasteAdjustedCost = ingredientCost * (1 + this.wastePercent / 100);
    const laborCost = this.laborHours * this.laborRate;
    const baseCost = wasteAdjustedCost + laborCost;
    const overheadCost = baseCost * (this.overheadPercent / 100);
    const totalCost = baseCost + overheadCost;
    const sellingPrice = totalCost * (1 + this.markupPercent / 100);
    const profit = sellingPrice - totalCost;
    return {
      ingredientCost,
      wasteAdjustedCost,
      laborCost,
      overheadCost,
      totalCost,
      sellingPrice,
      profit,
      profitMargin: (profit / sellingPrice) * 100
    };
  }
}

export default Recipe;
