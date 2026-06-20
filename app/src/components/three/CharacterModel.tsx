'use client'
import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CharacterModelProps {
  faction?: 'player' | 'arasuna' | 'tekkiku' | 'shiramine' | 'yotaka' | 'arashi' | 'boss'
  isBoss?: boolean
  animState?: 'idle' | 'walk' | 'run' | 'attack_weak' | 'attack_strong' | 'guard' | 'dodge' | 'hit' | 'down' | 'victory' | 'menchi' | 'super'
  isPlayer?: boolean
  name?: string
}

const FACTION_COLORS: Record<string, { gakuran: string; accent: string; hair: string }> = {
  player:    { gakuran: '#1a1a2e', accent: '#c8a84b', hair: '#1a1a1a' },
  arasuna:   { gakuran: '#2e1a0a', accent: '#c87832', hair: '#3d2010' },
  tekkiku:   { gakuran: '#1a1a1a', accent: '#888888', hair: '#0a0a0a' },
  shiramine: { gakuran: '#0a1e2e', accent: '#5588cc', hair: '#2a2a3a' },
  yotaka:    { gakuran: '#1a0a2e', accent: '#8844cc', hair: '#1a0a1a' },
  arashi:    { gakuran: '#0a0a0a', accent: '#cc2200', hair: '#0a0505' },
  boss:      { gakuran: '#050505', accent: '#c8a84b', hair: '#050505' },
}

