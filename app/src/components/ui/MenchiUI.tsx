'use client'
import { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { MenchiType } from '@/types/game'

const MENCHI_FACES: { type: MenchiType; label: string; kanji: string; effect: string; key: string }[] = [
  { type: 'otoko', label: '漢', kanji: '漢', effect: '正攻法。相手がリスペクト系に', key: '↑' },
  { type: 'azamuke', label: '嘲', kanji: '嘲', effect: '煽り。タンカが激化', key: '→' },
  { type: 'ikari', label: '怒', kanji: '怒', effect: '威圧。相手がひるむ場合あり', key: '↓' },
  { type: 'warau', label: '笑', kanji: '笑', effect: '余裕。場の雰囲気を和らげる', key: '←' },
  { type: 'sugoi', label: '凄', kanji: '凄', effect: '重圧。男気高いと効果大', key: '中央' },
]

function FocusLines() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(0,0,0,0.95) 80%)',
      pointerEvents: 'none',
    }} />
  )
}

function MenchiBeamEffect() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      {/* 集中線 */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(200,168,75,0.05) 1deg, transparent 2deg)',
        animation: 'super-spin 2s linear infinite',
      }} />
      {/* メンチビーム */}
      <div style={{
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,168,75,0.15) 0%, transparent 70%)',
        border: '1px solid rgba(200,168,75,0.2)',
        animation: 'buchikire-pulse 1s ease-in-out infinite',
      }} />
    </div>
  )
}

