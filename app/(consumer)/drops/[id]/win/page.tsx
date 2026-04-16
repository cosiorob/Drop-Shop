import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getDropById } from '@/lib/drops'
import { createClient } from '@/lib/supabase-server'
import { formatCents } from '@/lib/format'

export default async function WinPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const drop = await getDropById(params.id)
  if (!drop) notFound()

  // Only the winner can see this page
  if (drop.winner_id !== user.id) redirect(`/drops/${params.id}`)

  const image = drop.drop_images?.[0]?.url ?? null
  const shareText = encodeURIComponent(`I just won a ${drop.title} on DROPSHOP! 🎉 Take a bet on retail → dropshop.com`)

  return (
    <div className="min-h-screen bg-brand-gradient flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        {/* Close */}
        <div className="flex justify-end mb-2">
          <Link href="/feed" className="text-gray-400 text-sm">Close</Link>
        </div>

        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-2xl font-bold text-gray-900 leading-tight">
            Congratulations!<br />You are the winner of…
          </p>
        </div>

        {/* Product image */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
          {image ? (
            <Image src={image} alt={drop.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🏆</div>
          )}
        </div>

        {/* Product info */}
        <p className="text-2xl font-bold text-periwinkle mb-1">{formatCents(drop.retail_value_cents)}</p>
        <p className="text-lg font-semibold text-gray-900 mb-1">{drop.title}</p>

        {/* Pickup details */}
        {drop.pickup_address && (
          <div className="mt-3 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">Details</p>
            <p className="text-sm text-gray-600">
              Please visit our {drop.pickup_name ?? drop.store?.name} store at the following address to claim your prize:
            </p>
            <p className="text-sm font-medium text-gray-800 mt-1">{drop.pickup_address}</p>
            {drop.pickup_phone && (
              <p className="text-sm text-gray-500 mt-0.5">{drop.pickup_phone}</p>
            )}
          </div>
        )}

        {/* Share */}
        <p className="text-sm font-semibold text-gray-700 mb-3">Show off your win!</p>
        <div className="flex gap-3 mb-5">
          <a
            href={`https://www.instagram.com/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white font-semibold text-sm"
          >
            Instagram
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-black text-white font-semibold text-sm"
          >
            X
          </a>
          <a
            href={`https://www.tiktok.com/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-black text-white font-semibold text-sm"
          >
            TikTok
          </a>
        </div>

        {/* CTA */}
        <Link
          href="/feed"
          className="block w-full text-center py-4 rounded-2xl bg-brand-gradient text-white font-bold"
        >
          Browse Upcoming Drops
        </Link>
      </div>
    </div>
  )
}
