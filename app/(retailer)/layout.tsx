import Link from 'next/link'
import { LayoutDashboard, PlusCircle, Wallet, Settings } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/drops/new', label: 'New Drop', icon: PlusCircle },
  { href: '/account', label: 'Balance', icon: Wallet },
  { href: '/account', label: 'Settings', icon: Settings },
]

export default function RetailerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-brand-gradient bg-clip-text text-transparent">DROPSHOP</h1>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Retailer</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto flex min-h-[calc(100vh-57px)]">
        {/* Sidebar — hidden on mobile */}
        <aside className="hidden md:flex w-52 flex-col border-r border-gray-100 bg-white py-6 px-3">
          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-10">
        {navItems.slice(0, 3).map(({ href, label, icon: Icon }) => (
          <Link key={label} href={href} className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 hover:text-periwinkle">
            <Icon size={20} />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
