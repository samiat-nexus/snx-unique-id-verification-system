import { createClient } from '@supabase/supabase-js';

// 🔹 Supabase connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { unique_id } = req.query;

  if (!unique_id) {
    return res.status(400).json({ error: 'Unique ID required' });
  }

  try {
    // Fetch brand info by Unique ID
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('unique_id', unique_id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        verified: false,
        message: '❌ Invalid or Unknown Unique ID'
      });
    }

    // 🔹 Check expiry date
    const today = new Date().toISOString().split('T')[0];
    if (data.expiry_date && data.expiry_date < today) {
      return res.status(200).json({
        verified: false,
        brand: data.brand_name,
        plan: data.plan_type,
        message: '⚠️ Service Expired'
      });
    }

    // 🔹 Check active status
    if (data.is_active === false) {
      return res.status(200).json({
        verified: false,
        brand: data.brand_name,
        message: '🚫 Service Inactive'
      });
    }

    return res.status(200).json({
      verified: true,
      brand: data.brand_name,
      plan: data.plan_type,
      expiry_date: data.expiry_date,
      message: '✅ Verified Brand'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
         }
