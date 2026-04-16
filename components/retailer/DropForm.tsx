'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/types'

interface DropFormProps {
  storeId: string
  categories: Category[]
  initialData?: Partial<DropFormData>
  dropId?: string
}

interface DropFormData {
  title: string
  category_id: string
  closes_at: string
  retail_value: string
  price_per_spot: string
  total_spots: string
  size: string
  description: string
  pickup_name: string
  pickup_address: string
  pickup_phone: string
}

export function DropForm({ storeId, categories, initialData, dropId }: DropFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<DropFormData>({
    title: initialData?.title ?? '',
    category_id: initialData?.category_id ?? '',
    closes_at: initialData?.closes_at ?? '',
    retail_value: initialData?.retail_value ?? '',
    price_per_spot: initialData?.price_per_spot ?? '',
    total_spots: initialData?.total_spots ?? '',
    size: initialData?.size ?? '',
    description: initialData?.description ?? '',
    pickup_name: initialData?.pickup_name ?? '',
    pickup_address: initialData?.pickup_address ?? '',
    pickup_phone: initialData?.pickup_phone ?? '',
  })
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof DropFormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)

    for (const file of files.slice(0, 5 - imageUrls.length)) {
      const ext = file.name.split('.').pop()
      const path = `drops/${storeId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('drop-images').upload(path, file, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('drop-images').getPublicUrl(path)
        setImageUrls((prev) => [...prev, data.publicUrl])
      }
    }
    setUploading(false)
  }

  async function handleSubmit(status: 'draft' | 'active') {
    setSaving(true)
    setError('')

    const payload = {
      store_id: storeId,
      category_id: form.category_id,
      title: form.title,
      description: form.description,
      size: form.size,
      retail_value_cents: Math.round(parseFloat(form.retail_value) * 100),
      price_per_spot_cents: Math.round(parseFloat(form.price_per_spot) * 100),
      total_spots: parseInt(form.total_spots),
      closes_at: new Date(form.closes_at).toISOString(),
      status,
      pickup_name: form.pickup_name,
      pickup_address: form.pickup_address,
      pickup_phone: form.pickup_phone,
    }

    let dropResult: { id: string }
    if (dropId) {
      const { data, error } = await supabase.from('drops').update(payload).eq('id', dropId).select().single()
      if (error) { setError(error.message); setSaving(false); return }
      dropResult = data
    } else {
      const { data, error } = await supabase.from('drops').insert(payload).select().single()
      if (error) { setError(error.message); setSaving(false); return }
      dropResult = data
    }

    // Save images
    if (imageUrls.length > 0) {
      await supabase.from('drop_images').insert(
        imageUrls.map((url, i) => ({ drop_id: dropResult.id, url, position: i }))
      )
    }

    router.push('/dashboard')
  }

  const inputClass = 'w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-periwinkle bg-white'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Drop Details */}
      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-800">Drop Details</h3>
        <div>
          <label className={labelClass}>Product Name</label>
          <input type="text" className={inputClass} placeholder="e.g. Taylormade Qi10 Driver" value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category</label>
            <select className={inputClass} value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Drop Date & Time</label>
            <input type="datetime-local" className={inputClass} value={form.closes_at} onChange={(e) => set('closes_at', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Retail Value ($)</label>
            <input type="number" min="0" step="0.01" className={inputClass} placeholder="400" value={form.retail_value} onChange={(e) => set('retail_value', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Price / Spot ($)</label>
            <input type="number" min="0" step="0.01" className={inputClass} placeholder="40" value={form.price_per_spot} onChange={(e) => set('price_per_spot', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Number of Spots</label>
            <input type="number" min="1" className={inputClass} placeholder="10" value={form.total_spots} onChange={(e) => set('total_spots', e.target.value)} />
          </div>
        </div>
      </section>

      {/* Product Description */}
      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-800">Product Description</h3>
        <div>
          <label className={labelClass}>Size</label>
          <input type="text" className={inputClass} placeholder="e.g. Fixed at Any, M/L, One Size" value={form.size} onChange={(e) => set('size', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={4}
            maxLength={1500}
            placeholder="Max. 250 words"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length} / 1500</p>
        </div>
      </section>

      {/* Photos */}
      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-800">Photos</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-periwinkle transition-colors">
          <input type="file" accept="image/*" multiple className="hidden" id="img-upload" onChange={handleImageUpload} disabled={uploading || imageUrls.length >= 5} />
          <label htmlFor="img-upload" className="cursor-pointer">
            <p className="text-periwinkle font-semibold text-sm">{uploading ? 'Uploading…' : 'Upload Photos'}</p>
            <p className="text-xs text-gray-400 mt-1">Up to 5 photos · JPG, PNG</p>
          </label>
        </div>
        {imageUrls.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                <Image src={url} alt="" fill className="object-cover" />
                <button
                  onClick={() => setImageUrls((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pickup Details */}
      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-800">Pick Up Details</h3>
        <div>
          <label className={labelClass}>Store Name</label>
          <input type="text" className={inputClass} placeholder="e.g. Edwin Watts Golf" value={form.pickup_name} onChange={(e) => set('pickup_name', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Address</label>
          <input type="text" className={inputClass} placeholder="20655 Lyons Rd, Boca Raton, FL 33434" value={form.pickup_address} onChange={(e) => set('pickup_address', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Phone Number</label>
          <input type="tel" className={inputClass} placeholder="(555) 000-0000" value={form.pickup_phone} onChange={(e) => set('pickup_phone', e.target.value)} />
        </div>
      </section>

      {/* Actions */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-3 pb-8">
        <button
          onClick={() => handleSubmit('draft')}
          disabled={saving}
          className="flex-1 border-2 border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-400 disabled:opacity-60"
        >
          Save Draft
        </button>
        <button
          onClick={() => handleSubmit('active')}
          disabled={saving}
          className="flex-1 bg-brand-gradient text-white font-semibold py-3 rounded-xl shadow-sm hover:opacity-90 disabled:opacity-60"
        >
          {saving ? 'Publishing…' : 'Submit Drop'}
        </button>
      </div>
    </div>
  )
}
