'use client'
import { useGameStore } from '@/store/gameStore'

function MiniMap() {
  const { playerPosition, enemies, capturedDistricts, currentDistrict } = useGameStore()
  const scale = 4 // 1ユニット = 4px

  return (
    <div style={{
      width: 120,
      height: 120,
      background: 'rgba(10,10,10,0.85)',
      border: '1px solid rgba(200,168,75,0.4)',
      borderRadius: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 地区名 */}
      <div style={{
        position: 'absolute',
        top: 4, left: 0, right: 0,
        textAlign: 'center',
        fontFamily: 'var(--font-kenka, serif)',
        fontSize: 9,
        color: '#888',
        letterSpacing: '0.1em',
      }}>
        {['荒砂町', '鉄機区', '白峰学園区', '夜鷹街', '嵐城跡'][currentDistrict - 1] ?? '---'}
      </div>

      {/* フィールド境界 */}
      <div style={{
        position: 'absolute',
        inset: 16,
        border: '1px solid rgba(200,168,75,0.2)',
      }} />

      {/* 敵ドット */}
      {enemies.slice(0, 6).map(e => {
        const ex = 60 + e.position[0] / 45 * 44
        const ey = 60 + e.position[2] / 45 * 44
        return (
          <div key={e.id} style={{
            position: 'absolute',
            left: ex - 2,
            top: ey - 2,
            width: 4,
            height: 4,
            background: e.isBoss ? '#c8a84b' : '#cc2200',
            borderRadius: '50%',
          }} />
        )
      })}

      {/* プレイヤードット */}
      <div style={{
        position: 'absolute',
        left: 60 + playerPosition[0] / 45 * 44 - 3,
        top: 60 + playerPosition[2] / 45 * 44 - 3,
        width: 6,
        height: 6,
        background: '#44ff88',
        borderRadius: '50%',
        boxShadow: '0 0 4px #44ff88',
      }} />
    </div>
  )
}

export default function FieldHUD() {
  const { phase, nearbyEnemyId, enemies, player, otokogi } = useGameStore()
  const nearbyEnemy = enemies.find(e => e.id === nearbyEnemyId)

  if (phase !== 'field') return null

  return (
    <div className="hud-overlay">
      {/* ミニマップ（右上） */}
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <MiniMap />
      </div>

      {/* プレイヤー情報（左上） */}
      <div style={{
        position: 'absolute',
        top: 20, left: 20,
        background: 'rgba(10,10,10,0.8)',
        border: '1px solid rgba(200,168,75,0.3)',
        borderTop: '2px solid rgba(200,168,75,0.5)',
        padding: '10px 14px',
        minWidth: 180,
      }}>
        <div style={{
          fontFamily: 'var(--font-kenka, serif)',
          fontSize: 13,
          color: '#c8a84b',
          marginBottom: 8,
          letterSpacing: '0.15em',
        }}>
          Lv.{player.level} 神威 蒼太
        </div>
        {/* HP */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontFamily: 'var(--font-kenka)', fontSize: 9, color: '#ff8888', marginBottom: 2, letterSpacing: '0.15em' }}>
            体力 {player.hp}/{player.maxHp}
          </div>
          <div style={{ width: 160, height: 8, background: '#1a0a0a', border: '1px solid #333', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${(player.hp / player.maxHp) * 100}%`,
              background: player.hp / player.maxHp > 0.5 ? '#cc2200' : '#ff4400',
              transition: 'width 0.2s',
            }} />
          </div>
        </div>
        {/* 男気 */}
        <div>
          <div style={{ fontFamily: 'var(--font-kenka)', fontSize: 9, color: '#c8a84b', marginBottom: 2, letterSpacing: '0.15em' }}>
            男気 {otokogi >= 80 ? '漢' : otokogi >= 60 ? '硬派' : otokogi >= 40 ? '普通' : otokogi >= 20 ? 'チンピラ' : 'シャバい奴'}
          </div>
          <div style={{ width: 160, height: 6, background: '#1a1a0a', border: '1px solid #333', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${otokogi}%`,
              background: 'linear-gradient(90deg, #886600, #c8a84b)',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      </div>

      {/* 近くの敵の表示（下中央） */}
      {nearbyEnemy && (
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10,10,10,0.88)',
          border: '2px solid #c8a84b',
          padding: '10px 24px',
          textAlign: 'center',
          animation: 'slide-up 0.2s ease-out',
        }}>
          <div style={{
            fontFamily: 'var(--font-kenka, serif)',
            fontSize: 16,
            color: '#c8a84b',
            letterSpacing: '0.2em',
            textShadow: '1px 1px 0 #000',
          }}>
            {nearbyEnemy.name}
          </div>
          <div style={{
            fontFamily: 'var(--font-gothic, sans-serif)',
            fontSize: 11,
            color: '#ff8888',
            marginTop: 4,
            letterSpacing: '0.15em',
          }}>
            [R]でメンチを切る
          </div>
        </div>
      )}

      {/* 操作ガイド（右下） */}
      <div style={{
        position: 'absolute',
        right: 20,
        bottom: 20,
        background: 'rgba(10,10,10,0.7)',
        border: '1px solid #333',
        padding: '8px 12px',
        fontFamily: 'var(--font-gothic, sans-serif)',
        fontSize: 10,
        color: '#666',
        lineHeight: 1.9,
      }}>
        <div style={{ color: '#888', marginBottom: 2 }}>WASD / ←→↑↓: 移動</div>
        <div>Shift: 走る</div>
        <div>R: メンチを切る</div>
        <div>M: メニュー</div>
        <div style={{ color: '#444', marginTop: 4 }}>クリックでマウスロック</div>
      </div>
    </div>
  )
}
