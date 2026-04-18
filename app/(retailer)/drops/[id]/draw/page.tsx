import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { SpinningWheel } from '@/components/drops/SpinningWheel'

function admin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function DrawPage({ params }: { params: { id: string } }) {
  const { data: drop } = await admin()
    .from('drops')
    .select('id, title, total_spots, spots_claimed, status, winner_id, drop_images(url, position)')
    .eq('id', params.id)
    .single()
  if (!drop) notFound()

  const { data: entries } = await admin()
    .from('entries')
    .select('user_id, created_at')
    .eq('drop_id', params.id)
    .order('created_at', { ascending: true })

  const userIds = (entries ?? []).map((e: { user_id: string }) => e.user_id)
  const { data: profiles } = userIds.length > 0
    ? await admin().from('profiles').select('id, display_name').in('id', userIds)
    : { data: [] }

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p: { id: string; display_name: string | null }) => [p.id, p.display_name])
  )

  const spots = (entries ?? []).map((entry: { user_id: string }, i: number) => ({
    spotNumber: i + 1,
    userId: entry.user_id,
    displayName: profileMap[entry.user_id] ?? 'Anonymous',
  }))

  const images = (drop.drop_images ?? []).sort(
    (a: { position: number }, b: { position: number }) => a.position - b.position
  )

  return (
    <div className="max-w-sm mx-auto pb-10">
      <div className="mb-4">
        <Link href="/dashboard" className="inline-flex items-center text-gray-500 text-sm gap-1">
          <ChevronLeft size={18} /> Dashboard
        </Link>
      </div>

      {/* Drop header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-none">
          {images[0]?.url ? (
            <Image src={images[0].url} alt={drop.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
          )}
        </div>
        <div>
          <h1 className="font-bold text-gray-900 text-base leading-tight">{drop.title}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {drop.spots_claimed} / {drop.total_spots} spots claimed
          </p>
        </div>
      </div>

      <SpinningWheel
        dropId={drop.id}
        totalSpots={drop.total_spots}
        spots={spots}
        existingWinnerId={drop.winner_id}
      />
    </div>
  )
}
