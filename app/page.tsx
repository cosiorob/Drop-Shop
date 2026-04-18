import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getActiveDrops } from '@/lib/drops'
import { formatCents } from '@/lib/format'
import type { Drop } from '@/types'

export default async function RootPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role === 'retailer') redirect('/dashboard')
    redirect('/feed')
  }

  // Fetch public data for landing page
  let featuredDrops: Drop[] = []
  let activeDropCount = 0
  let categoryCount = 0

  try {
    const [drops, catRes, dropCountRes] = await Promise.all([
      getActiveDrops(),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('drops').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ])
    featuredDrops = drops.slice(0, 4)
    categoryCount = catRes.count ?? 0
    activeDropCount = dropCountRes.count ?? 0
  } catch {
    // Fall through — landing page renders without live data
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <span className="text-xl font-black gradient-text">DROPSHOP</span>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/how-it-works" className="hover:text-periwinkle transition-colors">How It Works</Link>
          <Link href="/for-retailers" className="hover:text-periwinkle transition-colors">For Retailers</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-periwinkle transition-colors">Login</Link>
          <Link href="/signup" className="btn-gradient px-4 py-2 rounded-xl text-sm text-white">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-bg px-6 py-20 text-center">
        <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-3">Welcome to</p>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-3 tracking-tight">DROPSHOP</h1>
        <p className="text-2xl md:text-3xl font-bold text-white/90 mb-4">TAKE A BET ON RETAIL</p>
        <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Win coveted products from your favorite local retailers. Enter drops, get exclusive access, and score amazing deals.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-10 mb-10">
          {[
            { value: activeDropCount > 0 ? `${activeDropCount.toLocaleString()}` : '100+', label: 'Active Drops' },
            { value: '5,000+', label: 'Happy Winners' },
            { value: categoryCount > 0 ? `${categoryCount}` : '8', label: 'Categories' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-black text-white">{stat.value}</p>
              <p className="text-white/70 text-xs font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/signup"
            className="inline-block px-8 py-4 rounded-2xl font-bold text-base shadow-lg text-white"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '2px solid rgba(255,255,255,0.4)' }}
          >
            Start Shopping
          </Link>
          <Link
            href="/for-retailers"
            className="inline-block px-8 py-4 rounded-2xl font-bold text-base border-2 border-white/60 text-white hover:bg-white/10 transition-colors"
          >
            I&apos;m a Retailer →
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 bg-gray-50">
        <h2 className="text-3xl font-black text-center text-gray-900 mb-2">How DropShop Works</h2>
        <p className="text-center text-gray-500 mb-10">Three simple steps to win big</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { step: '01', emoji: '🔍', title: 'Discover Drops', desc: 'Browse exclusive product drops from verified local retailers near you.' },
            { step: '02', emoji: '🎟️', title: 'Enter to Win', desc: 'Buy 1–10 spots per drop for a fraction of retail price. More spots = better odds.' },
            { step: '03', emoji: '🏆', title: 'Win & Collect', desc: 'A live spinning wheel draw picks the winner. Collect in-store or arrange delivery.' },
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <p className="text-xs font-bold text-periwinkle uppercase tracking-widest mb-2">{item.step}</p>
              <div className="text-4xl mb-3">{item.emoji}</div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/how-it-works" className="text-sm font-semibold text-periwinkle hover:underline">
            Learn more about how it works →
          </Link>
        </div>
      </section>

      {/* Featured Drops */}
      {featuredDrops.length > 0 && (
        <section className="px-6 py-16">
          <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900">Featured Drops</h2>
            <Link href="/signup" className="text-sm font-semibold text-periwinkle hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {featuredDrops.map((drop) => (
              <FeaturedDropCard key={drop.id} drop={drop} />
            ))}
          </div>
        </section>
      )}

      {/* Retailer strip */}
      <section className="gradient-bg px-6 py-14 text-center">
        <h2 className="text-2xl font-black text-white mb-2">Own a Retail Store?</h2>
        <p className="text-white/80 text-sm max-w-sm mx-auto mb-6">
          Move inventory, reach new customers, and generate guaranteed revenue through the power of drops.
        </p>
        <Link
          href="/for-retailers"
          className="inline-block px-8 py-3 rounded-2xl bg-white text-periwinkle font-bold text-sm shadow-md hover:shadow-lg transition-shadow"
        >
          Learn More for Retailers →
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 bg-gray-900 text-gray-400">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="text-white font-black text-xl mb-1">DROPSHOP</p>
            <p className="text-sm">Take a bet on retail.</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-white text-xs font-semibold uppercase tracking-widest mb-3">Quick Links</p>
              <div className="space-y-2 text-sm">
                <Link href="/how-it-works" className="block hover:text-white transition-colors">How It Works</Link>
                <Link href="/for-retailers" className="block hover:text-white transition-colors">For Retailers</Link>
                <Link href="/signup" className="block hover:text-white transition-colors">Sign Up</Link>
              </div>
            </div>
            <div>
              <p className="text-white text-xs font-semibold uppercase tracking-widest mb-3">Support</p>
              <div className="space-y-2 text-sm">
                <span className="block">FAQ</span>
                <span className="block">Contact</span>
                <span className="block">Privacy</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-600 mt-8">© 2026 DropShop. All rights reserved.</p>
      </footer>

    </div>
  )
}

function FeaturedDropCard({ drop }: { drop: Drop }) {
  const imageUrl = drop.drop_images?.[0]?.url ?? null
  const spotsLeft = drop.total_spots - drop.spots_claimed

  return (
    <Link href="/signup" className="group block">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-2">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={drop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
        )}
        {spotsLeft <= 3 && spotsLeft > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {spotsLeft} left!
          </div>
        )}
      </div>
      <p className="text-xs font-semibold text-periwinkle">{formatCents(drop.price_per_spot_cents)} / spot</p>
      <p className="text-sm font-medium text-gray-900 line-clamp-2">{drop.title}</p>
      <p className="text-xs text-gray-400">Retail: {formatCents(drop.retail_value_cents)}</p>
    </Link>
  )
}
