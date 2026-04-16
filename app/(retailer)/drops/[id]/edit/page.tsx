import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { DropForm } from '@/components/retailer/DropForm'

export default async function EditDropPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: store } = await supabase.from('stores').select('*').eq('owner_id', user.id).single()
  if (!store) redirect('/signup/retailer')

  const { data: drop } = await supabase.from('drops').select('*').eq('id', params.id).eq('store_id', store.id).single()
  if (!drop) notFound()

  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Drop</h2>
        <p className="text-sm text-gray-400 mt-1">{drop.title}</p>
      </div>
      <DropForm
        storeId={store.id}
        categories={categories ?? []}
        dropId={drop.id}
        initialData={{
          title: drop.title,
          category_id: drop.category_id,
          closes_at: drop.closes_at?.slice(0, 16),
          retail_value: String(drop.retail_value_cents / 100),
          price_per_spot: String(drop.price_per_spot_cents / 100),
          total_spots: String(drop.total_spots),
          size: drop.size ?? '',
          description: drop.description ?? '',
          pickup_name: drop.pickup_name ?? '',
          pickup_address: drop.pickup_address ?? '',
          pickup_phone: drop.pickup_phone ?? '',
        }}
      />
    </div>
  )
}