export default function CharacterModel({
  faction = 'player',
  isBoss = false,
  animState = 'idle',
  isPlayer = false,
}: CharacterModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bonesRef = useRef<Record<string, THREE.Object3D>>({})
  const timeRef = useRef(0)
  const animTimeRef = useRef(0)

  const colors = FACTION_COLORS[faction] ?? FACTION_COLORS.player
  const scale = isBoss ? 1.25 : isPlayer ? 1.0 : 0.95 + Math.random() * 0.1

  // マテリアル（セルシェーディング風）
  const materials = useMemo(() => {
    const toonMat = (color: string, emissiveIntensity = 0.1) => {
      const mat = new THREE.MeshToonMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity,
      })
      return mat
    }

    return {
      gakuran:  toonMat(colors.gakuran, 0.05),
      skin:     toonMat('#d4956a', 0.1),
      hair:     toonMat(colors.hair, 0.05),
      accent:   toonMat(colors.accent, 0.2),
      white:    toonMat('#e0e0e0', 0.05),
      dark:     toonMat('#111111', 0.02),
      eye:      toonMat('#ffffff', 0.3),
      pupil:    toonMat('#0a0a0a', 0.05),
      shoe:     toonMat('#1a1a1a', 0.03),
      embroid:  toonMat(colors.accent, 0.4),
      gold:     toonMat('#c8a84b', 0.3),
    }
  }, [colors])

  // アウトライン用マテリアル
  const outlineMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#000000'),
    side: THREE.BackSide,
  }), [])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    timeRef.current += delta
    animTimeRef.current += delta

    const t = timeRef.current
    const bones = bonesRef.current

    // アニメーション状態機械
    switch (animState) {
      case 'idle': {
        // 不良立ちの呼吸・揺れ
        if (bones.spine) {
          bones.spine.rotation.z = Math.sin(t * 1.2) * 0.015
          bones.spine.rotation.x = Math.sin(t * 0.8) * 0.01
        }
        if (bones.head) {
          bones.head.rotation.y = Math.sin(t * 0.7) * 0.02
          bones.head.rotation.x = -0.05 + Math.sin(t * 1.1) * 0.01
        }
        if (bones.upperArmL) bones.upperArmL.rotation.z = 0.15 + Math.sin(t * 1.0) * 0.02
        if (bones.upperArmR) bones.upperArmR.rotation.z = -0.15 - Math.sin(t * 1.0) * 0.02
        if (bones.lowerArmL) bones.lowerArmL.rotation.x = 0.3
        if (bones.lowerArmR) bones.lowerArmR.rotation.x = 0.3
        // 腰を軽く反らす（番長の仁王立ち）
        if (bones.hips) {
          bones.hips.rotation.z = Math.sin(t * 0.9) * 0.01
          bones.hips.position.y = Math.sin(t * 1.2) * 0.005
        }
        break
      }
      case 'walk': {
        const wt = t * 3.0
        if (bones.upperLegL) bones.upperLegL.rotation.x = Math.sin(wt) * 0.4
        if (bones.upperLegR) bones.upperLegR.rotation.x = Math.sin(wt + Math.PI) * 0.4
        if (bones.lowerLegL) bones.lowerLegL.rotation.x = Math.max(0, -Math.sin(wt) * 0.5)
        if (bones.lowerLegR) bones.lowerLegR.rotation.x = Math.max(0, -Math.sin(wt + Math.PI) * 0.5)
        if (bones.upperArmL) bones.upperArmL.rotation.x = Math.sin(wt + Math.PI) * 0.25
        if (bones.upperArmR) bones.upperArmR.rotation.x = Math.sin(wt) * 0.25
        if (bones.spine) bones.spine.rotation.z = Math.sin(wt) * 0.03
        if (bones.hips) bones.hips.position.y = Math.abs(Math.sin(wt * 2)) * 0.02 - 0.01
        break
      }
      case 'run': {
        const rt = t * 5.0
        if (bones.upperLegL) bones.upperLegL.rotation.x = Math.sin(rt) * 0.6
        if (bones.upperLegR) bones.upperLegR.rotation.x = Math.sin(rt + Math.PI) * 0.6
        if (bones.lowerLegL) bones.lowerLegL.rotation.x = Math.max(0, -Math.sin(rt) * 0.8)
        if (bones.lowerLegR) bones.lowerLegR.rotation.x = Math.max(0, -Math.sin(rt + Math.PI) * 0.8)
        if (bones.upperArmL) { bones.upperArmL.rotation.x = Math.sin(rt + Math.PI) * 0.5; bones.upperArmL.rotation.z = 0.2 }
        if (bones.upperArmR) { bones.upperArmR.rotation.x = Math.sin(rt) * 0.5; bones.upperArmR.rotation.z = -0.2 }
        if (bones.spine) { bones.spine.rotation.x = -0.2; bones.spine.rotation.z = Math.sin(rt) * 0.05 }
        if (bones.hips) bones.hips.position.y = Math.abs(Math.sin(rt * 2)) * 0.04 - 0.02
        break
      }
      case 'attack_weak': {
        const at = animTimeRef.current
        if (at < 0.15) {
          const p = at / 0.15
          if (bones.upperArmR) { bones.upperArmR.rotation.x = -p * 0.8; bones.upperArmR.rotation.z = -0.3 }
          if (bones.lowerArmR) bones.lowerArmR.rotation.x = p * 0.5
          if (bones.spine) bones.spine.rotation.y = p * 0.2
        } else if (at < 0.3) {
          const p = (at - 0.15) / 0.15
          if (bones.upperArmR) { bones.upperArmR.rotation.x = -0.8 + p * 1.8; bones.upperArmR.rotation.z = -0.3 + p * 0.3 }
          if (bones.lowerArmR) bones.lowerArmR.rotation.x = 0.5 - p * 0.3
          if (bones.spine) bones.spine.rotation.y = 0.2 - p * 0.4
        } else {
          if (bones.upperArmR) bones.upperArmR.rotation.x += (-0.15 - bones.upperArmR.rotation.x) * 0.2
          if (bones.spine) bones.spine.rotation.y += (0 - bones.spine.rotation.y) * 0.2
        }
        break
      }
      case 'attack_strong': {
        const at = animTimeRef.current
        if (at < 0.2) {
          const p = at / 0.2
          if (bones.spine) { bones.spine.rotation.x = p * 0.3; bones.spine.rotation.y = -p * 0.3 }
          if (bones.upperArmR) { bones.upperArmR.rotation.x = -p * 1.2; bones.upperArmR.rotation.z = p * 0.5 }
          if (bones.lowerArmR) bones.lowerArmR.rotation.x = p * 0.8
        } else if (at < 0.4) {
          const p = (at - 0.2) / 0.2
          if (bones.spine) { bones.spine.rotation.x = 0.3 - p * 0.5; bones.spine.rotation.y = -0.3 + p * 0.6 }
          if (bones.upperArmR) { bones.upperArmR.rotation.x = -1.2 + p * 2.5; bones.upperArmR.rotation.z = 0.5 - p * 0.8 }
          if (bones.lowerArmR) bones.lowerArmR.rotation.x = 0.8 - p * 0.5
        } else {
          if (bones.spine) { bones.spine.rotation.x += (0 - bones.spine.rotation.x) * 0.15; bones.spine.rotation.y += (0 - bones.spine.rotation.y) * 0.15 }
          if (bones.upperArmR) bones.upperArmR.rotation.x += (-0.15 - bones.upperArmR.rotation.x) * 0.15
        }
        break
      }
      case 'guard': {
        if (bones.upperArmL) { bones.upperArmL.rotation.x = -0.8; bones.upperArmL.rotation.z = 0.4 }
        if (bones.upperArmR) { bones.upperArmR.rotation.x = -0.8; bones.upperArmR.rotation.z = -0.4 }
        if (bones.lowerArmL) bones.lowerArmL.rotation.x = 0.6
        if (bones.lowerArmR) bones.lowerArmR.rotation.x = 0.6
        if (bones.spine) bones.spine.rotation.x = -0.1
        if (bones.head) bones.head.rotation.x = 0.1
        break
      }
      case 'dodge': {
        const at = animTimeRef.current * 3
        if (bones.spine) bones.spine.rotation.x = Math.sin(at) * 0.3
        if (bones.hips) { bones.hips.position.x = Math.sin(at) * 0.3; bones.hips.position.y = Math.abs(Math.cos(at)) * 0.1 }
        break
      }
      case 'hit': {
        const at = animTimeRef.current * 5
        if (bones.head) bones.head.rotation.x = Math.sin(at) * 0.15 * Math.max(0, 1 - animTimeRef.current * 3)
        if (bones.spine) bones.spine.rotation.x = 0.2 * Math.max(0, 1 - animTimeRef.current * 2)
        break
      }
      case 'down': {
        if (bones.hips) { bones.hips.rotation.x = 1.4; bones.hips.position.y = -0.6 }
        if (bones.spine) bones.spine.rotation.x = -0.3
        if (bones.upperLegL) bones.upperLegL.rotation.x = -0.5
        if (bones.upperLegR) bones.upperLegR.rotation.x = -0.5
        break
      }
      case 'victory': {
        const vt = t * 2
        if (bones.upperArmL) { bones.upperArmL.rotation.x = Math.sin(vt) * 0.5 - 0.8; bones.upperArmL.rotation.z = 0.4 }
        if (bones.upperArmR) { bones.upperArmR.rotation.x = Math.sin(vt + 1) * 0.5 - 0.8; bones.upperArmR.rotation.z = -0.4 }
        if (bones.spine) bones.spine.rotation.z = Math.sin(vt) * 0.05
        if (bones.head) bones.head.rotation.x = -0.2
        break
      }
      case 'menchi': {
        // 睨みポーズ
        if (bones.head) { bones.head.rotation.x = -0.15; bones.head.rotation.y = Math.sin(t * 0.5) * 0.02 }
        if (bones.spine) { bones.spine.rotation.x = -0.05; bones.spine.rotation.z = Math.sin(t * 0.8) * 0.01 }
        if (bones.upperArmL) { bones.upperArmL.rotation.z = 0.2; bones.upperArmL.rotation.x = -0.1 }
        if (bones.upperArmR) { bones.upperArmR.rotation.z = -0.2; bones.upperArmR.rotation.x = -0.1 }
        break
      }
      case 'super': {
        const st = animTimeRef.current * 4
        if (bones.spine) { bones.spine.rotation.x = -Math.sin(st) * 0.4; bones.spine.rotation.y = Math.cos(st * 0.7) * 0.3 }
        if (bones.upperArmR) { bones.upperArmR.rotation.x = Math.sin(st) * 1.0 - 0.5; bones.upperArmR.rotation.z = -0.5 + Math.cos(st) * 0.3 }
        if (bones.upperArmL) { bones.upperArmL.rotation.z = 0.5 + Math.sin(st * 0.8) * 0.4 }
        break
      }
    }
  })

  function setBone(name: string, obj: THREE.Object3D | null) {
    if (obj) bonesRef.current[name] = obj
  }

  const OutlineMesh = ({ children }: { children: React.ReactNode }) => (
    <group>
      {children}
      {/* アウトライン: BackSide描画で輪郭線 */}
      <group scale={[1.04, 1.04, 1.04]}>
        {children}
      </group>
    </group>
  )

  const headSize = isBoss ? 0.135 : 0.12
  const bodyH = isBoss ? 0.55 : 0.5

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* ルートボーン（ヒップ） */}
      <group ref={r => setBone('hips', r)} position={[0, 0.9, 0]}>
        {/* 背骨 */}
        <group ref={r => setBone('spine', r)}>
          {/* 上半身 - 胴体（学ラン） */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[0.32, bodyH, 0.18]} />
            <primitive object={materials.gakuran} attach="material" />
          </mesh>
          {/* アウトライン 胴体 */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.335, bodyH + 0.01, 0.195]} />
            <primitive object={outlineMat} attach="material" />
          </mesh>

          {/* 学ランのボタン列（金属装飾） */}
          {[-0.08, -0.03, 0.02, 0.07, 0.12, 0.17].map((y, i) => (
            <mesh key={i} position={[0, 0.15 + y - 0.1, 0.092]} castShadow>
              <sphereGeometry args={[0.012, 6, 6]} />
              <primitive object={materials.gold} attach="material" />
            </mesh>
          ))}

          {/* 衿（白い部分） */}
          <mesh position={[0, 0.38, 0.06]}>
            <boxGeometry args={[0.18, 0.08, 0.06]} />
            <primitive object={materials.white} attach="material" />
          </mesh>

          {/* 背中の刺繍（勢力シンボル） */}
          <mesh position={[0, 0.15, -0.093]}>
            <planeGeometry args={[0.2, 0.25]} />
            <primitive object={materials.embroid} attach="material" />
          </mesh>

          {/* 首 */}
          <mesh position={[0, 0.41, 0]}>
            <cylinderGeometry args={[0.055, 0.065, 0.1, 8]} />
            <primitive object={materials.skin} attach="material" />
          </mesh>

          {/* 頭部ボーン */}
          <group ref={r => setBone('head', r)} position={[0, 0.47, 0]}>
            {/* 頭 */}
            <mesh position={[0, headSize * 0.6, 0]} castShadow>
              <boxGeometry args={[headSize * 1.6, headSize * 2, headSize * 1.7]} />
              <primitive object={materials.skin} attach="material" />
            </mesh>
            <mesh position={[0, headSize * 0.6, 0]}>
              <boxGeometry args={[headSize * 1.65, headSize * 2.05, headSize * 1.75]} />
              <primitive object={outlineMat} attach="material" />
            </mesh>

            {/* 目 */}
            <mesh position={[headSize * 0.35, headSize * 0.8, headSize * 0.82]}>
              <boxGeometry args={[headSize * 0.4, headSize * 0.25, 0.01]} />
              <primitive object={materials.eye} attach="material" />
            </mesh>
            <mesh position={[-headSize * 0.35, headSize * 0.8, headSize * 0.82]}>
              <boxGeometry args={[headSize * 0.4, headSize * 0.25, 0.01]} />
              <primitive object={materials.eye} attach="material" />
            </mesh>
            {/* 瞳孔 */}
            <mesh position={[headSize * 0.35, headSize * 0.8, headSize * 0.83]}>
              <boxGeometry args={[headSize * 0.18, headSize * 0.2, 0.01]} />
              <primitive object={materials.pupil} attach="material" />
            </mesh>
            <mesh position={[-headSize * 0.35, headSize * 0.8, headSize * 0.83]}>
              <boxGeometry args={[headSize * 0.18, headSize * 0.2, 0.01]} />
              <primitive object={materials.pupil} attach="material" />
            </mesh>
            {/* 眉（鋭い） */}
            <mesh position={[headSize * 0.35, headSize * 1.1, headSize * 0.83]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[headSize * 0.5, headSize * 0.07, 0.01]} />
              <primitive object={materials.hair} attach="material" />
            </mesh>
            <mesh position={[-headSize * 0.35, headSize * 1.1, headSize * 0.83]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[headSize * 0.5, headSize * 0.07, 0.01]} />
              <primitive object={materials.hair} attach="material" />
            </mesh>

            {/* 髪（主人公：センター分けの毛先逆立ち） */}
            {isPlayer ? (
              <>
                {/* メインヘアー */}
                <mesh position={[0, headSize * 1.6, 0]} castShadow>
                  <boxGeometry args={[headSize * 1.5, headSize * 0.7, headSize * 1.6]} />
                  <primitive object={materials.hair} attach="material" />
                </mesh>
                {/* 毛先逆立ち部分 */}
                {[-0.06, -0.02, 0.02, 0.06].map((x, i) => (
                  <mesh key={i} position={[x, headSize * 2.1, headSize * 0.3]} rotation={[0.2, 0, x * 2]}>
                    <boxGeometry args={[0.02, headSize * 0.5, 0.015]} />
                    <primitive object={materials.hair} attach="material" />
                  </mesh>
                ))}
                {/* 横の髪 */}
                <mesh position={[headSize * 0.85, headSize * 0.9, 0]}>
                  <boxGeometry args={[headSize * 0.15, headSize * 1.2, headSize * 1.4]} />
                  <primitive object={materials.hair} attach="material" />
                </mesh>
                <mesh position={[-headSize * 0.85, headSize * 0.9, 0]}>
                  <boxGeometry args={[headSize * 0.15, headSize * 1.2, headSize * 1.4]} />
                  <primitive object={materials.hair} attach="material" />
                </mesh>
              </>
            ) : faction === 'tekkiku' ? (
              // 刈り上げ（鋼鉄牙）
              <mesh position={[0, headSize * 1.5, 0]}>
                <boxGeometry args={[headSize * 1.4, headSize * 0.4, headSize * 1.5]} />
                <primitive object={materials.hair} attach="material" />
              </mesh>
            ) : faction === 'yotaka' ? (
              // リーゼント（夜鷹衆）
              <>
                <mesh position={[0, headSize * 2.2, -headSize * 0.2]}>
                  <boxGeometry args={[headSize * 1.0, headSize * 0.8, headSize * 0.6]} />
                  <primitive object={materials.hair} attach="material" />
                </mesh>
                <mesh position={[0, headSize * 1.6, 0]}>
                  <boxGeometry args={[headSize * 1.5, headSize * 0.6, headSize * 1.5]} />
                  <primitive object={materials.hair} attach="material" />
                </mesh>
              </>
            ) : (
              // デフォルト（短髪）
              <mesh position={[0, headSize * 1.55, 0]}>
                <boxGeometry args={[headSize * 1.5, headSize * 0.6, headSize * 1.55]} />
                <primitive object={materials.hair} attach="material" />
              </mesh>
            )}
          </group>

          {/* 左上腕ボーン */}
          <group ref={r => setBone('upperArmL', r)} position={[0.19, 0.35, 0]}>
            <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.055, 0.05, 0.22, 8]} />
              <primitive object={materials.gakuran} attach="material" />
            </mesh>
            {/* 左前腕ボーン */}
            <group ref={r => setBone('lowerArmL', r)} position={[0.2, 0, 0]}>
              <mesh position={[0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.045, 0.04, 0.18, 8]} />
                <primitive object={materials.gakuran} attach="material" />
              </mesh>
              {/* 手 */}
              <mesh position={[0.17, 0, 0]} castShadow>
                <boxGeometry args={[0.07, 0.08, 0.05]} />
                <primitive object={materials.skin} attach="material" />
              </mesh>
            </group>
          </group>

          {/* 右上腕ボーン */}
          <group ref={r => setBone('upperArmR', r)} position={[-0.19, 0.35, 0]}>
            <mesh position={[-0.08, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.055, 0.05, 0.22, 8]} />
              <primitive object={materials.gakuran} attach="material" />
            </mesh>
            {/* 右前腕ボーン */}
            <group ref={r => setBone('lowerArmR', r)} position={[-0.2, 0, 0]}>
              <mesh position={[-0.07, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.045, 0.04, 0.18, 8]} />
                <primitive object={materials.gakuran} attach="material" />
              </mesh>
              {/* 手 */}
              <mesh position={[-0.17, 0, 0]} castShadow>
                <boxGeometry args={[0.07, 0.08, 0.05]} />
                <primitive object={materials.skin} attach="material" />
              </mesh>
            </group>
          </group>
        </group>

        {/* 下半身（ボンタン） */}
        <group position={[0, -0.02, 0]}>
          {/* ウエスト */}
          <mesh position={[0, -0.01, 0]} castShadow>
            <boxGeometry args={[0.28, 0.08, 0.16]} />
            <primitive object={materials.dark} attach="material" />
          </mesh>

          {/* 左大腿ボーン */}
          <group ref={r => setBone('upperLegL', r)} position={[0.1, -0.05, 0]}>
            <mesh position={[0, -0.15, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.065, 0.32, 8]} />
              <primitive object={materials.dark} attach="material" />
            </mesh>
            {/* 左下腿ボーン */}
            <group ref={r => setBone('lowerLegL', r)} position={[0, -0.31, 0]}>
              <mesh position={[0, -0.12, 0]} castShadow>
                <cylinderGeometry args={[0.055, 0.05, 0.26, 8]} />
                <primitive object={materials.dark} attach="material" />
              </mesh>
              {/* 靴 */}
              <mesh position={[0, -0.27, 0.025]} castShadow>
                <boxGeometry args={[0.1, 0.08, 0.18]} />
                <primitive object={materials.shoe} attach="material" />
              </mesh>
            </group>
          </group>

          {/* 右大腿ボーン */}
          <group ref={r => setBone('upperLegR', r)} position={[-0.1, -0.05, 0]}>
            <mesh position={[0, -0.15, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.065, 0.32, 8]} />
              <primitive object={materials.dark} attach="material" />
            </mesh>
            {/* 右下腿ボーン */}
            <group ref={r => setBone('lowerLegR', r)} position={[0, -0.31, 0]}>
              <mesh position={[0, -0.12, 0]} castShadow>
                <cylinderGeometry args={[0.055, 0.05, 0.26, 8]} />
                <primitive object={materials.dark} attach="material" />
              </mesh>
              {/* 靴 */}
              <mesh position={[0, -0.27, 0.025]} castShadow>
                <boxGeometry args={[0.1, 0.08, 0.18]} />
                <primitive object={materials.shoe} attach="material" />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
