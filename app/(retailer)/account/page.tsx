import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { formatCentsDecimal } from '@/lib/format'
import { Wallet } from 'lucide-react'

export default async function AccountPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: store } = await supabase.from('stores').select('*').eq('owner_id', user.id).single()
  if (!store) redirect('/signup/retailer')

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-2xl font-bold text-gray-900">Account</h2>

      {/* Balance card */}
      <div className="bg-brand-gradient rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Wallet size={24} />
          <p className="font-semibold">Account Balance</p>
        </div>
        <p className="text-4xl font-bold">{formatCentsDecimal(store.balance_cents)}</p>
        <p className="text-white/70 text-sm mt-1">Available to withdraw</p>
      </div>

      {/* Store info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-800">Store Info</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Store Name</span>
            <span className="font-medium text-gray-900">{store.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Address</span>
            <span className="font-medium text-gray-900 text-right max-w-[60%]">{store.address ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phone</span>
            <span className="font-medium text-gray-900">{store.phone ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Account</span>
            <span className="font-medium text-gray-900">{user.email}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">Payout & withdrawal options coming soon.</p>
    </div>
  )
}
