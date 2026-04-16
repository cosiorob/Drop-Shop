'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RetailerSignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    storeName: '',
    storeAddress: '',
    storePhone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Sign up failed')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      role: 'retailer',
      display_name: form.name,
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    const { error: storeError } = await supabase.from('stores').insert({
      owner_id: data.user.id,
      name: form.storeName,
      address: form.storeAddress,
      phone: form.storePhone,
    })

    if (storeError) {
      setError(storeError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/signup" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Retailer Account</h2>
      <p className="text-gray-500 text-sm mb-6">Set up your store on DROPSHOP</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Info</p>
        {[
          { label: 'Name', field: 'name', type: 'text', placeholder: 'Your name' },
          { label: 'Email', field: 'email', type: 'email', placeholder: 'you@store.com' },
          { label: 'Password', field: 'password', type: 'password', placeholder: 'Min. 6 characters' },
        ].map(({ label, field, type, placeholder }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              required
              minLength={field === 'password' ? 6 : undefined}
              value={form[field as keyof typeof form]}
              onChange={(e) => set(field, e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mint"
              placeholder={placeholder}
            />
          </div>
        ))}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Store Info</p>
        {[
          { label: 'Store Name', field: 'storeName', type: 'text', placeholder: 'e.g. Edwin Watts Golf' },
          { label: 'Address', field: 'storeAddress', type: 'text', placeholder: '123 Main St, City, FL' },
          { label: 'Phone', field: 'storePhone', type: 'tel', placeholder: '(555) 000-0000' },
        ].map(({ label, field, type, placeholder }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              required
              value={form[field as keyof typeof form]}
              onChange={(e) => set(field, e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mint"
              placeholder={placeholder}
            />
          </div>
        ))}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-gradient text-white font-semibold py-3 rounded-xl disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create Retailer Account'}
        </button>
      </form>
    </>
  )
}
