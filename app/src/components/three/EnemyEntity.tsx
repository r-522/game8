'use client'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useGameStore } from '@/store/gameStore'
import CharacterModel from './CharacterModel'
import type { EnemyData } from '@/types/game'

interface EnemyEntityProps {
  enemy: EnemyData
}

const MENCHI_RANGE = 6.0
const VISION_ANGLE = Math.PI * 0.7

function getFactionFromId(id: string): 'arasuna' | 'tekkiku' | 'shiramine' | 'yotaka' | 'arashi' | 'boss' {
  if (id.includes('arasuna')) return 'arasuna'
  if (id.includes('tekkiku')) return 'tekkiku'
  if (id.includes('shiramine')) return 'shiramine'
  if (id.includes('yotaka')) return 'yotaka'
  if (id.includes('arashi')) return 'arashi'
  if (id.includes('boss')) return 'boss'
  return 'arasuna'
}

export default function EnemyEntity({ enemy }: EnemyEntityProps) {
  const groupRef = useRef<THREE.Group>(null)
  const posRef = useRef(new THREE.Vector3(...enemy.position))
  const patrolAngleRef = useRef(Math.random() * Math.PI * 2)
  const patrolTimerRef = useRef(0)
  const animRef = useRef<'idle' | 'walk' | 'menchi'>('idle')

  const { playerPosition, setNearbyEnemy, nearbyEnemyId, phase, startMenchi } = useGameStore()

  useFrame((_, delta) => {
    if (phase !== 'field') return
    if (!groupRef.current) return

    patrolTimerRef.current += delta
    const playerPos = new THREE.Vector3(...playerPosition)
    const toPlayer = playerPos.clone().sub(posRef.current)
    const dist = toPlayer.length()

    // プレイヤーとの距離で最近接敵を更新
    if (dist < MENCHI_RANGE) {
      setNearbyEnemy(enemy.id)
      animRef.current = 'menchi'

      // 向きをプレイヤーに向ける
      const angle = Math.atan2(toPlayer.x, toPlayer.z)
      groupRef.current.rotation.y = angle
    } else {
      if (nearbyEnemyId === enemy.id) setNearbyEnemy(null)

      // パトロール
      if (patrolTimerRef.current > 3) {
        patrolTimerRef.current = 0
        patrolAngleRef.current += (Math.random() - 0.5) * Math.PI
      }

      const moveDir = new THREE.Vector3(
        Math.sin(patrolAngleRef.current) * 1.5 * delta,
        0,
        Math.cos(patrolAngleRef.current) * 1.5 * delta
      )
      posRef.current.add(moveDir)
      posRef.current.x = Math.max(-40, Math.min(40, posRef.current.x))
      posRef.current.z = Math.max(-40, Math.min(40, posRef.current.z))
      posRef.current.y = 0

      groupRef.current.rotation.y = patrolAngleRef.current
      animRef.current = 'walk'
    }

    groupRef.current.position.copy(posRef.current)
  })

  const faction = getFactionFromId(enemy.id)
  const isClose = nearbyEnemyId === enemy.id

  return (
    <group ref={groupRef} position={enemy.position}>
      <CharacterModel faction={faction} isBoss={enemy.isBoss} animState={animRef.current} />

      {/* 名前・HP表示 */}
      <Html position={[0, 2.4, 0]} center distanceFactor={8}>
        <div style={{
          background: 'rgba(10,10,10,0.85)',
          border: `1px solid ${isClose ? '#c8a84b' : '#444'}`,
          borderRadius: 0,
          padding: '3px 10px',
          fontFamily: 'var(--font-kenka, serif)',
          fontSize: 11,
          color: isClose ? '#c8a84b' : '#ccc',
          whiteSpace: 'nowrap',
          textShadow: '1px 1px 0 #000',
          transition: 'all 0.2s',
          pointerEvents: 'none',
        }}>
          {enemy.name}
        </div>
      </Html>

      {/* メンチ範囲インジケーター */}
      {isClose && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[MENCHI_RANGE - 0.1, MENCHI_RANGE, 32]} />
          <meshBasicMaterial color="#c8a84b" transparent opacity={0.15} />
        </mesh>
      )}
    </group>
  )
}
