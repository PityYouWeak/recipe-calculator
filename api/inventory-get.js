import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });

  try {
    const result = await sql.query(
      `SELECT ii.* FROM inventory_items ii
       JOIN user_inventory ui ON ii.id = ui.inventory_items_id
       WHERE ui.user_id = $1`,
      [userId]
    );
    res.status(200).json({ inventory: Array.isArray(result) ? result : [] });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error: error.message });
  }
}
