import { createClient } from '@supabase/supabase-js'

// Uses service role key — call only from trusted server contexts
export async function selectWinner(dropId: string): Promise<string | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch all entries for this drop
  const { data: entries, error } = await supabase
    .from('entries')
    .select('user_id')
    .eq('drop_id', dropId)

  if (error || !entries || entries.length === 0) return null

  // Random pick
  const winner = entries[Math.floor(Math.random() * entries.length)]
  const winnerId = winner.user_id

  // Update drop: set winner, mark completed
  await supabase
    .from('drops')
    .update({ winner_id: winnerId, status: 'completed' })
    .eq('id', dropId)

  // Insert win notification
  await supabase.from('notifications').insert({
    user_id: winnerId,
    type: 'win',
    drop_id: dropId,
  })

  return winnerId
}
