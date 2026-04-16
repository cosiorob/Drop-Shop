import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-server'
import { getRetailerDrops } from '@/lib/drops'
import { formatCents } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { PlusCircle } from 'lucide-react'
import type { Drop } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: store } = await supabase.from('stores').select('*').eq('owner_id', user.id).single()
  if (!store) redirect('/signup/retailer')

  const drops: Drop[] = await getRetailerDrops(store.id)

  const upcoming = drops.filter((d) => d.status === 'active')
  const closed = drops.filter((d) => d.status === 'closed' || d.status === 'completed')
  const drafts = drops.filter((d) => d.status === 'draft')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{store.name}</h2>
          <p className="text-sm text-gray-400 mt-0.5">Retailer Dashboard</p>
        </div>
        <Link
          href="/drops/new"
          className="inline-flex items-center gap-2 bg-brand-gradient text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-sm hover:opacity-90"
        >
          <PlusCircle size={16} />
          New Drop
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Drops', value: upcoming.length, color: 'text-green-600' },
          { label: 'Total Drops', value: drops.length, color: 'text-periwinkle' },
          { label: 'Balance', value: formatCents(store.balance_cents), color: 'text-mint' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Drop lists */}
      {[
        { title: 'Upcoming Drops', items: upcoming },
        { title: 'Drafts', items: drafts },
        { title: 'Closed Drops', items: closed },
      ].map(({ title, items }) => (
        <section key={title}>
          <h3 className="text-base font-bold text-gray-800 mb-3">{title}</h3>
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center bg-white rounded-2xl">No {title.toLowerCase()}</p>
          ) : (
            <div className="space-y-2">
              {items.map((drop) => (
                <Link
                  key={drop.id}
                  href={`/drops/${drop.id}/edit`}
                  className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-none">
                    {drop.drop_images?.[0]?.url ? (
                      <Image src={drop.drop_images[0].url} alt={drop.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🎁</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{drop.title}</p>
                    <p className="text-xs text-gray-400">
                      {drop.spots_claimed}/{drop.total_spots} spots · {formatCents(drop.price_per_spot_cents)}/spot
                    </p>
                  </div>
                  <Badge status={drop.status} />
                </Link>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
