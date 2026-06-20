'use client'
import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { TankaResult } from '@/types/game'

const BUTTON_STYLES: Record<string, { color: string; bg: string; symbol: string }> = {
  circle:   { color: '#ff4444', bg: 'rgba(200,0,0,0.2)',   symbol: '○' },
  triangle: { color: '#44ff88', bg: 'rgba(0,200,80,0.2)',  symbol: '△' },
  square:   { color: '#8888ff', bg: 'rgba(80,80,200,0.2)', symbol: '□' },
  cross:    { color: '#88ccff', bg: 'rgba(80,160,200,0.2)',symbol: '×' },
}

interface FragmentProps {
  id: string
  text: string
  button: string
  isCompleted: boolean
  onClick: () => void
  index: number
}

function TankaFragment({ id, text, button, isCompleted, onClick, index }: FragmentProps) {
  const btnStyle = BUTTON_STYLES[button] ?? BUTTON_STYLES.circle
  const [pos] = useState({
    x: 15 + (index * 18) % 70,
    y: 20 + Math.floor(index / 5) * 20,
  })

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: 'translate(-50%, -50%)',
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 18,
        fontWeight: 900,
        background: isCompleted ? 'rgba(200,168,75,0.4)' : btnStyle.bg,
        border: `2px solid ${isCompleted ? '#c8a84b' : btnStyle.color}`,
        color: isCompleted ? '#c8a84b' : '#ffffff',
        padding: '8px 20px',
        cursor: isCompleted ? 'default' : 'pointer',
        letterSpacing: '0.05em',
        textShadow: '1px 1px 0 #000',
        animation: 'tanka-drop 0.3s ease-out',
        transition: 'all 0.15s',
        userSelect: 'none',
        boxShadow: isCompleted ? '0 0 12px rgba(200,168,75,0.4)' : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 11, marginRight: 8, color: btnStyle.color }}>
        [{btnStyle.symbol}]
      </span>
      {isCompleted ? <s style={{ opacity: 0.7 }}>{text}</s> : text}
    </div>
  )
}

function TimerBar({ timeLeft, maxTime }: { timeLeft: number; maxTime: number }) {
  const pct = timeLeft / maxTime
  const color = pct > 0.5 ? '#44ff88' : pct > 0.25 ? '#ffaa00' : '#ff4400'

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: 6,
      background: '#1a1a1a',
    }}>
      <div style={{
        height: '100%',
        width: `${pct * 100}%`,
        background: color,
        transition: 'width 0.1s linear, background 0.3s',
        boxShadow: `0 0 8px ${color}`,
      }} />
    </div>
  )
}

function ResultBanner({ result }: { result: TankaResult }) {
  const labels: Record<TankaResult, { text: string; color: string; sub: string }> = {
    kanpai:      { text: '完勝！！', color: '#ffdd44', sub: '相手HP-30%、攻撃力+20%！' },
    kachi:       { text: '勝利！', color: '#44ff88', sub: '相手HP-15%、攻撃力+10%！' },
    hikiwake:    { text: '引き分け', color: '#88aaff', sub: 'HP増減なし、通常スタート' },
    make:        { text: '敗北…', color: '#ff4444', sub: '自分HP-15%、防御力-10%' },
    kanpai_make: { text: '完敗！！', color: '#ff2200', sub: '自分HP-30%、速度-15%！' },
  }
  const l = labels[result]

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      zIndex: 10,
      background: 'rgba(0,0,0,0.6)',
      animation: 'flash-in 0.2s ease-out',
    }}>
      <div style={{
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 72,
        fontWeight: 900,
        color: l.color,
        textShadow: `3px 3px 0 #000, 0 0 40px ${l.color}66`,
        letterSpacing: '0.1em',
        animation: 'punch-in 0.15s ease-out',
      }}>
        {l.text}
      </div>
      <div style={{
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 18,
        color: '#fff',
        textShadow: '1px 1px 0 #000',
        marginTop: 16,
        background: 'rgba(10,10,10,0.8)',
        padding: '8px 24px',
        border: `1px solid ${l.color}55`,
      }}>
        {l.sub}
      </div>
    </div>
  )
}

