import { createClient } from '@supabase/supabase-js';

// 🔹 Supabase connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 🔹 Verify API
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { unique_id } = req.query;

  if (!unique_id) {
    return res.status(400).json({ error: 'Unique ID required' });
  }

  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('unique_id', unique_id)
      .single();

    if (error || !data) {
      return res.status(404).json({ verified: false, message: 'Invalid Unique ID' });
    }

    return res.status(200).json({
      verified: true,
      brand: data.brand_name,
      plan: data.plan_type,
      message: 'Verified Brand ✅'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
