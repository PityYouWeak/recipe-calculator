import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { inventory } = req.body;
    if (!Array.isArray(inventory)) {
      return res.status(400).json({ message: 'Invalid inventory data.' });
    }
    try {
      // Save each inventory item
      const client = await pool.connect();
      try {
        // Optional: clear table before saving (uncomment if needed)
        // await client.query('DELETE FROM inventory_items');
        for (const item of inventory) {
          await client.query(
            `INSERT INTO public.inventory_items (id, name, unit, cost, category)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE SET name = $2, unit = $3, cost = $4, category = $5`,
            [item.id, item.name, item.unit, item.cost, item.category]
          );
        }
        res.status(200).json({ message: 'Inventory saved to Neon DB!' });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
      res.status(500).json({ message: 'Database error.' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
