'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useGameStore } from '@/store/gameStore'

interface TitleScreenProps {
  onStart: () => void
}

function Rain() {
  const drops = Array.from({ length: 30 }, (_, i) => ({
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 0.8 + Math.random() * 0.6,
    opacity: 0.1 + Math.random() * 0.2,
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {drops.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${d.x}%`,
          top: '-5%',
          width: 1,
          height: '8%',
          background: 'linear-gradient(transparent, rgba(200,168,75,0.3))',
          animation: `rain-fall ${d.duration}s linear ${d.delay}s infinite`,
          opacity: d.opacity,
        }} />
      ))}
      <style>{`
        @keyframes rain-fall {
          0% { transform: translateY(0); }
          100% { transform: translateY(1200px) skewX(-5deg); }
        }
      `}</style>
    </div>
  )
}

function FireEffect() {
  return (
    <div style={{
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      height: 200,
      background: 'linear-gradient(0deg, rgba(139,26,26,0.4) 0%, transparent 100%)',
      pointerEvents: 'none',
    }} />
  )
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  const [menuIndex, setMenuIndex] = useState(0)
  const [authState, setAuthState] = useState<'checking' | 'anon' | 'loggedin'>('checking')
  const [loading, setLoading] = useState(false)
  const [flash, setFlash] = useState(false)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const { setPhase } = useGameStore()

  const menuItems = [
    { label: '新しい喧嘩を始める', action: 'new' },
    { label: '続きから', action: 'continue' },
    { label: 'ランキング', action: 'ranking' },
    { label: 'オプション', action: 'option' },
  ]

  useEffect(() => {
    const timer = setTimeout(() => setShowSubtitle(true), 600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setAuthState(user ? 'loggedin' : 'anon')
  }

  async function handleMenu(action: string) {
    if (loading) return
    setLoading(true)
    setFlash(true)
    setTimeout(() => setFlash(false), 300)

    if (action === 'new' || action === 'continue') {
      // 匿名ログイン
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        await supabase.auth.signInAnonymously()
      }
      setTimeout(() => {
        setLoading(false)
        onStart()
      }, 500)
      return
    }

    setLoading(false)
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp') setMenuIndex(i => Math.max(0, i - 1))
      if (e.code === 'ArrowDown') setMenuIndex(i => Math.min(menuItems.length - 1, i + 1))
      if (e.code === 'Enter' || e.code === 'Space') handleMenu(menuItems[menuIndex].action)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [menuIndex])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 50% 100%, rgba(139,26,26,0.35) 0%, transparent 60%), radial-gradient(ellipse at 50% 0%, rgba(200,168,75,0.08) 0%, transparent 50%), #0a0505',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <Rain />
      <FireEffect />

      {/* 背景装飾：代紋 */}
      <div style={{
        position: 'absolute',
        fontSize: 400,
        color: 'rgba(200,168,75,0.03)',
        fontFamily: 'var(--font-kenka, serif)',
        userSelect: 'none',
        pointerEvents: 'none',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        lineHeight: 1,
      }}>
        喧
      </div>

      {/* シリーズロゴ */}
      <div style={{
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 14,
        color: '#888',
        letterSpacing: '0.4em',
        marginBottom: 20,
        textShadow: '1px 1px 0 #000',
        animation: 'slide-up 0.5s ease-out',
      }}>
        ─── KENKA BANCHO ───
      </div>

      {/* メインタイトル */}
      <div style={{
        fontFamily: 'var(--font-kenka, serif)',
        fontWeight: 900,
        textAlign: 'center',
        animation: 'flash-in 0.3s ease-out',
        position: 'relative',
        marginBottom: 12,
      }}>
        <div style={{
          fontSize: 96,
          color: '#c8a84b',
          textShadow: '3px 3px 0 #000, -2px -2px 0 #000, 5px 5px 0 rgba(0,0,0,0.5), 0 0 60px rgba(200,168,75,0.2)',
          letterSpacing: '0.05em',
          lineHeight: 0.9,
        }}>
          喧嘩番長
        </div>
        <div style={{
          fontSize: 140,
          color: '#cc2200',
          textShadow: '4px 4px 0 #000, -2px -2px 0 #000, 6px 6px 0 rgba(0,0,0,0.5), 0 0 80px rgba(200,0,0,0.3)',
          letterSpacing: '0.1em',
          lineHeight: 0.85,
          marginTop: -10,
        }}>
          7
        </div>
      </div>

      {/* サブタイトル */}
      <div style={{
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 22,
        color: '#e8dcc8',
        letterSpacing: '0.5em',
        textShadow: '2px 2px 0 #000',
        marginBottom: 60,
        opacity: showSubtitle ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
        borderBottom: '1px solid rgba(200,168,75,0.3)',
        paddingBottom: 20,
      }}>
        ～ 波 嵐 烈 伝 ～
      </div>

      {/* メニュー */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', minWidth: 320 }}>
        {menuItems.map((item, i) => (
          <button
            key={item.action}
            onClick={() => { setMenuIndex(i); handleMenu(item.action) }}
            style={{
              fontFamily: 'var(--font-kenka, serif)',
              fontSize: 18,
              fontWeight: 900,
              width: '100%',
              background: menuIndex === i
                ? 'linear-gradient(180deg, rgba(139,26,26,0.9) 0%, rgba(80,10,5,0.95) 100%)'
                : 'linear-gradient(180deg, rgba(40,30,20,0.85) 0%, rgba(20,15,10,0.9) 100%)',
              border: `2px solid ${menuIndex === i ? 'rgba(200,168,75,0.8)' : 'rgba(200,168,75,0.25)'}`,
              color: menuIndex === i ? '#fff' : '#aaa',
              padding: '14px 40px',
              cursor: 'pointer',
              letterSpacing: '0.2em',
              textShadow: '1px 1px 0 #000',
              transition: 'all 0.15s',
              boxShadow: menuIndex === i ? '0 0 20px rgba(200,0,0,0.3), inset 0 0 8px rgba(200,168,75,0.1)' : 'none',
              position: 'relative',
            }}
          >
            {menuIndex === i && (
              <span style={{ position: 'absolute', left: 16, color: '#c8a84b' }}>▶</span>
            )}
            {item.label}
            {loading && menuIndex === i && (
              <span style={{ position: 'absolute', right: 16, color: '#c8a84b' }}>…</span>
            )}
          </button>
        ))}
      </div>

      {/* フラッシュ効果 */}
      {flash && (
        <div style={{
          position: 'fixed', inset: 0,
          background: '#fff',
          animation: 'flash-out 0.3s ease-out forwards',
          pointerEvents: 'none',
          zIndex: 999,
        }} />
      )}

      {/* 認証状態 */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        fontFamily: 'var(--font-gothic, sans-serif)',
        fontSize: 10,
        color: '#444',
        letterSpacing: '0.1em',
      }}>
        {authState === 'loggedin' ? '■ セーブデータあり' : '■ 匿名プレイ'}
        &nbsp;&nbsp;&nbsp;
        喧嘩番長7 ～波嵐烈伝～ © 2026
      </div>

      <style>{`
        @keyframes flash-out {
          from { opacity: 0.6; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
