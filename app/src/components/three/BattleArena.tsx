'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'
import CharacterModel from './CharacterModel'

interface BattleArenaProps {
  district: number
}

const BATTLE_RADIUS = 6

const ARENA_COLORS: Record<number, { floor: string; wall: string; accent: string }> = {
  1: { floor: '#3a2e20', wall: '#5a4830', accent: '#c87832' },
  2: { floor: '#2a2520', wall: '#4a3830', accent: '#884422' },
  3: { floor: '#506050', wall: '#708070', accent: '#5588cc' },
  4: { floor: '#1a0a2a', wall: '#2a1a3a', accent: '#aa44cc' },
  5: { floor: '#2a2830', wall: '#3a3848', accent: '#8888cc' },
}

export default function BattleArena({ district }: BattleArenaProps) {
  const { battle, player } = useGameStore()
  const enemyGroupRef = useRef<THREE.Group>(null)
  const enemyAnimRef = useRef<'idle' | 'attack_weak' | 'hit' | 'guard' | 'down'>('idle')
  const enemyTimerRef = useRef(0)
  const enemyPosRef = useRef(new THREE.Vector3(0, 0, -3.5))

  const colors = ARENA_COLORS[district] ?? ARENA_COLORS[1]
  const enemy = battle.enemy

  useFrame((_, delta) => {
    if (!enemyGroupRef.current || !enemy) return
    enemyTimerRef.current += delta

    // 敵AI（簡易FSM）
    if (enemy.hp <= 0) {
      enemyAnimRef.current = 'down'
    } else if (enemyTimerRef.current > 2.5) {
      enemyTimerRef.current = 0
      if (Math.random() < 0.5) {
        enemyAnimRef.current = 'attack_weak'
      } else {
        enemyAnimRef.current = 'guard'
      }
      setTimeout(() => { enemyAnimRef.current = 'idle' }, 600)
    }

    // 敵がプレイヤーに向く
    enemyGroupRef.current.rotation.y = Math.PI
  })

  if (!enemy) return null

  const enemyHpPct = enemy.hp / (enemy.maxHp || 100)
  const isBoss = enemy.isBoss

  const factionMap: Record<string, 'arasuna' | 'tekkiku' | 'shiramine' | 'yotaka' | 'arashi' | 'boss'> = {
    '荒砂連': 'arasuna',
    '鋼鉄牙': 'tekkiku',
    '白峰同盟': 'shiramine',
    '夜鷹衆': 'yotaka',
    '嵐城鬼衆': 'arashi',
    '波嵐の頂点': 'boss',
  }
  const faction = factionMap[enemy.faction] ?? 'arasuna'

  return (
    <group>
      {/* アリーナ床 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[BATTLE_RADIUS, 32]} />
        <meshStandardMaterial color={colors.floor} roughness={0.8} />
      </mesh>

      {/* アリーナ境界リング */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[BATTLE_RADIUS - 0.2, BATTLE_RADIUS, 32]} />
        <meshStandardMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={0.3} />
      </mesh>

      {/* 観客壁（暗い影） */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const x = Math.sin(angle) * (BATTLE_RADIUS + 1.5)
        const z = Math.cos(angle) * (BATTLE_RADIUS + 1.5)
        return (
          <mesh key={i} position={[x, 1.5, z]} rotation={[0, -angle, 0]} castShadow>
            <boxGeometry args={[1.2, 3, 0.3]} />
            <meshStandardMaterial color={colors.wall} roughness={0.9} />
          </mesh>
        )
      })}

      {/* ボス用特別演出（床の亀裂） */}
      {isBoss && (
        <>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.sin(angle) * 2, 0.03, Math.cos(angle) * 2]}
                rotation={[-Math.PI / 2, 0, angle]}>
                <planeGeometry args={[0.1, 3]} />
                <meshStandardMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={0.5} />
              </mesh>
            )
          })}
          <pointLight position={[0, 3, 0]} color={colors.accent} intensity={2} distance={10} />
        </>
      )}

      {/* 敵キャラクター */}
      <group ref={enemyGroupRef} position={[0, 0, -3.5]}>
        <CharacterModel
          faction={faction}
          isBoss={isBoss}
          animState={enemyAnimRef.current}
        />

        {/* 敵HPバー（ワールド空間） */}
        <group position={[0, isBoss ? 3.0 : 2.5, 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.6, 0.12]} />
            <meshBasicMaterial color="#111" />
          </mesh>
          <mesh position={[-0.8 + 0.8 * enemyHpPct, 0, 0.001]} scale={[enemyHpPct, 1, 1]}>
            <planeGeometry args={[1.6, 0.1]} />
            <meshBasicMaterial color={enemyHpPct > 0.5 ? '#cc2200' : enemyHpPct > 0.25 ? '#ffaa00' : '#ff0000'} />
          </mesh>
        </group>
      </group>

      {/* アリーナライティング */}
      <spotLight
        position={[0, 12, 0]}
        angle={0.6}
        penumbra={0.3}
        intensity={3}
        color="#ffffff"
        castShadow
      />
      <pointLight position={[3, 3, 3]} color={colors.accent} intensity={1} distance={8} />
      <pointLight position={[-3, 3, -3]} color={colors.accent} intensity={1} distance={8} />
    </group>
  )
}