export default function MenchiUI() {
  const { menchi, selectMenchiFace, endMenchi, startTanka, enemies, phase } = useGameStore()
  const [hoveredFace, setHoveredFace] = useState<MenchiType>('otoko')
  const [confirmed, setConfirmed] = useState(false)

  const targetEnemy = enemies.find(e => e.id === menchi.targetEnemyId)

  useEffect(() => {
    if (phase !== 'menchi') return

    const handleKey = (e: KeyboardEvent) => {
      const faceMap: Record<string, MenchiType> = {
        'ArrowUp': 'otoko',
        'ArrowRight': 'azamuke',
        'ArrowDown': 'ikari',
        'ArrowLeft': 'warau',
        'Space': 'sugoi',
        'Enter': menchi.selectedFace,
      }
      const face = faceMap[e.code]
      if (face && face !== menchi.selectedFace) {
        selectMenchiFace(face)
        setHoveredFace(face)
      }
      if (e.code === 'Enter' || e.code === 'KeyR') {
        confirmMenchi()
      }
      if (e.code === 'Escape') {
        endMenchi()
        useGameStore.getState().setPhase('field')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [phase, menchi.selectedFace])

  function confirmMenchi() {
    if (confirmed) return
    setConfirmed(true)

    // タンカへ移行
    const fragments = generateTankaFragments()
    setTimeout(() => {
      endMenchi()
      startTanka(fragments, targetEnemy?.isBoss ?? false)
      setConfirmed(false)
    }, 800)
  }

  function generateTankaFragments() {
    const tankaPool = [
      { text: '逃げる番長がいるか！', button: 'circle' as const },
      { text: '俺に勝てると思ってんのか', button: 'triangle' as const },
      { text: '男なら正々堂々とやろうぜ', button: 'square' as const },
      { text: '波嵐の頂点は俺が取る', button: 'cross' as const },
      { text: 'この喧嘩、受けて立つぜ', button: 'circle' as const },
    ]
    const count = targetEnemy?.isBoss ? 5 : 3 + Math.floor(Math.random() * 2)
    return tankaPool.slice(0, count).map((f, i) => ({
      id: `frag_${i}`,
      ...f,
      timing: i * 0.8,
    }))
  }

  if (phase !== 'menchi') return null

  const selected = MENCHI_FACES.find(f => f.type === menchi.selectedFace)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <FocusLines />
      {menchi.beamActive && <MenchiBeamEffect />}

      {/* タイトル */}
      <div style={{
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 28,
        fontWeight: 900,
        color: '#c8a84b',
        letterSpacing: '0.3em',
        textShadow: '2px 2px 0 #000, 0 0 20px rgba(200,168,75,0.4)',
        marginBottom: 8,
        animation: 'flash-in 0.2s ease-out',
      }}>
        ──メンチを切れ──
      </div>

      {/* 相手名 */}
      {targetEnemy && (
        <div style={{
          fontFamily: 'var(--font-kenka, serif)',
          fontSize: 16,
          color: '#ff8888',
          marginBottom: 32,
          textShadow: '1px 1px 0 #000',
        }}>
          相手：{targetEnemy.name}
          {targetEnemy.isBoss && <span style={{ fontSize: 12, marginLeft: 8, color: '#c8a84b' }}>【番長】</span>}
        </div>
      )}

      {/* メンチ顔選択パネル */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 8,
        position: 'relative',
        width: 380,
      }}>
        {MENCHI_FACES.map((face, i) => {
          const isSelected = menchi.selectedFace === face.type
          const gridPositions = [
            { gridColumn: '2', gridRow: '1' }, // 上 漢
            { gridColumn: '3', gridRow: '2' }, // 右 嘲
            { gridColumn: '2', gridRow: '2' }, // 下 怒（中央下）
            { gridColumn: '1', gridRow: '2' }, // 左 笑
            { gridColumn: '2', gridRow: '2', display: 'none' }, // 中央（凄）
          ]

          const positions = [
            { gridColumn: '2', gridRow: '1' },
            { gridColumn: '3', gridRow: '1' },
            { gridColumn: '2', gridRow: '2' },
            { gridColumn: '1', gridRow: '1' },
            { gridColumn: '1', gridRow: '2' },
          ]

          return (
            <div
              key={face.type}
              onClick={() => { selectMenchiFace(face.type); setHoveredFace(face.type) }}
              onDoubleClick={confirmMenchi}
              style={{
                ...positions[i],
                fontFamily: 'var(--font-kenka, serif)',
                background: isSelected ? 'rgba(139,26,26,0.9)' : 'rgba(10,10,10,0.88)',
                border: isSelected ? '2px solid #c8a84b' : '2px solid rgba(200,168,75,0.3)',
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: isSelected ? '0 0 16px rgba(200,0,0,0.4), inset 0 0 8px rgba(200,168,75,0.1)' : 'none',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 900, color: isSelected ? '#fff' : '#c8a84b', textShadow: '2px 2px 0 #000', lineHeight: 1 }}>
                {face.kanji}
              </div>
              <div style={{ fontSize: 11, color: isSelected ? '#ffddaa' : '#888', marginTop: 4, letterSpacing: '0.1em' }}>
                [{face.key}]
              </div>
            </div>
          )
        })}
      </div>

      {/* 選択中の効果説明 */}
      {selected && (
        <div style={{
          marginTop: 24,
          fontFamily: 'var(--font-kenka, serif)',
          fontSize: 14,
          color: '#c8a84b',
          textShadow: '1px 1px 0 #000',
          textAlign: 'center',
          background: 'rgba(10,10,10,0.8)',
          border: '1px solid rgba(200,168,75,0.3)',
          padding: '10px 24px',
        }}>
          {selected.effect}
        </div>
      )}

      {/* 確認ボタン */}
      <div style={{ marginTop: 20, display: 'flex', gap: 16 }}>
        <button
          onClick={confirmMenchi}
          disabled={confirmed}
          style={{
            fontFamily: 'var(--font-kenka, serif)',
            fontSize: 18,
            fontWeight: 900,
            background: confirmed ? 'rgba(50,50,50,0.9)' : 'linear-gradient(180deg, rgba(139,26,26,0.95) 0%, rgba(80,10,5,0.98) 100%)',
            border: '2px solid rgba(200,168,75,0.7)',
            color: confirmed ? '#666' : '#fff',
            padding: '12px 40px',
            cursor: confirmed ? 'default' : 'pointer',
            letterSpacing: '0.2em',
            textShadow: '1px 1px 0 #000',
            transition: 'all 0.15s',
          }}
        >
          {confirmed ? '…ガン付け中…' : 'メンチ！[Enter]'}
        </button>
        <button
          onClick={() => { endMenchi(); useGameStore.getState().setPhase('field') }}
          style={{
            fontFamily: 'var(--font-kenka, serif)',
            fontSize: 14,
            background: 'rgba(10,10,10,0.8)',
            border: '1px solid #444',
            color: '#888',
            padding: '12px 24px',
            cursor: 'pointer',
            letterSpacing: '0.15em',
          }}
        >
          やめる[Esc]
        </button>
      </div>
    </div>
  )
}
