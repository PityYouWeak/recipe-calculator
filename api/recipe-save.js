import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    console.log(req.method);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { name, ingredients, laborHours, laborMinutes, laborRate, overheadPercent, markupPercent, wastePercent, cost, userId } = req.body;
  console.log('Received recipe data:', { name, ingredients, laborHours, laborMinutes, laborRate, overheadPercent, markupPercent, wastePercent, cost, userId });
  if (!name || !Array.isArray(ingredients) || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    // Insert recipe (without user_id)
    const recipeResult = await sql`
      INSERT INTO recipes (name, labor_hours, labor_minutes, labor_rate, overhead_percent, markup_percent, waste_percent, created_at)
      VALUES (${name}, ${laborHours}, ${laborMinutes}, ${laborRate}, ${overheadPercent}, ${markupPercent}, ${wastePercent}, NOW())
      RETURNING id;
    `;
    const recipeId = recipeResult.rows[0].id;
    console.log('Inserted recipe with ID:', recipeId);
    // Link recipe to user in user_recipe table
    await sql`
      INSERT INTO user_recipe (recipe_id, user_id)
      VALUES (${recipeId}, ${userId});
    `;
    // Insert ingredients for recipe
    for (const ing of ingredients) {
      await sql`
        INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
        VALUES (${recipeId}, ${ing.id}, ${ing.quantity});
      `;
    }
    return res.status(200).json({ message: 'Recipe saved!', recipeId });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: 'Failed to save recipe', details: error.message });
  }
}
