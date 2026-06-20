'use client'
import { useMemo } from 'react'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

interface DistrictFieldProps {
  district: number
}

function Building({ position, size, color, hasNeon = false, neonColor = '#ff0088' }: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  hasNeon?: boolean
  neonColor?: string
}) {
  return (
    <group position={position}>
      {/* 建物本体 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* 屋根 */}
      <mesh position={[0, size[1] / 2 + 0.05, 0]} castShadow>
        <boxGeometry args={[size[0] + 0.1, 0.1, size[2] + 0.1]} />
        <meshStandardMaterial color="#222222" roughness={0.9} />
      </mesh>
      {/* 窓 */}
      {Array.from({ length: Math.floor(size[1] / 1.5) }).map((_, i) => (
        <mesh key={i} position={[size[0] / 2 + 0.01, -size[1] / 2 + 1 + i * 1.5, 0]}>
          <planeGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial color="#334455" emissive="#334455" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {/* ネオン看板 */}
      {hasNeon && (
        <Float floatIntensity={0.1} speed={2}>
          <mesh position={[0, size[1] / 2 + 0.5, size[2] / 2 + 0.05]}>
            <planeGeometry args={[size[0] * 0.8, 0.5]} />
            <meshStandardMaterial
              color={neonColor}
              emissive={neonColor}
              emissiveIntensity={2.0}
            />
          </mesh>
        </Float>
      )}
    </group>
  )
}

function StreetLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* ポール */}
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.08, 4.5, 6]} />
        <meshStandardMaterial color="#555555" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* 光源ヘッド */}
      <mesh position={[0.5, 2.2, 0]}>
        <boxGeometry args={[1.0, 0.2, 0.3]} />
        <meshStandardMaterial color="#333" roughness={0.3} />
      </mesh>
      <pointLight position={[0.5, 2.0, 0]} color="#ffeeaa" intensity={1.5} distance={8} />
    </group>
  )
}

