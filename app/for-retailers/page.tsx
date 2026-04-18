import Link from 'next/link'

export default function ForRetailersPage() {
  const benefits = [
    {
      icon: '📈',
      title: 'Boost Sales During Slow Periods',
      desc: 'Turn slow inventory days into guaranteed-revenue events. Drops create urgency and excitement around your products.',
    },
    {
      icon: '🎯',
      title: 'Reach New Customer Segments',
      desc: 'DropShop shoppers discover new stores through drops. Turn raffle winners into loyal repeat customers.',
    },
    {
      icon: '💰',
      title: 'Guaranteed Revenue Model',
      desc: 'Every spot sold is guaranteed revenue before you ship a single item. No risk, no unsold inventory.',
    },
    {
      icon: '📣',
      title: 'Marketing & Brand Exposure',
      desc: 'Your drop is promoted across the DropShop feed and discovery pages. Free marketing to engaged shoppers.',
    },
    {
      icon: '⚙️',
      title: 'Operational Efficiency',
      desc: 'Set up a drop in minutes. We handle payments, notifications, and the winner draw — you just ship the product.',
    },
    {
      icon: '🤝',
      title: 'Customer Engagement',
      desc: 'Drops create community. Shoppers follow your store, share drops with friends, and come back for every launch.',
    },
  ]

  const stats = [
    { value: '300%', label: 'Avg engagement increase' },
    { value: '85%', label: 'Improved cash flow' },
    { value: '24/7', label: 'Revenue potential' },
    { value: '95%', label: 'Retailer satisfaction' },
  ]

  const howItWorks = [
    { step: '01', title: 'List Your Product', desc: 'Add photos, set the retail price, choose how many spots to offer, and set your entry price.' },
    { step: '02', title: 'Set Spots & Price', desc: 'Price each spot as low as $5–$50. The math works in your favor: 50 spots × $15 = $750 for a $400 item.' },
    { step: '03', title: 'Launch & Promote', desc: 'Go live with one click. DropShop promotes your drop to our shopper community immediately.' },
    { step: '04', title: 'Get Paid & Ship', desc: 'Once all spots sell or the drop closes, we handle the draw. You collect revenue and ship to the winner.' },
  ]

  const testimonials = [
    {
      store: 'TechGear Plus',
      quote: 'DropShop transformed our slow weekends into our best revenue days. We moved a $1,200 laptop in 48 hours with 80 entries.',
      metric: '+200% weekend revenue',
    },
    {
      store: 'Urban Streetwear',
      quote: 'We sold limited sneakers we\'d been sitting on for months. Hundreds of new followers discovered our store through the drop.',
      metric: '500+ new customers',
    },
    {
      store: 'Fitness Pro Store',
      quote: 'The guaranteed revenue model is a game-changer. We know exactly what we\'ll make before the drop even closes.',
      metric: '95% sell-through rate',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-black gradient-text">DROPSHOP</Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/how-it-works" className="hover:text-periwinkle transition-colors">How It Works</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-periwinkle">Login</Link>
          <Link href="/signup/retailer" className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold text-white">
            Start for Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-bg px-6 py-20 text-center">
        <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-3">For Retailers</p>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
          Grow Your Business<br />with DropShop
        </h1>
        <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Turn your inventory into guaranteed revenue. Move products faster, reach new customers, and build lasting loyalty through the power of drops.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/signup/retailer"
            className="inline-block px-10 py-4 rounded-2xl bg-white text-periwinkle font-bold text-base shadow-md hover:shadow-lg transition-shadow"
          >
            Create Retailer Account — Free
          </Link>
          <Link
            href="/how-it-works"
            className="inline-block px-8 py-4 rounded-2xl border-2 border-white/60 text-white font-bold text-base hover:bg-white/10 transition-colors"
          >
            See How It Works
          </Link>
        </div>
        <p className="text-white/60 text-xs mt-4">No setup fees · No monthly charges · Only pay when you earn</p>
      </section>

      {/* Stats */}
      <section className="bg-gray-900 px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-black gradient-text">{stat.value}</p>
              <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 py-16">
        <h2 className="text-3xl font-black text-center text-gray-900 mb-2">Why Retailers Love DropShop</h2>
        <p className="text-center text-gray-500 mb-10">Everything you need to run successful product drops</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((b) => (
            <div key={b.title} className="bg-gray-50 rounded-2xl p-6">
              <span className="text-3xl mb-3 block">{b.icon}</span>
              <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works for retailers */}
      <section className="px-6 py-16 bg-gray-50">
        <h2 className="text-3xl font-black text-center text-gray-900 mb-10">How to Launch a Drop</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {howItWorks.map((item) => (
            <div key={item.step} className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <p className="text-xs font-bold text-periwinkle uppercase tracking-widest mb-2">{item.step}</p>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-16">
        <h2 className="text-3xl font-black text-center text-gray-900 mb-10">What Retailers Are Saying</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.store} className="bg-gray-50 rounded-2xl p-6">
              <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-900 text-sm">{t.store}</p>
                <span className="text-xs font-semibold text-periwinkle bg-periwinkle/10 px-2 py-1 rounded-full">{t.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-bg px-6 py-16 text-center">
        <h2 className="text-3xl font-black text-white mb-3">Ready to Launch Your First Drop?</h2>
        <p className="text-white/80 text-sm max-w-sm mx-auto mb-4">
          Join hundreds of retailers already using DropShop to move inventory and grow their customer base.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
          <Link
            href="/signup/retailer"
            className="inline-block px-10 py-4 rounded-2xl bg-white text-periwinkle font-bold text-base shadow-md hover:shadow-lg transition-shadow"
          >
            Create Free Retailer Account
          </Link>
        </div>
        <p className="text-white/60 text-xs">No setup fees · 24/7 support · Instant payouts</p>
      </section>
    </div>
  )
}
