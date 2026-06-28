import { NextRequest } from 'next/server';
import { createServerClient } from '../../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { uploadImage } from '../../where-is/r2';

export const runtime = 'nodejs';

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};
const isoFromNow = (hours: number) => {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
};

export async function POST(request: NextRequest) {
  const accessToken =
    request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const supabase = createServerClient(accessToken);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const { homeId } = (await request.json()) as { homeId: number };
  if (!homeId) {
    return Response.json(
      { error: 'homeId is required' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const results: Record<string, string> = {};

  // Household rules
  const { error: rulesErr } = await supabase.from('household_rules').insert([
    {
      name: 'Clean up after yourself',
      description: 'Dishes go in the dishwasher, not the sink.',
      position: 1,
      home_id: homeId,
    },
    {
      name: 'Quiet hours after 10pm',
      description: 'Keep noise to a minimum after 10pm on weekdays.',
      position: 2,
      home_id: homeId,
    },
    {
      name: 'Take out trash on Tuesdays',
      description: null,
      position: 3,
      home_id: homeId,
    },
    {
      name: 'Label your food in the fridge',
      description: 'Write your name and date on items.',
      position: 4,
      home_id: homeId,
    },
  ]);
  results['household-rules'] = rulesErr ? rulesErr.message : 'ok';

  // Leisure activities
  const { error: leisureErr } = await supabase
    .from('leisure_activities')
    .insert([
      {
        title: 'Dune',
        description: 'Epic sci-fi film set on a desert planet.',
        category: 'Movies',
        home_id: homeId,
        user_id: user.id,
      },
      {
        title: 'The Last of Us',
        description: 'Post-apocalyptic HBO series.',
        category: 'Shows',
        home_id: homeId,
        user_id: user.id,
      },
      {
        title: 'Catan',
        description: 'Classic resource-trading board game.',
        category: 'Games',
        home_id: homeId,
        user_id: user.id,
      },
      {
        title: 'Morning hike at the ravine',
        description: '5km trail nearby.',
        category: 'Outdoors',
        home_id: homeId,
        user_id: user.id,
      },
      {
        title: 'Knitting project',
        description: 'Winter scarf for mum.',
        category: 'Crafts',
        home_id: homeId,
        user_id: user.id,
      },
    ]);
  results['leisure-activities'] = leisureErr ? leisureErr.message : 'ok';

  // Meals
  const { error: mealsErr } = await supabase.from('meals').insert([
    {
      title: 'Spaghetti Bolognese',
      description: 'Classic Italian pasta with meat sauce.',
      category: 'Dinner',
      servings: 4,
      home_id: homeId,
      user_id: user.id,
    },
    {
      title: 'Avocado Toast',
      description: 'Sourdough with smashed avocado and chili flakes.',
      category: 'Breakfast',
      servings: 2,
      home_id: homeId,
      user_id: user.id,
    },
    {
      title: 'Caesar Salad',
      description: 'Romaine, croutons, parmesan, caesar dressing.',
      category: 'Lunch',
      servings: 3,
      home_id: homeId,
      user_id: user.id,
    },
    {
      title: 'Chicken Stir Fry',
      description: 'Quick weeknight dinner with veggies and rice.',
      category: 'Dinner',
      servings: 4,
      home_id: homeId,
      user_id: user.id,
    },
    {
      title: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten centre.',
      category: 'Dessert',
      servings: 2,
      home_id: homeId,
      user_id: user.id,
    },
  ]);
  results['meals'] = mealsErr ? mealsErr.message : 'ok';

  // Projects
  const { error: projectsErr } = await supabase.from('home_projects').insert([
    {
      title: 'Paint the living room',
      description: 'Switch from white to warm grey.',
      category: 'Painting',
      status: 'Todo',
      home_id: homeId,
      user_id: user.id,
    },
    {
      title: 'Fix leaking kitchen faucet',
      description: null,
      category: 'Plumbing',
      status: 'In Progress',
      home_id: homeId,
      user_id: user.id,
    },
    {
      title: 'Build garden bed',
      description: '4x8ft raised bed for vegetables.',
      category: 'Garden',
      status: 'Todo',
      home_id: homeId,
      user_id: user.id,
    },
    {
      title: 'Install new light fixtures',
      description: 'Replace old fixtures in hallway.',
      category: 'Electrical',
      status: 'Done',
      home_id: homeId,
      user_id: user.id,
    },
  ]);
  results['home-projects'] = projectsErr ? projectsErr.message : 'ok';

  // Resources
  const { data: resourceRows, error: resourcesErr } = await supabase
    .from('resources')
    .insert([
      {
        name: 'Car',
        description: '2020 Honda Civic',
        category: 'Vehicle',
        quantity: 1,
        home_id: homeId,
        user_id: user.id,
      },
      {
        name: 'Power Drill',
        description: 'DeWalt 18V cordless drill',
        category: 'Tool',
        quantity: 1,
        home_id: homeId,
        user_id: user.id,
      },
      {
        name: 'Guest Room',
        description: 'Second bedroom available for guests',
        category: 'Room',
        quantity: 1,
        home_id: homeId,
        user_id: user.id,
      },
    ])
    .select();
  results['home-resources'] = resourcesErr ? resourcesErr.message : 'ok';

  // Resource bookings (for the car)
  if (resourceRows && resourceRows.length > 0) {
    const carId = resourceRows[0].id;
    const { error: bookingsErr } = await supabase
      .from('resource_bookings')
      .insert([
        {
          resource_id: carId,
          title: 'Airport run',
          description: null,
          start_date: daysFromNow(3),
          end_date: daysFromNow(3),
          home_id: homeId,
        },
        {
          resource_id: carId,
          title: 'Weekend trip',
          description: 'Drive to the cottage.',
          start_date: daysFromNow(10),
          end_date: daysFromNow(12),
          home_id: homeId,
        },
      ]);
    results['resource-bookings'] = bookingsErr ? bookingsErr.message : 'ok';
  }

  // Calendar events
  const { error: calErr } = await supabase.from('calendar_events').insert([
    {
      title: 'Weekly house meeting',
      description: 'Quick sync every Sunday.',
      start: isoFromNow(24),
      end: isoFromNow(25),
      all_day: false,
      color: '#4f86f7',
      home_id: homeId,
      user_id: user.id,
    },
    {
      title: 'Grocery run',
      description: null,
      start: `${daysFromNow(2)}T10:00:00.000Z`,
      end: `${daysFromNow(2)}T11:00:00.000Z`,
      all_day: false,
      color: null,
      home_id: homeId,
      user_id: user.id,
    },
    {
      title: 'Plumber visit',
      description: 'Fix kitchen faucet.',
      start: `${daysFromNow(5)}T09:00:00.000Z`,
      end: `${daysFromNow(5)}T10:00:00.000Z`,
      all_day: false,
      color: '#f7a84f',
      home_id: homeId,
      user_id: user.id,
    },
    {
      title: 'Game night',
      description: 'Catan + pizza.',
      start: `${daysFromNow(7)}T18:00:00.000Z`,
      end: `${daysFromNow(7)}T22:00:00.000Z`,
      all_day: false,
      color: '#7c4ff7',
      home_id: homeId,
      user_id: user.id,
    },
    {
      title: 'Rent due',
      description: null,
      start: `${daysFromNow(14)}`,
      end: `${daysFromNow(14)}`,
      all_day: true,
      color: '#f74f4f',
      home_id: homeId,
      user_id: user.id,
    },
  ]);
  results['calendar-events'] = calErr ? calErr.message : 'ok';

  // Price tracker
  const { data: priceItemRows, error: priceItemsErr } = await supabase
    .from('price_items')
    .insert([
      {
        name: 'Whole Milk',
        category: 'Dairy',
        unit: '4L',
        home_id: homeId,
        user_id: user.id,
      },
      {
        name: 'Sourdough Bread',
        category: 'Bakery',
        unit: 'loaf',
        home_id: homeId,
        user_id: user.id,
      },
      {
        name: 'Chicken Breast',
        category: 'Meat',
        unit: 'kg',
        home_id: homeId,
        user_id: user.id,
      },
    ])
    .select();
  results['price-items'] = priceItemsErr ? priceItemsErr.message : 'ok';

  if (priceItemRows && priceItemRows.length > 0) {
    const [milk, bread, chicken] = priceItemRows;
    const { error: priceEntriesErr } = await supabase
      .from('price_entries')
      .insert([
        // Whole Milk — 3 stores over 6 months, spike around 3 months ago
        {
          item_id: milk.id,
          price: 4.99,
          store: 'Walmart',
          purchased_at: daysFromNow(-180),
        },
        {
          item_id: milk.id,
          price: 5.49,
          store: 'Loblaws',
          purchased_at: daysFromNow(-178),
        },
        {
          item_id: milk.id,
          price: 4.79,
          store: 'Costco',
          purchased_at: daysFromNow(-175),
        },
        {
          item_id: milk.id,
          price: 5.19,
          store: 'Walmart',
          purchased_at: daysFromNow(-150),
        },
        {
          item_id: milk.id,
          price: 5.49,
          store: 'Loblaws',
          purchased_at: daysFromNow(-148),
        },
        {
          item_id: milk.id,
          price: 4.89,
          store: 'Costco',
          purchased_at: daysFromNow(-145),
        },
        {
          item_id: milk.id,
          price: 5.29,
          store: 'Walmart',
          purchased_at: daysFromNow(-120),
        },
        {
          item_id: milk.id,
          price: 5.69,
          store: 'Loblaws',
          purchased_at: daysFromNow(-118),
        },
        {
          item_id: milk.id,
          price: 4.99,
          store: 'Costco',
          purchased_at: daysFromNow(-115),
        },
        {
          item_id: milk.id,
          price: 6.29,
          store: 'Walmart',
          purchased_at: daysFromNow(-90),
        },
        {
          item_id: milk.id,
          price: 6.79,
          store: 'Loblaws',
          purchased_at: daysFromNow(-88),
        },
        {
          item_id: milk.id,
          price: 5.99,
          store: 'Costco',
          purchased_at: daysFromNow(-85),
        },
        {
          item_id: milk.id,
          price: 5.79,
          store: 'Walmart',
          purchased_at: daysFromNow(-60),
        },
        {
          item_id: milk.id,
          price: 6.09,
          store: 'Loblaws',
          purchased_at: daysFromNow(-58),
        },
        {
          item_id: milk.id,
          price: 5.49,
          store: 'Costco',
          purchased_at: daysFromNow(-55),
        },
        {
          item_id: milk.id,
          price: 5.59,
          store: 'Walmart',
          purchased_at: daysFromNow(-30),
        },
        {
          item_id: milk.id,
          price: 5.99,
          store: 'Loblaws',
          purchased_at: daysFromNow(-28),
        },
        {
          item_id: milk.id,
          price: 5.29,
          store: 'Costco',
          purchased_at: daysFromNow(-25),
        },
        {
          item_id: milk.id,
          price: 5.49,
          store: 'Walmart',
          purchased_at: daysFromNow(-7),
        },
        {
          item_id: milk.id,
          price: 5.89,
          store: 'Loblaws',
          purchased_at: daysFromNow(-5),
        },
        {
          item_id: milk.id,
          price: 5.19,
          store: 'Costco',
          purchased_at: daysFromNow(-3),
        },
        // Sourdough Bread — 2 stores, steady rise over time
        {
          item_id: bread.id,
          price: 3.49,
          store: 'Whole Foods',
          purchased_at: daysFromNow(-180),
        },
        {
          item_id: bread.id,
          price: 2.99,
          store: 'Local Bakery',
          purchased_at: daysFromNow(-175),
        },
        {
          item_id: bread.id,
          price: 3.69,
          store: 'Whole Foods',
          purchased_at: daysFromNow(-140),
        },
        {
          item_id: bread.id,
          price: 3.19,
          store: 'Local Bakery',
          purchased_at: daysFromNow(-135),
        },
        {
          item_id: bread.id,
          price: 3.89,
          store: 'Whole Foods',
          purchased_at: daysFromNow(-100),
        },
        {
          item_id: bread.id,
          price: 3.39,
          store: 'Local Bakery',
          purchased_at: daysFromNow(-95),
        },
        {
          item_id: bread.id,
          price: 4.19,
          store: 'Whole Foods',
          purchased_at: daysFromNow(-60),
        },
        {
          item_id: bread.id,
          price: 3.69,
          store: 'Local Bakery',
          purchased_at: daysFromNow(-55),
        },
        {
          item_id: bread.id,
          price: 4.29,
          store: 'Whole Foods',
          purchased_at: daysFromNow(-20),
        },
        {
          item_id: bread.id,
          price: 3.89,
          store: 'Local Bakery',
          purchased_at: daysFromNow(-15),
        },
        {
          item_id: bread.id,
          price: 4.49,
          store: 'Whole Foods',
          purchased_at: daysFromNow(-4),
        },
        {
          item_id: bread.id,
          price: 3.99,
          store: 'Local Bakery',
          purchased_at: daysFromNow(-2),
        },
        // Chicken Breast — 3 stores, volatile pricing
        {
          item_id: chicken.id,
          price: 11.99,
          store: 'Costco',
          purchased_at: daysFromNow(-180),
        },
        {
          item_id: chicken.id,
          price: 13.99,
          store: 'Loblaws',
          purchased_at: daysFromNow(-178),
        },
        {
          item_id: chicken.id,
          price: 12.49,
          store: 'Metro',
          purchased_at: daysFromNow(-175),
        },
        {
          item_id: chicken.id,
          price: 10.99,
          store: 'Costco',
          purchased_at: daysFromNow(-150),
        },
        {
          item_id: chicken.id,
          price: 14.49,
          store: 'Loblaws',
          purchased_at: daysFromNow(-145),
        },
        {
          item_id: chicken.id,
          price: 13.29,
          store: 'Metro',
          purchased_at: daysFromNow(-140),
        },
        {
          item_id: chicken.id,
          price: 12.99,
          store: 'Costco',
          purchased_at: daysFromNow(-120),
        },
        {
          item_id: chicken.id,
          price: 15.99,
          store: 'Loblaws',
          purchased_at: daysFromNow(-115),
        },
        {
          item_id: chicken.id,
          price: 11.49,
          store: 'Costco',
          purchased_at: daysFromNow(-90),
        },
        {
          item_id: chicken.id,
          price: 16.49,
          store: 'Loblaws',
          purchased_at: daysFromNow(-88),
        },
        {
          item_id: chicken.id,
          price: 14.99,
          store: 'Metro',
          purchased_at: daysFromNow(-85),
        },
        {
          item_id: chicken.id,
          price: 13.49,
          store: 'Costco',
          purchased_at: daysFromNow(-60),
        },
        {
          item_id: chicken.id,
          price: 15.49,
          store: 'Loblaws',
          purchased_at: daysFromNow(-55),
        },
        {
          item_id: chicken.id,
          price: 13.99,
          store: 'Metro',
          purchased_at: daysFromNow(-50),
        },
        {
          item_id: chicken.id,
          price: 12.99,
          store: 'Costco',
          purchased_at: daysFromNow(-30),
        },
        {
          item_id: chicken.id,
          price: 14.99,
          store: 'Loblaws',
          purchased_at: daysFromNow(-25),
        },
        {
          item_id: chicken.id,
          price: 13.49,
          store: 'Metro',
          purchased_at: daysFromNow(-20),
        },
        {
          item_id: chicken.id,
          price: 12.49,
          store: 'Costco',
          purchased_at: daysFromNow(-7),
        },
        {
          item_id: chicken.id,
          price: 15.29,
          store: 'Loblaws',
          purchased_at: daysFromNow(-5),
        },
        {
          item_id: chicken.id,
          price: 13.99,
          store: 'Metro',
          purchased_at: daysFromNow(-3),
        },
      ]);
    results['price-entries'] = priceEntriesErr ? priceEntriesErr.message : 'ok';
  }

  // Where Is
  const whereIsSeeds = [
    {
      title: 'Toolbox',
      description: 'Red metal toolbox with drill bits and screwdrivers.',
      tags: ['tools', 'garage'],
      picsum: 20,
    },
    {
      title: 'First Aid Kit',
      description: 'White box with bandages, antiseptic, and pain relief.',
      tags: ['medical', 'emergency'],
      picsum: 42,
    },
    {
      title: 'Spare Keys',
      description: 'Front door and mailbox spare keys on a blue keychain.',
      tags: ['keys', 'security'],
      picsum: 60,
    },
    {
      title: 'Winter Clothes',
      description: 'Jackets, scarves, and gloves in storage bins.',
      tags: ['clothes', 'seasonal'],
      picsum: 100,
    },
  ];

  const { data: whereIsRows, error: whereIsErr } = await supabase
    .from('where_is_items')
    .insert(
      whereIsSeeds.map(({ title, description, tags }) => ({
        title,
        description,
        tags,
        home_id: homeId,
        user_id: user.id,
      })),
    )
    .select();
  results['where-is'] = whereIsErr ? whereIsErr.message : 'ok';

  if (whereIsRows) {
    await Promise.allSettled(
      whereIsRows.map(async (row, i) => {
        const seed = whereIsSeeds[i];
        const imgRes = await fetch(
          `https://picsum.photos/seed/${seed.picsum}/640/480`,
        );
        if (!imgRes.ok) return;
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const r2Key = `where-is/${row.id}/${crypto.randomUUID()}.jpg`;
        await uploadImage(r2Key, buffer, 'image/jpeg');
        await supabase.from('where_is_images').insert({
          item_id: row.id,
          r2_key: r2Key,
          mime_type: 'image/jpeg',
          sort_order: 0,
        });
      }),
    );
  }

  // Docs
  const { error: docsErr } = await supabase.from('home_docs').insert([
    {
      name: 'Home Insurance Policy',
      description: 'Annual renewal — expires Dec 2025.',
      category: 'Insurance',
      home_id: homeId,
    },
    {
      name: 'Dishwasher Manual',
      description: 'Bosch Series 6.',
      category: 'Manual',
      home_id: homeId,
    },
    {
      name: 'Lease Agreement',
      description: 'Signed lease for current tenancy.',
      category: 'Contract',
      home_id: homeId,
    },
    {
      name: 'Appliance Warranty',
      description: 'Fridge and washer/dryer warranties.',
      category: 'Warranty',
      home_id: homeId,
    },
  ]);
  results['docs'] = docsErr ? docsErr.message : 'ok';

  return Response.json({ results });
}