export default function TankaUI() {
  const { tanka, completeTankaFragment, endTanka, startBattle, battle, enemies, menchi, phase } = useGameStore()
  const [showResult, setShowResult] = useState(false)
  const timerRef = useRef(tanka.timeLeft)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [timeLeft, setTimeLeft] = useState(tanka.timeLeft)

  useEffect(() => {
    if (phase !== 'tanka') return

    timerRef.current = tanka.timeLeft
    setTimeLeft(tanka.timeLeft)

    intervalRef.current = setInterval(() => {
      timerRef.current -= 0.1
      setTimeLeft(Math.max(0, timerRef.current))

      if (timerRef.current <= 0) {
        clearInterval(intervalRef.current!)
        // 時間切れ→結果計算
        resolveResult()
      }
    }, 100)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [phase, tanka.isActive])

  function resolveResult() {
    const completedCount = tanka.completed.length
    const totalCount = tanka.fragments.length
    const ratio = totalCount > 0 ? completedCount / totalCount : 0

    let result: TankaResult
    if (ratio >= 1.0)       result = 'kanpai'
    else if (ratio >= 0.6)  result = 'kachi'
    else if (ratio >= 0.4)  result = 'hikiwake'
    else if (ratio >= 0.2)  result = 'make'
    else                    result = 'kanpai_make'

    endTanka(result)
    setShowResult(true)

    setTimeout(() => {
      setShowResult(false)
      // バトル開始
      const enemy = enemies.find(e => e.id === menchi.targetEnemyId)
      if (enemy) startBattle(enemy)
    }, 2000)
  }

  function handleFragmentClick(fragId: string) {
    if (tanka.completed.includes(fragId)) return
    completeTankaFragment(fragId)

    // 全部完成チェック
    const newCompleted = [...tanka.completed, fragId]
    if (newCompleted.length >= tanka.fragments.length) {
      clearInterval(intervalRef.current!)
      resolveResult()
    }
  }

  if (phase !== 'tanka') return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 160,
      background: 'rgba(0,0,0,0.85)',
    }}>
      {/* タイマーバー */}
      <TimerBar timeLeft={timeLeft} maxTime={tanka.timeLeft || 8} />

      {/* タイトル */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 32,
        fontWeight: 900,
        color: '#c8a84b',
        letterSpacing: '0.3em',
        textShadow: '2px 2px 0 #000, 0 0 20px rgba(200,168,75,0.4)',
        whiteSpace: 'nowrap',
      }}>
        ──タンカを切れ──
      </div>

      {/* 完成したタンカ表示エリア */}
      <div style={{
        position: 'absolute',
        top: 70,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(10,10,10,0.8)',
        border: '1px solid rgba(200,168,75,0.3)',
        padding: '10px 24px',
        minWidth: 400,
        minHeight: 50,
        textAlign: 'center',
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 20,
        color: '#c8a84b',
        letterSpacing: '0.1em',
        textShadow: '1px 1px 0 #000',
      }}>
        {tanka.completed.map(id => {
          const frag = tanka.fragments.find(f => f.id === id)
          return frag ? <span key={id} style={{ margin: '0 4px' }}>{frag.text}</span> : null
        })}
        {tanka.completed.length === 0 && (
          <span style={{ color: '#555' }}>（ここに口上が完成する）</span>
        )}
      </div>

      {/* フラグメント */}
      <div style={{ position: 'absolute', inset: 0, top: 130 }}>
        {tanka.fragments.map((frag, i) => (
          <TankaFragment
            key={frag.id}
            id={frag.id}
            text={frag.text}
            button={frag.button}
            isCompleted={tanka.completed.includes(frag.id)}
            onClick={() => handleFragmentClick(frag.id)}
            index={i}
          />
        ))}
      </div>

      {/* シャミセン（L+R） */}
      <div style={{
        position: 'absolute',
        bottom: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 11,
        color: '#555',
        letterSpacing: '0.15em',
        textAlign: 'center',
      }}>
        [Shift+Enter]：シャミセン（ハイリスク・ハイリターン）
      </div>

      {/* 進捗 */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        right: 32,
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 14,
        color: '#888',
        textShadow: '1px 1px 0 #000',
      }}>
        {tanka.completed.length} / {tanka.fragments.length}
      </div>

      {/* 結果バナー */}
      {showResult && tanka.result && <ResultBanner result={tanka.result} />}
    </div>
  )
}
