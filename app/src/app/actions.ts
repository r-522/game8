'use server'
import { createServiceClient } from '@/lib/supabase/server'

export async function submitRankingScore(
  playerId: string,
  displayName: string,
  mode: string,
  score: number,
  metadata: Record<string, unknown> = {}
) {
  // サーバーサイドでスコア検証してからDBに書き込む
  if (score < 0 || score > 999999999) {
    return { error: 'Invalid score' }
  }

  const supabase = createServiceClient()

  // 既存のスコアより高い場合のみ更新
  const { data: existing } = await supabase
    .from('kenka_rankings')
    .select('score')
    .eq('player_id', playerId)
    .eq('mode', mode)
    .order('score', { ascending: false })
    .limit(1)

  if (existing && existing.length > 0 && existing[0].score >= score) {
    return { success: false, message: '既存のスコアの方が高いです' }
  }

  const { error } = await supabase.from('kenka_rankings').insert({
    player_id: playerId,
    display_name: displayName,
    mode,
    score,
    metadata,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function getRankings(mode: string, limit = 20) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('kenka_rankings')
    .select('id, display_name, score, created_at')
    .eq('mode', mode)
    .order('score', { ascending: false })
    .limit(limit)

  if (error) return { error: error.message, data: [] }
  return { data: data ?? [] }
}

export async function savePlayerProgress(
  playerId: string,
  slotNo: number,
  stateJson: Record<string, unknown>
) {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('kenka_save_slots')
    .upsert({
      player_id: playerId,
      slot_no: slotNo,
      state_json: stateJson,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'player_id,slot_no' })

  if (error) return { error: error.message }
  return { success: true }
}

export async function unlockAchievement(playerId: string, achievementId: string) {
  const supabase = createServiceClient()

  const { data: existing } = await supabase
    .from('kenka_player_achievements')
    .select('id')
    .eq('player_id', playerId)
    .eq('achievement_id', achievementId)
    .single()

  if (existing) return { success: false, message: '既に達成済み' }

  const { error } = await supabase.from('kenka_player_achievements').insert({
    player_id: playerId,
    achievement_id: achievementId,
  })

  if (error) return { error: error.message }
  return { success: true }
}
