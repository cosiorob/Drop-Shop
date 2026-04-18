import { createClient } from '@supabase/supabase-js'

// Uses service role key — call only from trusted server contexts
export async function selectWinner(dropId: string): Promise<string | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: entries, error } = await supabase
    .from('entries')
    .select('user_id, spots_count')
    .eq('drop_id', dropId)

  if (error || !entries || entries.length === 0) return null

  // Build weighted pool: each entry appears spots_count times
  const pool: string[] = []
  for (const entry of entries) {
    const count = entry.spots_count ?? 1
    for (let i = 0; i < count; i++) pool.push(entry.user_id)
  }

  const winnerId = pool[Math.floor(Math.random() * pool.length)]

  await supabase
    .from('drops')
    .update({ winner_id: winnerId, status: 'completed' })
    .eq('id', dropId)

  await supabase.from('notifications').insert({
    user_id: winnerId,
    type: 'win',
    drop_id: dropId,
  })

  return winnerId
}
