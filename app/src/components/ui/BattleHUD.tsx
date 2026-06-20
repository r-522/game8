'use client'
import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/store/gameStore'

function GaugeBar({ value, max, type, label }: { value: number; max: number; type: 'hp' | 'sp' | 'buchikire'; label: string }) {
  const pct = Math.max(0, Math.min(1, value / max))
  const colors = {
    hp: { fill: pct > 0.5 ? '#cc2200' : pct > 0.25 ? '#ff8800' : '#ff0000', bg: '#1a0a0a', label: '#ff8888' },
    sp: { fill: '#2266cc', bg: '#0a0a1a', label: '#88aaff' },
    buchikire: { fill: '#ff6600', bg: '#1a0a00', label: '#ffaa44' },
  }
  const c = colors[type]

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 10,
        color: c.label,
        marginBottom: 2,
        letterSpacing: '0.15em',
        textShadow: '1px 1px 0 #000',
      }}>
        {label} {type === 'hp' ? (value <= 0 ? '——!' : `${value}/${max}`) : ''}
      </div>
      <div style={{
        width: 180,
        height: 14,
        background: c.bg,
        border: '1px solid #444',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: `${pct * 100}%`,
          background: `linear-gradient(90deg, ${c.fill}88, ${c.fill})`,
          transition: 'width 0.15s ease-out',
        }} />
        {/* ゲージの縦スジ */}
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i + 1) * 10}%`,
            top: 0, bottom: 0,
            width: 1,
            background: 'rgba(0,0,0,0.3)',
          }} />
        ))}
        {/* ハイライト */}
        <div style={{
          position: 'absolute',
          inset: '0 0 50% 0',
          background: 'rgba(255,255,255,0.08)',
        }} />
      </div>
    </div>
  )
}

function ComboCounter({ combo }: { combo: number }) {
  if (combo < 2) return null
  const isLarge = combo >= 10

  return (
    <div style={{
      position: 'absolute',
      right: 32,
      top: '50%',
      transform: 'translateY(-50%)',
      textAlign: 'right',
      pointerEvents: 'none',
    }}>
      <div style={{
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: isLarge ? 64 : 48,
        fontWeight: 900,
        color: isLarge ? '#ffdd44' : '#ffffff',
        textShadow: isLarge
          ? '0 0 30px rgba(255,200,0,0.8), 3px 3px 0 #cc6600, -2px -2px 0 #000'
          : '2px 2px 0 #000, -1px -1px 0 #000',
        lineHeight: 1,
        animation: 'combo-flash 0.1s ease-out',
        letterSpacing: '-0.02em',
      }}>
        {combo}
      </div>
      <div style={{
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 14,
        color: isLarge ? '#ffdd44' : '#aaa',
        letterSpacing: '0.2em',
        textShadow: '1px 1px 0 #000',
      }}>
        {isLarge ? '乗り気！！' : 'コンボ'}
      </div>
      {isLarge && (
        <div style={{
          position: 'absolute',
          inset: '-20px -20px -20px -20px',
          background: 'radial-gradient(ellipse, rgba(255,200,0,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'buchikire-pulse 0.5s ease-in-out infinite',
        }} />
      )}
    </div>
  )
}

function EnemyHPPanel() {
  const { battle } = useGameStore()
  const enemy = battle.enemy
  if (!enemy) return null

  const pct = Math.max(0, Math.min(1, enemy.hp / (enemy.maxHp || 100)))

  return (
    <div style={{
      position: 'absolute',
      top: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      minWidth: 300,
    }}>
      {/* 敵名 */}
      <div style={{
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 16,
        fontWeight: 900,
        color: '#ff8888',
        textAlign: 'center',
        marginBottom: 6,
        letterSpacing: '0.15em',
        textShadow: '2px 2px 0 #000',
      }}>
        {enemy.name}
        {enemy.isBoss && <span style={{ fontSize: 11, marginLeft: 8, color: '#c8a84b' }}>【BOSS】</span>}
      </div>
      {/* 敵HPバー */}
      <div style={{
        width: '100%',
        height: 18,
        background: '#1a0a0a',
        border: '2px solid #8b1a1a',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: `${pct * 100}%`,
          background: pct > 0.5
            ? 'linear-gradient(90deg, #991100, #cc2200)'
            : pct > 0.25
              ? 'linear-gradient(90deg, #cc6600, #ff8800)'
              : 'linear-gradient(90deg, #ff0000, #ff4400)',
          transition: 'width 0.2s ease-out',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-kenka, serif)',
          fontSize: 10,
          color: '#fff',
          textShadow: '1px 1px 0 #000',
          letterSpacing: '0.1em',
          fontWeight: 900,
        }}>
          {enemy.hp} / {enemy.maxHp}
        </div>
      </div>
    </div>
  )
}

function BuchikireMeter({ fill, active }: { fill: number; active: boolean }) {
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 9,
        color: active ? '#ff6600' : '#885522',
        letterSpacing: '0.15em',
        marginBottom: 2,
        textShadow: active ? '0 0 8px #ff6600' : '1px 1px 0 #000',
      }}>
        ブチギレ {active ? '【発動中！！】' : ''}
      </div>
      <div style={{
        width: 180,
        height: 8,
        background: '#1a0a00',
        border: '1px solid #553311',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: `${fill}%`,
          background: active
            ? 'linear-gradient(90deg, #ff6600, #ffaa00)'
            : 'linear-gradient(90deg, #884400, #cc6600)',
          animation: active ? 'buchikire-pulse 0.3s ease-in-out infinite' : 'none',
          transition: 'width 0.2s',
        }} />
      </div>
    </div>
  )
}

function DamageNumbers() {
  const { battle } = useGameStore()
  const [numbers, setNumbers] = useState<Array<{
    id: number; value: number; x: number; y: number; type: string
  }>>([])
  const nextId = useRef(0)

  useEffect(() => {
    const effects = battle.hitEffects
    if (effects.length === 0) return

    const latest = effects[effects.length - 1]
    const newNum = {
      id: nextId.current++,
      value: latest.damage,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50 + (Math.random() - 0.5) * 20,
      type: latest.type,
    }
    setNumbers(prev => [...prev.slice(-8), newNum])
    setTimeout(() => {
      setNumbers(prev => prev.filter(n => n.id !== newNum.id))
    }, 1000)
  }, [battle.hitEffects])

  return (
    <>
      {numbers.map(n => (
        <div key={n.id} className={`damage-number ${n.type}`} style={{
          left: `${n.x}%`, top: `${n.y}%`,
          transform: 'translate(-50%, -50%)',
        }}>
          {n.value}
        </div>
      ))}
    </>
  )
}

export default function BattleHUD() {
  const { player, battle, phase } = useGameStore()

  if (phase !== 'battle') return null

  return (
    <div className="hud-overlay" style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
      {/* プレイヤーステータス（左下） */}
      <div style={{
        position: 'absolute',
        left: 24,
        bottom: 32,
        background: 'rgba(10,10,10,0.88)',
        border: '1px solid rgba(200,168,75,0.3)',
        borderTop: '2px solid rgba(200,168,75,0.5)',
        padding: '14px 18px',
        minWidth: 220,
      }}>
        {/* プレイヤー名 */}
        <div style={{
          fontFamily: 'var(--font-kenka, serif)',
          fontSize: 14,
          color: '#c8a84b',
          marginBottom: 10,
          letterSpacing: '0.2em',
          textShadow: '1px 1px 0 #000',
          borderBottom: '1px solid rgba(200,168,75,0.2)',
          paddingBottom: 6,
        }}>
          神威 蒼太
        </div>

        <GaugeBar value={player.hp} max={player.maxHp} type="hp" label="体力" />
        <GaugeBar value={player.sp} max={player.maxSp} type="sp" label="気合" />
        <BuchikireMeter fill={battle.buchikireFill} active={battle.buchikireModeActive} />
      </div>

      {/* 敵ステータス（上中央） */}
      <EnemyHPPanel />

      {/* コンボカウンター（右中央） */}
      <ComboCounter combo={battle.combo} />

      {/* ダメージ数字 */}
      <DamageNumbers />

      {/* 操作ガイド（右下） */}
      <div style={{
        position: 'absolute',
        right: 24,
        bottom: 32,
        background: 'rgba(10,10,10,0.7)',
        border: '1px solid #333',
        padding: '10px 14px',
        fontFamily: 'var(--font-gothic, sans-serif)',
        fontSize: 11,
        color: '#888',
        lineHeight: 1.8,
      }}>
        <div style={{ color: '#c8a84b', marginBottom: 4, fontFamily: 'var(--font-kenka)', fontSize: 11 }}>喧嘩バトル</div>
        <div>[J] 弱攻撃　[K] 強攻撃</div>
        <div>[L] ガード　[Space] 回避</div>
        <div>[U] 超気合技　[I] 掴み</div>
      </div>

      {/* ブチギレモード演出 */}
      {battle.buchikireModeActive && (
        <div style={{
          position: 'fixed',
          inset: 0,
          border: '4px solid #ff6600',
          boxShadow: 'inset 0 0 40px rgba(255,100,0,0.3)',
          pointerEvents: 'none',
          animation: 'buchikire-pulse 0.3s ease-in-out infinite',
        }} />
      )}
    </div>
  )
}
