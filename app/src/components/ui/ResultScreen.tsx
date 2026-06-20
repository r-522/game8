'use client'
import { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { createClient } from '@/lib/supabase/client'

export default function ResultScreen() {
  const { phase, battle, player, setPhase, addDachi, changeOtokogi } = useGameStore()
  const [showDachiPrompt, setShowDachiPrompt] = useState(false)
  const [dachiDone, setDachiDone] = useState(false)
  const [expAnim, setExpAnim] = useState(0)
  const [saved, setSaved] = useState(false)

  const enemy = battle.enemy
  const isWin = enemy && enemy.hp <= 0

  useEffect(() => {
    if (phase !== 'result') return
    setShowDachiPrompt(false)
    setDachiDone(false)
    setSaved(false)

    // EXP演出
    setExpAnim(0)
    const target = isWin ? (Math.floor((enemy?.maxHp ?? 100) / 2) + 50) : 0
    let current = 0
    const step = Math.ceil(target / 20)
    const interval = setInterval(() => {
      current = Math.min(target, current + step)
      setExpAnim(current)
      if (current >= target) clearInterval(interval)
    }, 50)

    // 勝利の場合、ダチプロンプト
    if (isWin && !enemy?.isBoss) {
      setTimeout(() => setShowDachiPrompt(true), 1500)
    }

    // Supabaseに戦闘記録保存
    saveBattleRecord()

    return () => clearInterval(interval)
  }, [phase])

  async function saveBattleRecord() {
    if (!enemy) return
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('kenka_battle_records').insert({
        player_id: user.id,
        enemy_id: enemy.id,
        result: isWin ? 'win' : 'lose',
        otokogi_delta: isWin ? 5 : -2,
        exp_gained: isWin ? expAnim : 0,
      })
      setSaved(true)
    } catch {}
  }

  function handleDachi() {
    if (!enemy) return
    addDachi({
      id: `dachi_${enemy.id}_${Date.now()}`,
      characterId: enemy.id,
      name: enemy.name,
      faction: enemy.faction,
      skill: 'basic',
      befriendedAt: new Date().toISOString(),
    })
    changeOtokogi(10) // ダチると男気増加
    setDachiDone(true)
    setShowDachiPrompt(false)
  }

  function handleContinue() {
    setPhase('field')
  }

  if (phase !== 'result') return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 180,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* 結果タイトル */}
      <div style={{
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: isWin ? 80 : 64,
        fontWeight: 900,
        color: isWin ? '#c8a84b' : '#cc2200',
        textShadow: isWin
          ? '3px 3px 0 #000, 0 0 60px rgba(200,168,75,0.4)'
          : '3px 3px 0 #000, 0 0 40px rgba(200,0,0,0.4)',
        letterSpacing: '0.1em',
        animation: 'punch-in 0.2s ease-out',
        marginBottom: 8,
      }}>
        {isWin ? '勝利！！' : '敗北…'}
      </div>

      {/* 相手名 */}
      {enemy && (
        <div style={{
          fontFamily: 'var(--font-kenka, serif)',
          fontSize: 18,
          color: '#888',
          letterSpacing: '0.2em',
          marginBottom: 40,
          textShadow: '1px 1px 0 #000',
        }}>
          vs {enemy.name}
        </div>
      )}

      {/* 結果パネル */}
      <div style={{
        background: 'rgba(15,12,10,0.95)',
        border: '1px solid rgba(200,168,75,0.35)',
        borderTop: '2px solid rgba(200,168,75,0.5)',
        padding: '28px 48px',
        minWidth: 400,
        marginBottom: 32,
      }}>
        {isWin && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-kenka)', fontSize: 16, color: '#888', letterSpacing: '0.15em' }}>喧嘩魂（EXP）</span>
              <span style={{ fontFamily: 'var(--font-kenka)', fontSize: 20, color: '#ffdd44', fontWeight: 900, textShadow: '1px 1px 0 #000' }}>
                +{expAnim}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-kenka)', fontSize: 16, color: '#888', letterSpacing: '0.15em' }}>男気</span>
              <span style={{ fontFamily: 'var(--font-kenka)', fontSize: 18, color: '#c8a84b' }}>+5</span>
            </div>
            {battle.maxCombo >= 10 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-kenka)', fontSize: 14, color: '#666', letterSpacing: '0.1em' }}>最大コンボ</span>
                <span style={{ fontFamily: 'var(--font-kenka)', fontSize: 16, color: '#ffdd44' }}>{battle.maxCombo}コンボ！</span>
              </div>
            )}
          </>
        )}
        {!isWin && (
          <div style={{ fontFamily: 'var(--font-kenka)', fontSize: 18, color: '#888', textAlign: 'center', letterSpacing: '0.2em' }}>
            まだ負けてられるか…
          </div>
        )}
      </div>

      {/* ダチるプロンプト */}
      {showDachiPrompt && !dachiDone && (
        <div style={{
          background: 'rgba(15,12,10,0.95)',
          border: '2px solid #c8a84b',
          padding: '20px 36px',
          marginBottom: 24,
          textAlign: 'center',
          animation: 'slide-up 0.3s ease-out',
        }}>
          <div style={{
            fontFamily: 'var(--font-kenka, serif)',
            fontSize: 16,
            color: '#c8a84b',
            marginBottom: 16,
            letterSpacing: '0.1em',
          }}>
            {enemy?.name}が降参した。<br />手を差し伸べるか？
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button onClick={handleDachi} style={{
              fontFamily: 'var(--font-kenka)', fontSize: 16, fontWeight: 900,
              background: 'linear-gradient(180deg, rgba(139,26,26,0.9), rgba(80,10,5,0.95))',
              border: '2px solid #c8a84b',
              color: '#fff', padding: '10px 28px', cursor: 'pointer', letterSpacing: '0.15em',
            }}>
              ダチになる（男気+10）
            </button>
            <button onClick={() => setShowDachiPrompt(false)} style={{
              fontFamily: 'var(--font-kenka)', fontSize: 14,
              background: 'rgba(20,15,10,0.9)',
              border: '1px solid #444', color: '#888', padding: '10px 20px', cursor: 'pointer',
            }}>
              見逃す
            </button>
          </div>
        </div>
      )}

      {dachiDone && (
        <div style={{
          fontFamily: 'var(--font-kenka, serif)',
          fontSize: 20,
          color: '#44ff88',
          marginBottom: 24,
          textShadow: '0 0 12px rgba(68,255,136,0.5)',
          animation: 'flash-in 0.2s ease-out',
          letterSpacing: '0.15em',
        }}>
          ダチになった！
        </div>
      )}

      {/* 続けるボタン */}
      <button
        onClick={handleContinue}
        style={{
          fontFamily: 'var(--font-kenka, serif)',
          fontSize: 20,
          fontWeight: 900,
          background: 'linear-gradient(180deg, rgba(40,30,20,0.95), rgba(20,15,10,0.98))',
          border: '2px solid rgba(200,168,75,0.6)',
          color: '#c8a84b',
          padding: '14px 56px',
          cursor: 'pointer',
          letterSpacing: '0.25em',
          textShadow: '1px 1px 0 #000',
          transition: 'all 0.15s',
        }}
      >
        フィールドへ戻る [Enter]
      </button>

      {saved && (
        <div style={{ marginTop: 12, fontFamily: 'var(--font-gothic)', fontSize: 10, color: '#444' }}>
          ■ 戦闘記録を保存しました
        </div>
      )}
    </div>
  )
}
