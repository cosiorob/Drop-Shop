import Link from 'next/link'
import { SpinningWheelPreviewWrapper } from './SpinningWheelPreviewWrapper'

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      emoji: '🔍',
      title: 'Browse Drops',
      desc: 'Explore exclusive product drops from verified local retailers. Filter by category, price, or closing time.',
    },
    {
      num: '02',
      emoji: '🎟️',
      title: 'Pick Your Spots',
      desc: 'Buy 1–10 entry spots per drop. Each spot costs a fraction of retail price. More spots = better odds of winning.',
    },
    {
      num: '03',
      emoji: '💳',
      title: 'Secure Payment',
      desc: 'Pay safely via Stripe. Your entry is confirmed instantly and your spots are locked in.',
    },
    {
      num: '04',
      emoji: '🎡',
      title: 'Live Drawing',
      desc: 'When the drop closes, a spinning wheel publicly selects the winner. Fully transparent and fair.',
    },
  ]

  const features = [
    { icon: '✅', title: 'Verified Retailers', desc: 'Every store on DropShop is verified before listing products.' },
    { icon: '👁️', title: 'Transparent Process', desc: 'Draws are public and recorded. Nothing hidden.' },
    { icon: '🔔', title: 'Instant Notifications', desc: 'Get notified immediately if you win a drop.' },
    { icon: '🔒', title: 'Secure Payments', desc: 'All payments processed by Stripe — bank-level security.' },
    { icon: '⚖️', title: 'Fair Odds', desc: 'More spots = proportionally better odds. Always weighted correctly.' },
    { icon: '🚚', title: 'Fast Collection', desc: 'Pick up in-store or arrange delivery with the retailer.' },
  ]

  const faqs = [
    {
      q: 'Can I increase my chances of winning?',
      a: 'Yes — buy more spots in the same drop. Each spot gives you one more entry in the weighted draw. You can buy up to 10 spots per drop.',
    },
    {
      q: 'When does the draw happen?',
      a: 'Draws happen when all spots are sold, or when the retailer manually closes the drop. You\'ll be notified immediately.',
    },
    {
      q: 'What happens if I win?',
      a: 'You\'ll receive an in-app notification. Contact the retailer to arrange pickup or delivery — their contact info is on the drop page.',
    },
    {
      q: 'Is the draw really random and fair?',
      a: 'Yes. The spinning wheel selects a winner from a pool weighted by spots_count — so more spots truly means better odds. The draw is visible to everyone.',
    },
    {
      q: 'What if I don\'t win?',
      a: 'Your entry supports local retailers and keeps the ecosystem going. Drops launch regularly — there\'s always another chance.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-black gradient-text">DROPSHOP</Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-periwinkle">Login</Link>
          <Link href="/signup" className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold text-white">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-bg px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">How DropShop Works</h1>
        <p className="text-white/80 text-base md:text-lg max-w-md mx-auto mb-10">
          A fair, transparent raffle system for exclusive retail products. Here&apos;s everything you need to know.
        </p>
        <SpinningWheelPreviewWrapper />
      </section>

      {/* Steps */}
      <section className="px-6 py-16 bg-gray-50">
        <h2 className="text-2xl font-black text-center text-gray-900 mb-10">The Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div key={step.num} className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <p className="text-xs font-bold text-periwinkle uppercase tracking-widest mb-2">{step.num}</p>
              <div className="text-4xl mb-3">{step.emoji}</div>
              <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <h2 className="text-2xl font-black text-center text-gray-900 mb-10">What Makes DropShop Different</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4 p-5 bg-gray-50 rounded-2xl">
              <span className="text-2xl flex-none">{f.icon}</span>
              <div>
                <p className="font-bold text-gray-900 text-sm mb-1">{f.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 bg-gray-50">
        <h2 className="text-2xl font-black text-center text-gray-900 mb-10">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="bg-white rounded-2xl p-5 shadow-sm group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                {faq.q}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-bg px-6 py-14 text-center">
        <h2 className="text-2xl font-black text-white mb-3">Ready to Win?</h2>
        <p className="text-white/80 text-sm mb-6">Join thousands of shoppers already saving big on DropShop.</p>
        <Link href="/signup" className="inline-block px-10 py-4 rounded-2xl bg-white text-periwinkle font-bold text-base shadow-md hover:shadow-lg transition-shadow">
          Create Free Account
        </Link>
      </section>
    </div>
  )
}
