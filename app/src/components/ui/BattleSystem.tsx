'use client'
import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/store/gameStore'

type AttackType = 'weak' | 'strong' | 'grab' | 'super' | 'dodge' | 'guard'

function CutinEffect({ characterName, skillName, onDone }: {
  characterName: string; skillName: string; onDone: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 250,
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* 集中線 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,200,0,0.2) 0deg 2deg, transparent 2deg 4deg)',
        animation: 'super-spin 0.4s linear infinite',
      }} />

      {/* フラッシュ */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#fff',
        animation: 'flash-out 0.4s ease-out forwards',
      }} />

      {/* キャラポートレート（仮：テキスト表示） */}
      <div style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: 'cutin-slide 0.15s ease-out',
        transform: 'skewX(-5deg)',
      }}>
        {/* 黒帯 */}
        <div style={{
          position: 'absolute',
          inset: '-40px -100px',
          background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.9), transparent)',
          transform: 'skewX(-10deg)',
        }} />

        <div style={{
          fontFamily: 'var(--font-kenka, serif)',
          fontSize: 20,
          color: '#c8a84b',
          letterSpacing: '0.3em',
          textShadow: '2px 2px 0 #000',
          marginBottom: 12,
          position: 'relative',
        }}>
          {characterName}
        </div>
        <div style={{
          fontFamily: 'var(--font-kenka, serif)',
          fontSize: 52,
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '0.1em',
          textShadow: '4px 4px 0 #cc2200, -2px -2px 0 #000, 0 0 40px rgba(255,100,0,0.6)',
          position: 'relative',
          animation: 'punch-in 0.15s ease-out',
        }}>
          {skillName}
        </div>
      </div>
    </div>
  )
}

function SuperMoveActivation() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 240,
      background: 'rgba(0,0,0,0.7)',
      animation: 'flash-in 0.1s ease-out',
      pointerEvents: 'none',
    }}>
      <div className="kb-super-lines" />
    </div>
  )
}

export default function BattleSystem() {
  const {
    phase, battle, player,
    dealDamageToEnemy, dealDamageToPlayer,
    addHitEffect, incrementCombo, resetCombo,
    fillBuchikire, activateBuchikireMode,
    endBattle, showCutin, hideCutin,
    triggerScreenShake, triggerHitStop,
    changeOtokogi,
  } = useGameStore()

  const [showCutinUI, setShowCutinUI] = useState(false)
  const [cutinData, setCutinData] = useState<{ name: string; skill: string } | null>(null)
  const [showSuperActivation, setShowSuperActivation] = useState(false)
  const comboResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attackCooldown = useRef(0)
  const guardActive = useRef(false)

  useEffect(() => {
    if (phase !== 'battle') return

    const handleKey = (e: KeyboardEvent) => {
      const now = Date.now()
      if (attackCooldown.current > now) return

      switch (e.code) {
        case 'KeyJ': performAttack('weak'); break
        case 'KeyK': performAttack('strong'); break
        case 'KeyI': performAttack('grab'); break
        case 'KeyU': performAttack('super'); break
        case 'KeyL': guardActive.current = true; break
        case 'Space': performAttack('dodge'); break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyL') guardActive.current = false
    }

    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleKeyUp)
    return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKeyUp) }
  }, [phase, battle])

  // 敵AIの攻撃（タイマー）
  useEffect(() => {
    if (phase !== 'battle') return
    const enemy = battle.enemy
    if (!enemy || enemy.hp <= 0) return

    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        enemyAttack()
      }
    }, 2000 + Math.random() * 1500)

    return () => clearInterval(interval)
  }, [phase, battle.enemy?.hp])

  // ゲーム終了チェック
  useEffect(() => {
    if (phase !== 'battle') return
    const enemy = battle.enemy
    if (enemy && enemy.hp <= 0) {
      setTimeout(() => endBattle('win'), 1000)
    }
    if (player.hp <= 0) {
      setTimeout(() => endBattle('lose'), 1000)
    }
  }, [battle.enemy?.hp, player.hp])

  function performAttack(type: AttackType) {
    const enemy = battle.enemy
    if (!enemy || enemy.hp <= 0) return

    attackCooldown.current = Date.now() + (type === 'super' ? 1500 : type === 'strong' ? 600 : 350)

    if (type === 'dodge') {
      // 回避：ダメージなし
      incrementCombo()
      resetComboTimer()
      return
    }

    if (type === 'super') {
      if (player.sp < 50) return
      triggerSuperMove()
      return
    }

    const baseDmg: Record<string, number> = { weak: player.atk * 0.8, strong: player.atk * 2.0, grab: player.atk * 1.5 }
    const dmg = Math.floor((baseDmg[type] ?? player.atk) * (1 + battle.combo * 0.05))

    dealDamageToEnemy(dmg)
    addHitEffect({ position: [0, 1.2, -3.5], type: type === 'strong' ? 'strong' : 'weak', damage: dmg, timestamp: Date.now() })
    incrementCombo()
    resetComboTimer()

    if (type === 'strong') {
      triggerHitStop(8)
      triggerScreenShake(2)
    } else {
      triggerHitStop(4)
      triggerScreenShake(1)
    }

    // ブチギレゲージ増加（攻撃でも少し増える）
    fillBuchikire(3)

    // 男気：正規の攻撃で少し上昇
    changeOtokogi(1)
  }

  function triggerSuperMove() {
    setShowSuperActivation(true)
    setTimeout(() => setShowSuperActivation(false), 500)

    setCutinData({ name: '神威 蒼太', skill: '神威の一迅' })
    setShowCutinUI(true)

    // ダメージは演出後
    setTimeout(() => {
      const dmg = Math.floor(player.atk * 5.0)
      dealDamageToEnemy(dmg)
      addHitEffect({ position: [0, 1.5, -3.5], type: 'super', damage: dmg, timestamp: Date.now() })
      triggerHitStop(16)
      triggerScreenShake(3)
    }, 1800)
  }

  function enemyAttack() {
    const enemy = battle.enemy
    if (!enemy || enemy.hp <= 0 || player.hp <= 0) return

    if (guardActive.current) {
      // ガード：ダメージ半減
      const dmg = Math.floor(enemy.atk * 0.2)
      dealDamageToPlayer(dmg)
      addHitEffect({ position: [0, 1.2, 0.5], type: 'guard', damage: dmg, timestamp: Date.now() })
      triggerScreenShake(1)
      return
    }

    const dmg = Math.floor(enemy.atk * (0.8 + Math.random() * 0.4))
    dealDamageToPlayer(dmg)
    addHitEffect({ position: [0, 1.2, 0.5], type: 'weak', damage: dmg, timestamp: Date.now() })
    triggerHitStop(6)
    triggerScreenShake(2)
    resetCombo()

    // ブチギレゲージ増加（被弾で増える）
    fillBuchikire(15)
    if (battle.buchikireFill >= 100 && !battle.buchikireModeActive) {
      activateBuchikireMode()
    }
  }

  function resetComboTimer() {
    if (comboResetTimer.current) clearTimeout(comboResetTimer.current)
    comboResetTimer.current = setTimeout(() => {
      resetCombo()
    }, 2000)
  }

  if (phase !== 'battle') return null

  return (
    <>
      {showSuperActivation && <SuperMoveActivation />}
      {showCutinUI && cutinData && (
        <CutinEffect
          characterName={cutinData.name}
          skillName={cutinData.skill}
          onDone={() => setShowCutinUI(false)}
        />
      )}
    </>
  )
}
