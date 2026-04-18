import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getDropById } from '@/lib/drops'
import { createClient } from '@/lib/supabase-server'
import { formatCents, formatSpots } from '@/lib/format'
import { Countdown } from '@/components/ui/Countdown'
import { SpotProgress } from '@/components/ui/SpotProgress'
import { ClaimButton } from '@/components/drops/ClaimButton'
import { Badge } from '@/components/ui/Badge'
import { ChevronLeft } from 'lucide-react'

export default async function DropDetailPage({ params }: { params: { id: string } }) {
  const drop = await getDropById(params.id)
  if (!drop) notFound()

  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const { getUserOrConsumer } = await import('@/lib/dev-auth')
  const user = await getUserOrConsumer(authUser)

  let userHasEntered = false
  if (user) {
    const { data } = await supabase
      .from('entries')
      .select('id')
      .eq('drop_id', drop.id)
      .eq('user_id', user.id)
      .single()
    userHasEntered = !!data
  }

  const images = drop.drop_images ?? []
  const remaining = drop.total_spots - drop.spots_claimed

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Back */}
      <div className="px-4 pt-4">
        <Link href="/feed" className="inline-flex items-center text-gray-500 text-sm gap-1">
          <ChevronLeft size={18} /> Back
        </Link>
      </div>

      {/* Image */}
      <div className="relative w-full aspect-square bg-gray-100 mt-2">
        {images.length > 0 ? (
          <Image src={images[0].url} alt={drop.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🎁</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-5 pb-8 space-y-4">
        {/* Store & status */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-periwinkle">{drop.store?.name}</p>
          <Badge status={drop.status} />
        </div>

        {/* Title & price */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{drop.title}</h1>
          <p className="text-2xl font-bold text-periwinkle mt-1">{formatCents(drop.price_per_spot_cents)}<span className="text-sm font-normal text-gray-400"> / spot</span></p>
          <p className="text-sm text-gray-400 mt-0.5">Retail value: {formatCents(drop.retail_value_cents)}</p>
        </div>

        {/* Countdown + spots */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Closes in</span>
            <Countdown closesAt={drop.closes_at} />
          </div>
          <SpotProgress claimed={drop.spots_claimed} total={drop.total_spots} />
          <p className="text-xs text-gray-400 text-center">{formatSpots(drop.spots_claimed, drop.total_spots)}</p>
        </div>

        {/* Description */}
        {drop.description && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Details</p>
            <p className="text-sm text-gray-600 leading-relaxed">{drop.description}</p>
          </div>
        )}

        {/* Size */}
        {drop.size && (
          <p className="text-sm text-gray-500">Size: <span className="font-medium text-gray-800">{drop.size}</span></p>
        )}

        {/* Claim */}
        {drop.status === 'active' && (
          <ClaimButton
            dropId={drop.id}
            pricePerSpotCents={drop.price_per_spot_cents}
            spotsRemaining={remaining}
            userHasEntered={userHasEntered}
            isAuthenticated={true}
          />
        )}
      </div>
    </div>
  )
}