function DistrictArasuna() {
  return (
    <group>
      {/* 商店街アーケード */}
      {/* 路地の建物群 */}
      <Building position={[8, 3, -5]} size={[4, 6, 8]} color="#8b7355" />
      <Building position={[-8, 4, -8]} size={[5, 8, 6]} color="#7a6348" />
      <Building position={[12, 2.5, 5]} size={[3, 5, 7]} color="#9a8565" />
      <Building position={[-12, 3.5, 3]} size={[4, 7, 5]} color="#8a7050" />
      <Building position={[6, 2, 10]} size={[5, 4, 4]} color="#7a6040" />
      <Building position={[-6, 2.5, 10]} size={[4, 5, 4]} color="#886855" />
      <Building position={[0, 3, -12]} size={[6, 6, 4]} color="#706040" />
      {/* 港倉庫 */}
      <Building position={[18, 3.5, -10]} size={[8, 7, 12]} color="#5a5040" />
      <Building position={[-18, 3, -10]} size={[7, 6, 10]} color="#504838" />

      {/* アーケード屋根（鉄骨） */}
      {[-6, -3, 0, 3, 6].map((x, i) => (
        <mesh key={i} position={[x, 5, 0]}>
          <boxGeometry args={[3, 0.15, 0.15]} />
          <meshStandardMaterial color="#8b6030" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
      {/* 提灯 */}
      {[-5, -2, 1, 4].map((x, i) => (
        <Float key={i} floatIntensity={0.2} speed={1.5}>
          <group position={[x, 4.5, 0.5]}>
            <mesh>
              <sphereGeometry args={[0.18, 8, 8]} />
              <meshStandardMaterial color="#cc2200" emissive="#cc2200" emissiveIntensity={0.6} />
            </mesh>
            <pointLight color="#ff8844" intensity={0.8} distance={3} />
          </group>
        </Float>
      ))}

      {/* 街灯 */}
      <StreetLight position={[4, 0, 2]} />
      <StreetLight position={[-4, 0, 2]} />
      <StreetLight position={[4, 0, -6]} />
      <StreetLight position={[-4, 0, -6]} />

      {/* コンビニ */}
      <Building position={[3, 1.5, 6]} size={[5, 3, 4]} color="#f0e8d0" />
      <pointLight position={[3, 3, 6]} color="#ffffff" intensity={2.0} distance={8} />

      {/* 港の桟橋エリア */}
      <mesh position={[0, -0.05, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 10]} />
        <meshStandardMaterial color="#5a4a38" roughness={0.9} />
      </mesh>
      {/* 船（シルエット） */}
      <mesh position={[-15, 0.5, -22]}>
        <boxGeometry args={[10, 3, 20]} />
        <meshStandardMaterial color="#3a3028" roughness={0.9} />
      </mesh>
    </group>
  )
}

function DistrictTekkiku() {
  return (
    <group>
      {/* 廃工場群 */}
      <Building position={[10, 5, -8]} size={[12, 10, 15]} color="#3a3530" />
      <Building position={[-12, 4, -6]} size={[10, 8, 12]} color="#2a2520" />
      <Building position={[0, 6, -15]} size={[8, 12, 8]} color="#404038" />

      {/* 巨大煙突 */}
      {[[-8, 0, -12], [8, 0, -10]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <cylinderGeometry args={[0.8, 1.2, 18, 8]} />
            <meshStandardMaterial color="#333328" roughness={0.8} metalness={0.2} />
          </mesh>
          {/* 煙エフェクト（Billboard） */}
          <pointLight position={[0, 18, 0]} color="#ff6622" intensity={1.5} distance={15} />
        </group>
      ))}

      {/* 廃ドック（クレーン） */}
      <mesh position={[15, 8, 5]} castShadow>
        <boxGeometry args={[0.4, 16, 0.4]} />
        <meshStandardMaterial color="#555540" metalness={0.5} />
      </mesh>
      <mesh position={[15, 16, 8]}>
        <boxGeometry args={[0.4, 0.4, 8]} />
        <meshStandardMaterial color="#555540" metalness={0.5} />
      </mesh>

      {/* 錆びた金属壁 */}
      {[-15, -10, 10, 15].map((x, i) => (
        <mesh key={i} position={[x, 3, 0]} castShadow>
          <boxGeometry args={[0.4, 6, 20]} />
          <meshStandardMaterial color="#6a4428" roughness={0.9} metalness={0.1} />
        </mesh>
      ))}

      {/* ドラム缶 */}
      {[[2, 0, 4], [-3, 0, 5], [5, 0, 2]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, 0.5, z]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
          <meshStandardMaterial color="#5a3a28" roughness={0.7} metalness={0.3} />
        </mesh>
      ))}

      {/* 火の光 */}
      <pointLight position={[0, 1.5, 3]} color="#ff6622" intensity={3} distance={10} />
      <pointLight position={[-5, 1, -5]} color="#ff4400" intensity={2} distance={8} />
    </group>
  )
}

