'use client'
import { useState, useEffect } from 'react'

interface ChapterTitleProps {
  chapter: number
  title: string
  subtitle?: string
  onDone: () => void
}

export default function ChapterTitle({ chapter, title, subtitle, onDone }: ChapterTitleProps) {
  const [phase, setPhase] = useState<'in' | 'show' | 'out'>('in')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 400)
    const t2 = setTimeout(() => setPhase('out'), 3000)
    const t3 = setTimeout(onDone, 3600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000',
      opacity: phase === 'in' ? 0 : phase === 'out' ? 0 : 1,
      transition: phase === 'in' ? 'opacity 0.4s ease-out' : 'opacity 0.6s ease-in',
    }}>
      {/* 横ライン */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        height: 1,
        top: '42%',
        background: 'linear-gradient(90deg, transparent, rgba(200,168,75,0.5), transparent)',
      }} />
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        height: 1,
        top: '60%',
        background: 'linear-gradient(90deg, transparent, rgba(200,168,75,0.3), transparent)',
      }} />

      <div style={{ textAlign: 'center', position: 'relative' }}>
        {/* 第〇章 */}
        <div style={{
          fontFamily: 'var(--font-kenka, serif)',
          fontSize: 16,
          color: '#c8a84b',
          letterSpacing: '0.5em',
          marginBottom: 16,
          opacity: phase === 'show' ? 1 : 0,
          transition: 'opacity 0.5s 0.2s',
          textShadow: '1px 1px 0 #000',
        }}>
          第{['一', '二', '三', '四', '五', '六', '七'][chapter - 1] ?? chapter}章
        </div>

        {/* 章タイトル */}
        <div style={{
          fontFamily: 'var(--font-kenka, serif)',
          fontWeight: 900,
          fontSize: 52,
          color: '#fff',
          letterSpacing: '0.15em',
          textShadow: '3px 3px 0 #000, 0 0 40px rgba(200,168,75,0.2)',
          opacity: phase === 'show' ? 1 : 0,
          transform: phase === 'show' ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s 0.3s, transform 0.5s 0.3s',
        }}>
          「{title}」
        </div>

        {/* サブタイトル */}
        {subtitle && (
          <div style={{
            fontFamily: 'var(--font-kenka, serif)',
            fontSize: 18,
            color: '#888',
            marginTop: 16,
            letterSpacing: '0.3em',
            opacity: phase === 'show' ? 1 : 0,
            transition: 'opacity 0.5s 0.5s',
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}
