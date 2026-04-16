import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { DropForm } from '@/components/retailer/DropForm'

export default async function NewDropPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: store } = await supabase.from('stores').select('*').eq('owner_id', user.id).single()
  if (!store) redirect('/signup/retailer')

  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">New Drop Listing</h2>
        <p className="text-sm text-gray-400 mt-1">You can make changes at any time after saving until the first spot is claimed.</p>
      </div>
      <DropForm storeId={store.id} categories={categories ?? []} />
    </div>
  )
}
