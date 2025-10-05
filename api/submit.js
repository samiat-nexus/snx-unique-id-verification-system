import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto'; // 🔹 for auto unique id

// 🔹 Supabase connection setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 🔹 API function to save data
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brand_name, plan_type } = req.body;

    if (!brand_name || !plan_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 🔹 Auto-generate unique ID
    const unique_id = `SNX-${randomUUID().slice(0, 8).toUpperCase()}`;

    // 🔹 Save to Supabase table
    const { data, error } = await supabase
      .from('brands')
      .insert([{ brand_name, unique_id, plan_type }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Data saved successfully!',
      unique_id,
      data
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
