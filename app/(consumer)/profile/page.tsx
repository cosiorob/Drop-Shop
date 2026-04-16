import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-server'
import { formatCents } from '@/lib/format'
import { LogOut } from 'lucide-react'
import type { Drop } from '@/types'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: entries } = await supabase
    .from('entries')
    .select('*, drop:drops(*, drop_images(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 pt-6 pb-8 space-y-6">
      {/* Profile header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{profile?.display_name ?? 'Shopper'}</h2>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="text-gray-400 hover:text-gray-600">
            <LogOut size={20} />
          </button>
        </form>
      </div>

      {/* Entry history */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">My Entries</h3>
        {!entries || entries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">🎟️</div>
            <p className="text-sm">No entries yet — go claim a spot!</p>
            <Link href="/feed" className="mt-3 inline-block text-periwinkle font-medium text-sm">
              Browse Drops
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const drop = entry.drop as Drop | null
              if (!drop) return null
              return (
                <Link
                  key={entry.id}
                  href={`/drops/${drop.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm"
                >
                  <div className="relative w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-none">
                    {drop.drop_images?.[0]?.url ? (
                      <Image src={drop.drop_images[0].url} alt={drop.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{drop.title}</p>
                    <p className="text-xs text-periwinkle font-medium">{formatCents(drop.price_per_spot_cents)} / spot</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    drop.winner_id === user.id
                      ? 'bg-green-100 text-green-700'
                      : drop.status === 'active'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {drop.winner_id === user.id ? '🏆 Won' : drop.status === 'active' ? 'Entered' : 'Closed'}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
