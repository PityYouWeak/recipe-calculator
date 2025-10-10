import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    console.log(req.method);
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }
  try {
    // Get recipe IDs for this user
  const recipeLinks = await sql`SELECT recipe_id FROM user_recipe WHERE user_id = ${userId}`;
  const recipeIds = recipeLinks.rows.map(r => r.recipe_id);
    if (recipeIds.length === 0) return res.status(200).json([]);
    // Get recipes
    const recipes = await sql`SELECT * FROM recipes WHERE id = ANY(${recipeIds})`;
    // Get ingredients for all recipes, joined with inventory_items for cost, name, unit
    const ingredients = await sql`
      SELECT ri.recipe_id, ri.ingredient_id, ri.quantity, ii.cost, ii.name, ii.unit
      FROM recipe_ingredients ri
      JOIN inventory_items ii ON ri.ingredient_id = ii.id
      WHERE ri.recipe_id = ANY(${recipeIds})
    `;
    // Group ingredients by recipe
    const ingredientsByRecipe = {};
    for (const ing of ingredients.rows) {
      if (!ingredientsByRecipe[ing.recipe_id]) ingredientsByRecipe[ing.recipe_id] = [];
      ingredientsByRecipe[ing.recipe_id].push(ing);
    }
    // Attach ingredients to recipes
    const recipesWithIngredients = recipes.rows.map(r => ({
      ...r,
      ingredients: ingredientsByRecipe[r.id] || []
    }));
    return res.status(200).json(recipesWithIngredients);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch recipes', details: error.message });
  }
}
