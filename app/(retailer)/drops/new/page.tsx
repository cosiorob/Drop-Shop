import { createClient } from '@/lib/supabase-server'
import { DropForm } from '@/components/retailer/DropForm'
import { getUserOrRetailer, getStoreOrFirst } from '@/lib/dev-auth'

export default async function NewDropPage() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const user = await getUserOrRetailer(authUser)
  if (!user) return <p className="p-8 text-gray-500">Run /api/seed?secret=dropshop-seed first.</p>

  const store = await getStoreOrFirst(user.id)
  if (!store) return <p className="p-8 text-gray-500">No store found.</p>

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
