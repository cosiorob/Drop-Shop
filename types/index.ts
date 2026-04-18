export type UserRole = 'consumer' | 'retailer'

export type DropStatus = 'draft' | 'active' | 'closed' | 'completed'

export interface Profile {
  id: string
  role: UserRole
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Store {
  id: string
  owner_id: string
  name: string
  description: string | null
  logo_url: string | null
  address: string | null
  phone: string | null
  balance_cents: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

export interface DropImage {
  id: string
  drop_id: string
  url: string
  position: number
}

export interface Drop {
  id: string
  store_id: string
  category_id: string
  title: string
  description: string | null
  size: string | null
  retail_value_cents: number
  price_per_spot_cents: number
  total_spots: number
  spots_claimed: number
  closes_at: string
  status: DropStatus
  winner_id: string | null
  pickup_name: string | null
  pickup_address: string | null
  pickup_phone: string | null
  created_at: string
  // joined
  store?: Store
  category?: Category
  drop_images?: DropImage[]
}

export interface Entry {
  id: string
  drop_id: string
  user_id: string
  stripe_payment_intent_id: string | null
  spots_count: number
  selected_number: number | null
  created_at: string
}

export interface Follow {
  id: string
  user_id: string
  store_id: string | null
  category_id: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'win' | 'drop_closing_1hr' | 'drop_closing_10min'
  drop_id: string
  read_at: string | null
  created_at: string
  drop?: Drop
}
