import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!;
const ITEM_ID = process.env.ITEM_ID!;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !ITEM_ID) {
  console.error(
    'Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, ITEM_ID',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const STORES = ['Costco', 'Walmart', 'Loblaws', 'Metro', 'FreshCo'];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// Realistic price history: slight fluctuations per store over ~6 months
const entries: { price: number; store: string; purchased_at: string }[] = [
  // 6 months ago
  { price: 4.99, store: 'Walmart', purchased_at: daysAgo(180) },
  { price: 5.49, store: 'Loblaws', purchased_at: daysAgo(178) },
  { price: 4.79, store: 'FreshCo', purchased_at: daysAgo(175) },
  // 5 months ago
  { price: 5.19, store: 'Walmart', purchased_at: daysAgo(150) },
  { price: 5.49, store: 'Costco', purchased_at: daysAgo(148) },
  { price: 4.89, store: 'FreshCo', purchased_at: daysAgo(145) },
  { price: 5.69, store: 'Metro', purchased_at: daysAgo(142) },
  // 4 months ago
  { price: 5.29, store: 'Walmart', purchased_at: daysAgo(120) },
  { price: 5.59, store: 'Loblaws', purchased_at: daysAgo(118) },
  { price: 4.99, store: 'FreshCo', purchased_at: daysAgo(115) },
  { price: 5.49, store: 'Costco', purchased_at: daysAgo(112) },
  // 3 months ago — price spike
  { price: 6.19, store: 'Walmart', purchased_at: daysAgo(90) },
  { price: 6.49, store: 'Loblaws', purchased_at: daysAgo(88) },
  { price: 5.89, store: 'FreshCo', purchased_at: daysAgo(85) },
  { price: 6.29, store: 'Metro', purchased_at: daysAgo(82) },
  { price: 5.99, store: 'Costco', purchased_at: daysAgo(80) },
  // 2 months ago — prices settle
  { price: 5.79, store: 'Walmart', purchased_at: daysAgo(60) },
  { price: 5.99, store: 'Loblaws', purchased_at: daysAgo(58) },
  { price: 5.49, store: 'FreshCo', purchased_at: daysAgo(55) },
  { price: 5.69, store: 'Costco', purchased_at: daysAgo(52) },
  // 1 month ago
  { price: 5.59, store: 'Walmart', purchased_at: daysAgo(30) },
  { price: 6.09, store: 'Loblaws', purchased_at: daysAgo(28) },
  { price: 5.39, store: 'FreshCo', purchased_at: daysAgo(25) },
  { price: 5.89, store: 'Metro', purchased_at: daysAgo(22) },
  { price: 5.49, store: 'Costco', purchased_at: daysAgo(20) },
  // Recent
  { price: 5.49, store: 'Walmart', purchased_at: daysAgo(7) },
  { price: 5.99, store: 'Loblaws', purchased_at: daysAgo(5) },
  { price: 5.29, store: 'FreshCo', purchased_at: daysAgo(3) },
];

async function seed() {
  // Clear existing entries for this item
  const { error: deleteError } = await supabase
    .from('price_entries')
    .delete()
    .eq('item_id', ITEM_ID);

  if (deleteError) {
    console.error('Failed to clear existing entries:', deleteError.message);
    process.exit(1);
  }

  const { error } = await supabase
    .from('price_entries')
    .insert(entries.map(e => ({ ...e, item_id: ITEM_ID })));

  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }

  console.log(`Seeded ${entries.length} entries for item ${ITEM_ID}`);
}

seed();
