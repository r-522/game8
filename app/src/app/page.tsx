'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, Suspense } from 'react'
import { useGameStore } from '@/store/gameStore'
import TitleScreen from '@/components/ui/TitleScreen'
import MenchiUI from '@/components/ui/MenchiUI'
import TankaUI from '@/components/ui/TankaUI'
import BattleHUD from '@/components/ui/BattleHUD'
import FieldHUD from '@/components/ui/FieldHUD'
import ResultScreen from '@/components/ui/ResultScreen'
import BattleSystem from '@/components/ui/BattleSystem'
import ChapterTitle from '@/components/ui/ChapterTitle'
import GameInitializer from '@/components/game/GameInitializer'

// 3Dシーンはクライアントサイドのみ
const GameScene = dynamic(() => import('@/components/three/GameScene'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0505',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 24,
        color: '#c8a84b',
        letterSpacing: '0.3em',
        textShadow: '2px 2px 0 #000',
        animation: 'buchikire-pulse 1s ease-in-out infinite',
      }}>
        ──波嵐市に降り立つ──
      </div>
    </div>
  ),
})

interface ChapterTitleState {
  show: boolean
  chapter: number
  title: string
  subtitle: string
}

export default function KenkaBancho7() {
  const { phase, setPhase, screenShake, chapter } = useGameStore()
  const [gameStarted, setGameStarted] = useState(false)
  const [chapterTitleState, setChapterTitleState] = useState<ChapterTitleState>({
    show: false, chapter: 0, title: '', subtitle: '',
  })

  const shakeClass = screenShake >= 3 ? 'screen-shake-3' : screenShake >= 2 ? 'screen-shake-2' : screenShake >= 1 ? 'screen-shake-1' : ''

  function handleGameStart() {
    setGameStarted(true)
    // 第1章オープニング
    setChapterTitleState({
      show: true,
      chapter: 1,
      title: '荒砂の仁義',
      subtitle: '転校初日、波嵐市・荒砂町',
    })
  }

  function handleChapterTitleDone() {
    setChapterTitleState(s => ({ ...s, show: false }))
    setPhase('field')
  }

  // フェーズに基づくキーボードハンドラ
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyM' && phase === 'field') {
        setPhase('menu')
      }
      if (e.code === 'Escape' && phase === 'menu') {
        setPhase('field')
      }
      if (e.code === 'Enter' && phase === 'result') {
        setPhase('field')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [phase, setPhase])

  return (
    <main className={`w-screen h-screen overflow-hidden bg-black relative ${shakeClass}`}>
      {/* タイトル画面 */}
      {!gameStarted && <TitleScreen onStart={handleGameStart} />}

      {/* 3Dゲーム世界（タイトル後は常時表示） */}
      {gameStarted && (
        <>
          <GameScene />
          <GameInitializer />

          {/* フィールドHUD */}
          <FieldHUD />

          {/* バトルHUD */}
          <BattleHUD />

          {/* バトルシステム */}
          <BattleSystem />

          {/* メンチUI */}
          <MenchiUI />

          {/* タンカUI */}
          <TankaUI />

          {/* 結果画面 */}
          <ResultScreen />

          {/* 章タイトル演出 */}
          {chapterTitleState.show && (
            <ChapterTitle
              chapter={chapterTitleState.chapter}
              title={chapterTitleState.title}
              subtitle={chapterTitleState.subtitle}
              onDone={handleChapterTitleDone}
            />
          )}

          {/* メニュー */}
          {phase === 'menu' && <MenuOverlay />}
        </>
      )}
    </main>
  )
}

function MenuOverlay() {
  const { setPhase, player, dachi, otokogi, chapter } = useGameStore()
  const [tab, setTab] = useState<'status' | 'dachi' | 'save'>('status')

  const tabs: { id: typeof tab; label: string }[] = [
    { id: 'status', label: 'ステータス' },
    { id: 'dachi', label: `ダチ (${dachi.length})` },
    { id: 'save', label: 'セーブ' },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 190,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'rgba(15,12,10,0.97)',
        border: '1px solid rgba(200,168,75,0.4)',
        borderTop: '2px solid rgba(200,168,75,0.6)',
        width: '80%',
        maxWidth: 700,
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(200,168,75,0.2)',
        }}>
          <div style={{
            fontFamily: 'var(--font-kenka, serif)',
            fontSize: 22,
            color: '#c8a84b',
            letterSpacing: '0.2em',
            textShadow: '1px 1px 0 #000',
          }}>
            番長手帳
          </div>
          <button
            onClick={() => setPhase('field')}
            style={{
              fontFamily: 'var(--font-kenka)', fontSize: 13,
              background: 'none', border: '1px solid #444',
              color: '#888', padding: '6px 16px', cursor: 'pointer',
            }}
          >
            閉じる [Esc]
          </button>
        </div>

        {/* タブ */}
        <div style={{ display: 'flex', borderBottom: '1px solid #222' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                fontFamily: 'var(--font-kenka)', fontSize: 14,
                flex: 1, padding: '12px',
                background: tab === t.id ? 'rgba(139,26,26,0.5)' : 'transparent',
                border: 'none',
                borderBottom: tab === t.id ? '2px solid #c8a84b' : '2px solid transparent',
                color: tab === t.id ? '#c8a84b' : '#666',
                cursor: 'pointer',
                letterSpacing: '0.1em',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {tab === 'status' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: '名前', value: '神威 蒼太' },
                { label: 'レベル', value: `Lv.${player.level}` },
                { label: '体力', value: `${player.hp} / ${player.maxHp}` },
                { label: '気合', value: `${player.sp} / ${player.maxSp}` },
                { label: '攻撃', value: `${player.atk}` },
                { label: '防御', value: `${player.def}` },
                { label: '漢気', value: `${player.spirit}` },
                { label: '速さ', value: `${player.spd}` },
                { label: '男気', value: `${otokogi} / 100` },
                { label: '現在地', value: `第${chapter || 0}章` },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <span style={{ fontFamily: 'var(--font-kenka)', fontSize: 14, color: '#888', letterSpacing: '0.1em' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-kenka)', fontSize: 15, color: '#c8a84b', fontWeight: 900 }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'dachi' && (
            <div>
              {dachi.length === 0 ? (
                <div style={{ fontFamily: 'var(--font-kenka)', fontSize: 16, color: '#555', textAlign: 'center', padding: '40px', letterSpacing: '0.2em' }}>
                  まだダチはいない
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dachi.map(d => (
                    <div key={d.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(200,168,75,0.2)',
                    }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-kenka)', fontSize: 15, color: '#c8a84b' }}>{d.name}</div>
                        <div style={{ fontFamily: 'var(--font-gothic)', fontSize: 11, color: '#666', marginTop: 2 }}>{d.faction}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-kenka)', fontSize: 11, color: '#555' }}>
                        ダチ
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'save' && (
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <div style={{ fontFamily: 'var(--font-kenka)', fontSize: 16, color: '#888', letterSpacing: '0.15em', marginBottom: 24 }}>
                オートセーブが有効です
              </div>
              <div style={{ fontFamily: 'var(--font-gothic)', fontSize: 11, color: '#555' }}>
                Supabaseに自動でセーブされます
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
