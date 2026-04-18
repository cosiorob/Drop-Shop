import Link from 'next/link'
import { Home, Search, User } from 'lucide-react'

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto relative">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-brand-gradient bg-clip-text text-transparent">
          DROPSHOP
        </h1>
        <div className="flex items-center gap-4">
          <Link href="/how-it-works" className="text-xs font-medium text-gray-400 hover:text-periwinkle transition-colors">
            How It Works
          </Link>
          <Link href="/profile" className="text-gray-500 hover:text-gray-700">
            <User size={22} />
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-100 flex z-10">
        <Link href="/feed" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 hover:text-periwinkle">
          <Home size={20} />
          <span className="text-xs">Feed</span>
        </Link>
        <Link href="/search" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 hover:text-periwinkle">
          <Search size={20} />
          <span className="text-xs">Search</span>
        </Link>
        <Link href="/profile" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 hover:text-periwinkle">
          <User size={20} />
          <span className="text-xs">Profile</span>
        </Link>
      </nav>
    </div>
  )
}
