'use client'
import { useRef, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'
import CharacterModel from './CharacterModel'

const MOVE_SPEED = 5.0
const RUN_SPEED = 9.0
const TURN_SPEED = 8.0
const MOUSE_SENSITIVITY = 0.003
const PITCH_MIN = -0.2
const PITCH_MAX = 0.8

export default function PlayerController() {
  const groupRef = useRef<THREE.Group>(null)
  const velocityRef = useRef(new THREE.Vector3())
  const keysRef = useRef<Set<string>>(new Set())
  const mouseRef = useRef({ x: 0, y: 0, locked: false })
  const currentAnimRef = useRef<'idle' | 'walk' | 'run' | 'attack_weak' | 'attack_strong' | 'guard' | 'dodge' | 'hit' | 'victory' | 'menchi' | 'super'>('idle')
  const attackCooldownRef = useRef(0)

  const {
    playerPosition, playerRotation, cameraYaw, cameraPitch,
    setPlayerPosition, setPlayerRotation, setCameraYaw, setCameraPitch,
    phase, updateInput, startMenchi, nearbyEnemyId,
    triggerScreenShake, isHitStopActive,
  } = useGameStore()

  const posRef = useRef(new THREE.Vector3(...playerPosition))
  const rotRef = useRef(playerRotation)
  const yawRef = useRef(cameraYaw)
  const pitchRef = useRef(cameraPitch)

  // キーバインド
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)
      if (e.code === 'KeyR' && nearbyEnemyId && phase === 'field') {
        startMenchi(nearbyEnemyId)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.code)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp) }
  }, [nearbyEnemyId, phase, startMenchi])

  // マウスロック
  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    const onClick = () => { if (phase === 'field') canvas.requestPointerLock() }
    const onLockChange = () => {
      mouseRef.current.locked = document.pointerLockElement === canvas
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseRef.current.locked) return
      yawRef.current -= e.movementX * MOUSE_SENSITIVITY
      pitchRef.current = Math.max(PITCH_MIN, Math.min(PITCH_MAX, pitchRef.current + e.movementY * MOUSE_SENSITIVITY))
    }

    canvas.addEventListener('click', onClick)
    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('mousemove', onMouseMove)
    return () => {
      canvas.removeEventListener('click', onClick)
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [phase])

  useFrame((_, delta) => {
    if (phase !== 'field' || isHitStopActive) return
    if (!groupRef.current) return

    attackCooldownRef.current = Math.max(0, attackCooldownRef.current - delta)

    const keys = keysRef.current
    const isRunning = keys.has('ShiftLeft') || keys.has('ShiftRight')
    const speed = isRunning ? RUN_SPEED : MOVE_SPEED

    const fwd = new THREE.Vector3(-Math.sin(yawRef.current), 0, -Math.cos(yawRef.current))
    const right = new THREE.Vector3(-Math.cos(yawRef.current), 0, Math.sin(yawRef.current))

    const move = new THREE.Vector3()
    if (keys.has('KeyW') || keys.has('ArrowUp')) move.add(fwd)
    if (keys.has('KeyS') || keys.has('ArrowDown')) move.sub(fwd)
    if (keys.has('KeyA') || keys.has('ArrowLeft')) move.add(right)
    if (keys.has('KeyD') || keys.has('ArrowRight')) move.sub(right)

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed * delta)
      posRef.current.add(move)
      // 地面に固定
      posRef.current.y = 0

      // フィールド境界
      posRef.current.x = Math.max(-45, Math.min(45, posRef.current.x))
      posRef.current.z = Math.max(-45, Math.min(45, posRef.current.z))

      // 向き（移動方向へ）
      const targetRot = Math.atan2(-move.x, -move.z)
      const rotDiff = targetRot - rotRef.current
      const wrappedDiff = Math.atan2(Math.sin(rotDiff), Math.cos(rotDiff))
      rotRef.current += wrappedDiff * Math.min(1, TURN_SPEED * delta)

      currentAnimRef.current = isRunning ? 'run' : 'walk'
    } else {
      if (keys.has('KeyJ')) currentAnimRef.current = 'attack_weak'
      else if (keys.has('KeyK')) currentAnimRef.current = 'attack_strong'
      else if (keys.has('KeyL')) currentAnimRef.current = 'guard'
      else currentAnimRef.current = 'idle'
    }

    // ジャンプ・回避
    if (keys.has('Space') && phase === 'field') {
      currentAnimRef.current = 'dodge'
    }

    groupRef.current.position.copy(posRef.current)
    groupRef.current.rotation.y = rotRef.current

    // ストアに反映（フレームごとではなく間引く）
    setPlayerPosition([posRef.current.x, posRef.current.y, posRef.current.z])
    setPlayerRotation(rotRef.current)
    setCameraYaw(yawRef.current)
    setCameraPitch(pitchRef.current)
  })

  return (
    <group ref={groupRef}>
      <CharacterModel
        faction="player"
        isPlayer
        animState={currentAnimRef.current}
      />
    </group>
  )
}