function DistrictShiramine() {
  return (
    <group>
      {/* 学校校舎 */}
      <Building position={[0, 5, -15]} size={[20, 10, 8]} color="#e8e0d0" />
      <Building position={[-12, 4, 0]} size={[6, 8, 20]} color="#ddd8c8" />
      <Building position={[12, 3.5, 5]} size={[5, 7, 10]} color="#e0d8c8" />

      {/* グラウンド */}
      <mesh position={[0, 0.01, 8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[25, 20]} />
        <meshStandardMaterial color="#c8b878" roughness={0.9} />
      </mesh>

      {/* 桜の木 */}
      {[[-8, 0, 2], [8, 0, 2], [-8, 0, -2], [8, 0, -2]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.2, 3, 6]} />
            <meshStandardMaterial color="#5a3a20" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.5, 0]} castShadow>
            <sphereGeometry args={[1.2, 8, 8]} />
            <meshStandardMaterial color="#ffaacc" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* 時計塔 */}
      <group position={[0, 0, -20]}>
        <mesh castShadow>
          <boxGeometry args={[2, 12, 2]} />
          <meshStandardMaterial color="#ddd8c0" roughness={0.8} />
        </mesh>
        <mesh position={[0, 6.5, 0]} castShadow>
          <boxGeometry args={[2.5, 1, 2.5]} />
          <meshStandardMaterial color="#c8c0a8" roughness={0.7} />
        </mesh>
        <pointLight position={[0, 12, 0]} color="#ffeeaa" intensity={2} distance={20} />
      </group>

      {/* フェンス */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[-18 + i * 4, 1, 15]} castShadow>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#c0b8a8" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function DistrictYotaka() {
  return (
    <group>
      {/* ネオン街の建物群 */}
      <Building position={[8, 7, -8]} size={[5, 14, 6]} color="#110022" hasNeon neonColor="#ff0088" />
      <Building position={[-8, 6, -6]} size={[6, 12, 5]} color="#110033" hasNeon neonColor="#0088ff" />
      <Building position={[0, 8, -12]} size={[8, 16, 4]} color="#0a0022" hasNeon neonColor="#ffaa00" />
      <Building position={[15, 5, 0]} size={[4, 10, 8]} color="#1a0022" hasNeon neonColor="#ff4488" />
      <Building position={[-15, 6, 3]} size={[5, 12, 7]} color="#110028" hasNeon neonColor="#44ffaa" />

      {/* ネオン地面反射 */}
      {[
        { pos: [8, 0.1, -8] as [number, number, number], color: '#ff0088' },
        { pos: [-8, 0.1, -6] as [number, number, number], color: '#0088ff' },
        { pos: [0, 0.1, -12] as [number, number, number], color: '#ffaa00' },
      ].map(({ pos, color }, i) => (
        <pointLight key={i} position={pos} color={color} intensity={2} distance={12} />
      ))}

      {/* 街灯（ネオン色） */}
      {[[-4, 0, 0], [4, 0, 0], [-4, 0, -8], [4, 0, -8]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.08, 5, 6]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <pointLight position={[0, 5, 0]} color={i % 2 === 0 ? '#ff4488' : '#4488ff'} intensity={2} distance={8} />
        </group>
      ))}

      {/* 電線 */}
      {[[-10, 8, -5], [10, 8, -5], [-10, 8, 5]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <cylinderGeometry args={[0.02, 0.02, 20, 3]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
    </group>
  )
}

function DistrictArashi() {
  return (
    <group>
      {/* 嵐城跡の石垣 */}
      {[
        { pos: [0, 2, -20] as [number, number, number], size: [30, 4, 2] as [number, number, number] },
        { pos: [-15, 2, 0] as [number, number, number], size: [2, 4, 40] as [number, number, number] },
        { pos: [15, 2, 0] as [number, number, number], size: [2, 4, 40] as [number, number, number] },
      ].map(({ pos, size }, i) => (
        <mesh key={i} position={pos} castShadow receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial color="#4a4850" roughness={0.95} />
        </mesh>
      ))}

      {/* 城の柱（廃墟） */}
      {[[-8, 0, -10], [8, 0, -10], [-8, 0, 5], [8, 0, 5]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.4, 0.5, 8, 8]} />
            <meshStandardMaterial color="#3a3848" roughness={0.95} />
          </mesh>
          {/* 崩れた上部 */}
          <mesh position={[0, 5, 0]} rotation={[Math.random() * 0.3, 0, Math.random() * 0.5]}>
            <boxGeometry args={[0.8, 2, 0.8]} />
            <meshStandardMaterial color="#35333a" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* 月明かりエリア */}
      <pointLight position={[0, 20, 0]} color="#aabbcc" intensity={2} distance={50} />

      {/* 草・苔 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 25, 0.1, (Math.random() - 0.5) * 25]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshStandardMaterial color="#3a5a3a" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* 石碑 */}
      <mesh position={[0, 1.5, -8]} castShadow>
        <boxGeometry args={[0.4, 3, 0.2]} />
        <meshStandardMaterial color="#3a3848" roughness={0.95} />
      </mesh>
    </group>
  )
}

export default function DistrictField({ district }: DistrictFieldProps) {
  const Component = {
    1: DistrictArasuna,
    2: DistrictTekkiku,
    3: DistrictShiramine,
    4: DistrictYotaka,
    5: DistrictArashi,
  }[district] ?? DistrictArasuna

  return <Component />
}
