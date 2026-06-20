'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky, Environment, Float } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'
import CharacterModel from './CharacterModel'
import PlayerController from './PlayerController'
import DistrictField from './DistrictField'
import EnemyEntity from './EnemyEntity'
import BattleArena from './BattleArena'

function CameraRig() {
  const { camera } = useThree()
  const { playerPosition, cameraYaw, cameraPitch, phase, screenShake, isHitStopActive } = useGameStore()
  const shakeRef = useRef(new THREE.Vector3())
  const prevPos = useRef(new THREE.Vector3(...playerPosition))

  useFrame((_, delta) => {
    const targetPos = new THREE.Vector3(...playerPosition)
    prevPos.current.lerp(targetPos, 0.12)

    const dist = 4.5
    const h = 1.8
    const cx = prevPos.current.x + Math.sin(cameraYaw) * dist
    const cz = prevPos.current.z + Math.cos(cameraYaw) * dist
    const cy = prevPos.current.y + h + Math.sin(cameraPitch) * dist * 0.5

    // 画面シェイク
    if (screenShake > 0) {
      shakeRef.current.set(
        (Math.random() - 0.5) * screenShake * 0.05,
        (Math.random() - 0.5) * screenShake * 0.02,
        0
      )
    } else {
      shakeRef.current.lerp(new THREE.Vector3(0, 0, 0), 0.3)
    }

    camera.position.lerp(new THREE.Vector3(cx, cy, cz).add(shakeRef.current), 0.1)
    camera.lookAt(prevPos.current.x, prevPos.current.y + 1.2, prevPos.current.z)
  })

  return null
}

function DistrictLighting({ district }: { district: number }) {
  const lightConfigs: Record<number, {
    ambientColor: string; ambientIntensity: number;
    dirColor: string; dirIntensity: number;
    dirPos: [number, number, number];
    fogColor: string; fogDensity: number;
  }> = {
    1: { // 荒砂町 - 夕暮れ港
      ambientColor: '#ff8844', ambientIntensity: 0.6,
      dirColor: '#ffcc88', dirIntensity: 1.5,
      dirPos: [-5, 8, -5], fogColor: '#ff9966', fogDensity: 0.015,
    },
    2: { // 鉄機区 - 錆・逆光
      ambientColor: '#442211', ambientIntensity: 0.4,
      dirColor: '#ff6633', dirIntensity: 2.0,
      dirPos: [8, 4, -8], fogColor: '#331100', fogDensity: 0.025,
    },
    3: { // 白峰学園区 - 清廉な昼
      ambientColor: '#aabbcc', ambientIntensity: 0.8,
      dirColor: '#ffffff', dirIntensity: 1.8,
      dirPos: [2, 12, 5], fogColor: '#ccddee', fogDensity: 0.008,
    },
    4: { // 夜鷹街 - ネオン夜景
      ambientColor: '#110022', ambientIntensity: 0.3,
      dirColor: '#ff44aa', dirIntensity: 1.2,
      dirPos: [0, 10, 0], fogColor: '#110022', fogDensity: 0.02,
    },
    5: { // 嵐城跡 - 荘厳な月明かり
      ambientColor: '#334455', ambientIntensity: 0.5,
      dirColor: '#aabbcc', dirIntensity: 1.4,
      dirPos: [5, 15, 5], fogColor: '#223344', fogDensity: 0.012,
    },
  }

  const cfg = lightConfigs[district] ?? lightConfigs[1]

  return (
    <>
      <ambientLight color={cfg.ambientColor} intensity={cfg.ambientIntensity} />
      <directionalLight
        color={cfg.dirColor}
        intensity={cfg.dirIntensity}
        position={cfg.dirPos}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={60}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <fog attach="fog" args={[cfg.fogColor, 20, 80]} />
      {/* ネオン地区だけ追加ポイントライト */}
      {district === 4 && (
        <>
          <pointLight color="#ff0088" intensity={3} position={[5, 3, 5]} distance={15} />
          <pointLight color="#0088ff" intensity={3} position={[-5, 3, -5]} distance={15} />
          <pointLight color="#ffaa00" intensity={2} position={[0, 5, 0]} distance={20} />
        </>
      )}
    </>
  )
}

function Ground({ district }: { district: number }) {
  const groundColors: Record<number, string> = {
    1: '#4a3a28', 2: '#2a2520', 3: '#606850', 4: '#1a0a2a', 5: '#2a2a30',
  }
  const color = groundColors[district] ?? '#3a3028'

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
      <planeGeometry args={[100, 100, 20, 20]} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0.0} />
    </mesh>
  )
}

export default function GameScene() {
  const { phase, currentDistrict, enemies, isHitStopActive } = useGameStore()

  const isBattle = phase === 'battle'

  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      camera={{ fov: 65, near: 0.1, far: 200 }}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    >
      <CameraRig />
      <DistrictLighting district={currentDistrict} />
      <Ground district={currentDistrict} />

      {isBattle ? (
        <BattleArena district={currentDistrict} />
      ) : (
        <DistrictField district={currentDistrict} />
      )}

      {/* プレイヤーキャラ */}
      <PlayerController />

      {/* フィールド上の敵 */}
      {!isBattle && enemies.map(enemy => (
        <EnemyEntity key={enemy.id} enemy={enemy} />
      ))}

      {/* ポストプロセス */}
      <EffectComposer>
        <Bloom
          intensity={currentDistrict === 4 ? 0.8 : 0.3}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
        />
        <Vignette eskil={false} offset={0.35} darkness={0.5} />
        <ToneMapping />
      </EffectComposer>
    </Canvas>
  )
}
