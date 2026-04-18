import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Simple guard — require ?secret=dropshop-seed in the URL
const SEED_SECRET = 'dropshop-seed'

const RETAILER_EMAIL = 'retailer@dropshop.test'
const CONSUMER_EMAIL = 'shopper@dropshop.test'
const TEST_PASSWORD = 'TestPass123!'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('secret') !== SEED_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const log: string[] = []

  // ── 1. Wipe existing seed data cleanly ────────────────────────────────────
  // Find existing seed users and delete them
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const seedEmails = [RETAILER_EMAIL, CONSUMER_EMAIL]
  for (const user of existingUsers?.users ?? []) {
    if (seedEmails.includes(user.email ?? '')) {
      await supabase.auth.admin.deleteUser(user.id)
      log.push(`Deleted existing user: ${user.email}`)
    }
  }

  // ── 2. Create retailer auth user ──────────────────────────────────────────
  const { data: retailerAuth, error: retailerAuthErr } = await supabase.auth.admin.createUser({
    email: RETAILER_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  })
  if (retailerAuthErr || !retailerAuth.user) {
    return NextResponse.json({ error: `Retailer auth: ${retailerAuthErr?.message}`, log }, { status: 500 })
  }
  log.push(`Created retailer auth user: ${retailerAuth.user.id}`)

  // ── 3. Create consumer auth user ──────────────────────────────────────────
  const { data: consumerAuth, error: consumerAuthErr } = await supabase.auth.admin.createUser({
    email: CONSUMER_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  })
  if (consumerAuthErr || !consumerAuth.user) {
    return NextResponse.json({ error: `Consumer auth: ${consumerAuthErr?.message}`, log }, { status: 500 })
  }
  log.push(`Created consumer auth user: ${consumerAuth.user.id}`)

  // ── 4. Create profiles ────────────────────────────────────────────────────
  await supabase.from('profiles').upsert([
    { id: retailerAuth.user.id, role: 'retailer', display_name: 'Edwin Watts' },
    { id: consumerAuth.user.id, role: 'consumer', display_name: 'Alex Shopper' },
  ])
  log.push('Created profiles')

  // ── 5. Create store ───────────────────────────────────────────────────────
  const { data: store, error: storeErr } = await supabase
    .from('stores')
    .insert({
      owner_id: retailerAuth.user.id,
      name: 'Edwin Watts Golf',
      description: 'South Florida\'s premier golf retailer.',
      address: '20655 Lyons Rd, Boca Raton, FL 33434',
      phone: '(561) 451-9200',
      balance_cents: 24000,
    })
    .select()
    .single()

  if (storeErr || !store) {
    return NextResponse.json({ error: `Store: ${storeErr?.message}`, log }, { status: 500 })
  }
  log.push(`Created store: ${store.id}`)

  // ── 6. Fetch category IDs ─────────────────────────────────────────────────
  const { data: categories } = await supabase.from('categories').select('id, slug')
  const catId = (slug: string) => categories?.find((c) => c.slug === slug)?.id ?? ''

  // ── 7. Create drops ───────────────────────────────────────────────────────
  const now = new Date()
  const hoursFromNow = (h: number) => new Date(now.getTime() + h * 3_600_000).toISOString()

  const dropSeeds = [
    {
      title: 'TaylorMade Qi10 Driver',
      description: 'Right Hand, Stiff Flex, 10.5 Loft. Wrapped in a clean and confident package, the Qi10 driver has been strategically engineered to help players optimize distance and enhance forgiveness.',
      size: 'Fixed at Any',
      category_slug: 'sports',
      retail_value_cents: 59999,
      price_per_spot_cents: 4000,
      total_spots: 10,
      spots_claimed: 5,
      closes_at: hoursFromNow(6),
      status: 'active',
      pickup_name: 'Edwin Watts Golf',
      pickup_address: '20655 Lyons Rd, Boca Raton, FL 33434',
      pickup_phone: '(561) 451-9200',
      image: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=600&q=80',
    },
    {
      title: 'STX Lacrosse Stick',
      description: 'STX Eclipse II complete goalie stick, 40 inch black shaft. One of the most trusted goalie sticks in the game. Includes mesh pre-strung head.',
      size: '40"',
      category_slug: 'sports',
      retail_value_cents: 17999,
      price_per_spot_cents: 1500,
      total_spots: 10,
      spots_claimed: 2,
      closes_at: hoursFromNow(12),
      status: 'active',
      pickup_name: 'Edwin Watts Golf',
      pickup_address: '20655 Lyons Rd, Boca Raton, FL 33434',
      pickup_phone: '(561) 451-9200',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
    },
    {
      title: 'Alo Yoga Sweatshirt',
      description: 'The Accolade Hoodie in Bone / Ivory. Ultra-soft brushed fleece interior, relaxed fit, kangaroo pocket. Perfect for studio and street.',
      size: 'M',
      category_slug: 'mens-athleisure',
      retail_value_cents: 13800,
      price_per_spot_cents: 1000,
      total_spots: 12,
      spots_claimed: 8,
      closes_at: hoursFromNow(3),
      status: 'active',
      pickup_name: 'Edwin Watts Golf',
      pickup_address: '20655 Lyons Rd, Boca Raton, FL 33434',
      pickup_phone: '(561) 451-9200',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
    },
    {
      title: 'Men\'s Nike Dri-FIT Hat',
      description: 'Classic Nike Dri-FIT ADV Tour Cap in flat gray. Moisture-wicking fabric keeps you cool on and off the course. One size fits most.',
      size: 'One Size',
      category_slug: 'mens-athleisure',
      retail_value_cents: 3500,
      price_per_spot_cents: 500,
      total_spots: 6,
      spots_claimed: 1,
      closes_at: hoursFromNow(24),
      status: 'active',
      pickup_name: 'Edwin Watts Golf',
      pickup_address: '20655 Lyons Rd, Boca Raton, FL 33434',
      pickup_phone: '(561) 451-9200',
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80',
    },
    {
      title: 'Zimmermann Silk Skirt',
      description: 'Zimmermann Lucky Daisy Scallop Mini Skirt in floral ivory/multi. Fully lined, back zip. Effortlessly elegant resort wear from the iconic Australian label.',
      size: '2 (US S)',
      category_slug: 'womens-athleisure',
      retail_value_cents: 49500,
      price_per_spot_cents: 6000,
      total_spots: 10,
      spots_claimed: 3,
      closes_at: hoursFromNow(48),
      status: 'active',
      pickup_name: 'Edwin Watts Golf',
      pickup_address: '20655 Lyons Rd, Boca Raton, FL 33434',
      pickup_phone: '(561) 451-9200',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
    },
    {
      title: 'STAUD Mini Dress',
      description: 'STAUD Puff-sleeve poplin mini dress in azure blue. Square neckline, smocked bodice, tiered skirt. Fully lined.',
      size: 'S',
      category_slug: 'boutique-clothing',
      retail_value_cents: 29500,
      price_per_spot_cents: 2000,
      total_spots: 10,
      spots_claimed: 7,
      closes_at: hoursFromNow(5),
      status: 'active',
      pickup_name: 'Edwin Watts Golf',
      pickup_address: '20655 Lyons Rd, Boca Raton, FL 33434',
      pickup_phone: '(561) 451-9200',
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80',
    },
    {
      title: 'Lack of Color Sun Hat',
      description: 'Lack of Color Wave Brim hat in natural straw. One of the most recognisable hats on Instagram. Fits most heads, adjustable inner ribbon.',
      size: 'One Size',
      category_slug: 'accessories',
      retail_value_cents: 9900,
      price_per_spot_cents: 1000,
      total_spots: 12,
      spots_claimed: 4,
      closes_at: hoursFromNow(18),
      status: 'active',
      pickup_name: 'Edwin Watts Golf',
      pickup_address: '20655 Lyons Rd, Boca Raton, FL 33434',
      pickup_phone: '(561) 451-9200',
      image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80',
    },
    {
      title: 'Multi Stone Drop Earrings',
      description: 'Hand-beaded multi stone earrings in turquoise, coral, and gold. Nickel-free brass hooks, approximately 3.5 inches in length. One-of-a-kind artisan piece.',
      size: 'One Size',
      category_slug: 'boutique-jewelry',
      retail_value_cents: 8500,
      price_per_spot_cents: 500,
      total_spots: 6,
      spots_claimed: 5,
      closes_at: hoursFromNow(1),
      status: 'active',
      pickup_name: 'Edwin Watts Golf',
      pickup_address: '20655 Lyons Rd, Boca Raton, FL 33434',
      pickup_phone: '(561) 451-9200',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    },
    {
      title: 'Shinola Runwell Watch',
      description: 'Shinola Detroit Runwell 41mm watch in white dial with brown leather strap. Swiss quartz movement, sapphire crystal glass, water resistant to 30M. Made in Detroit.',
      size: '41mm',
      category_slug: 'watches',
      retail_value_cents: 79500,
      price_per_spot_cents: 5000,
      total_spots: 10,
      spots_claimed: 0,
      closes_at: hoursFromNow(72),
      status: 'active',
      pickup_name: 'Edwin Watts Golf',
      pickup_address: '20655 Lyons Rd, Boca Raton, FL 33434',
      pickup_phone: '(561) 451-9200',
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
    },
    {
      title: 'Nike Air Jordan 1 Retro High',
      description: 'Nike Air Jordan 1 Retro High OG in University Blue / White. DS (deadstock), brand new with original box. Size 10.5 US.',
      size: '10.5 US',
      category_slug: 'shoes',
      retail_value_cents: 18000,
      price_per_spot_cents: 1500,
      total_spots: 10,
      spots_claimed: 9,
      closes_at: hoursFromNow(2),
      status: 'active',
      pickup_name: 'Edwin Watts Golf',
      pickup_address: '20655 Lyons Rd, Boca Raton, FL 33434',
      pickup_phone: '(561) 451-9200',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    },
    // One completed drop (so winner flow can be tested)
    {
      title: 'Callaway Rogue ST Driver — COMPLETED',
      description: 'Callaway Rogue ST Max driver. 10.5 degrees, right hand, regular flex. AI-designed Flash Face SS22 for maximum ball speed across the face.',
      size: 'Regular Flex',
      category_slug: 'sports',
      retail_value_cents: 49999,
      price_per_spot_cents: 3000,
      total_spots: 5,
      spots_claimed: 5,
      closes_at: new Date(now.getTime() - 3_600_000).toISOString(), // 1 hour ago
      status: 'completed',
      pickup_name: 'Edwin Watts Golf',
      pickup_address: '20655 Lyons Rd, Boca Raton, FL 33434',
      pickup_phone: '(561) 451-9200',
      image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&q=80',
    },
    // One draft
    {
      title: 'Pickleball Paddle Set (DRAFT)',
      description: 'Franklin Sports Pickleball Paddle and Ball Set. 2 graphite paddles, 4 balls, carry bag. Great for beginners and intermediate players.',
      size: 'Standard',
      category_slug: 'sports',
      retail_value_cents: 8999,
      price_per_spot_cents: 1000,
      total_spots: 8,
      spots_claimed: 0,
      closes_at: hoursFromNow(96),
      status: 'draft',
      pickup_name: 'Edwin Watts Golf',
      pickup_address: '20655 Lyons Rd, Boca Raton, FL 33434',
      pickup_phone: '(561) 451-9200',
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80',
    },
  ]

  const createdDrops: { id: string; title: string }[] = []

  for (const seed of dropSeeds) {
    const { data: drop, error: dropErr } = await supabase
      .from('drops')
      .insert({
        store_id: store.id,
        category_id: catId(seed.category_slug),
        title: seed.title,
        description: seed.description,
        size: seed.size,
        retail_value_cents: seed.retail_value_cents,
        price_per_spot_cents: seed.price_per_spot_cents,
        total_spots: seed.total_spots,
        spots_claimed: seed.spots_claimed,
        closes_at: seed.closes_at,
        status: seed.status,
        pickup_name: seed.pickup_name,
        pickup_address: seed.pickup_address,
        pickup_phone: seed.pickup_phone,
      })
      .select()
      .single()

    if (dropErr || !drop) {
      log.push(`Failed drop "${seed.title}": ${dropErr?.message}`)
      continue
    }

    // Insert image
    await supabase.from('drop_images').insert({
      drop_id: drop.id,
      url: seed.image,
      position: 0,
    })

    createdDrops.push({ id: drop.id, title: drop.title })
    log.push(`Created drop: ${seed.title}`)
  }

  // ── 8. Mark the completed drop with the consumer as winner ────────────────
  const completedDrop = createdDrops.find((d) => d.title.includes('COMPLETED'))
  if (completedDrop) {
    await supabase
      .from('drops')
      .update({ winner_id: consumerAuth.user.id })
      .eq('id', completedDrop.id)

    // Add an entry so profile page shows it
    await supabase.from('entries').upsert({
      drop_id: completedDrop.id,
      user_id: consumerAuth.user.id,
      stripe_payment_intent_id: 'seed_pi_completed',
      spots_count: 2,
      selected_number: 7,
    })

    await supabase.from('notifications').insert({
      user_id: consumerAuth.user.id,
      type: 'win',
      drop_id: completedDrop.id,
    })

    log.push(`Set consumer as winner of: ${completedDrop.title}`)
  }

  // ── 9. Add a couple of entries for the consumer on active drops ───────────
  const activeDrop1 = createdDrops.find((d) => d.title.includes('TaylorMade'))
  const activeDrop2 = createdDrops.find((d) => d.title.includes('Alo'))

  for (const d of [activeDrop1, activeDrop2]) {
    if (d) {
      await supabase.from('entries').upsert({
        drop_id: d.id,
        user_id: consumerAuth.user.id,
        stripe_payment_intent_id: `seed_pi_${d.id.slice(0, 8)}`,
        spots_count: 1,
        selected_number: 3,
      })
      log.push(`Added consumer entry to: ${d.title}`)
    }
  }

  return NextResponse.json({
    success: true,
    accounts: {
      retailer: { email: RETAILER_EMAIL, password: TEST_PASSWORD },
      consumer: { email: CONSUMER_EMAIL, password: TEST_PASSWORD },
    },
    store: store.name,
    drops_created: createdDrops.length,
    log,
  })
}
