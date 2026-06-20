'use client'
import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { EnemyData } from '@/types/game'

// 荒砂町の初期敵配置
const INITIAL_ENEMIES: EnemyData[] = [
  {
    id: 'enemy_arasuna_mob1_001',
    name: '荒砂連ザコ',
    faction: '荒砂連',
    hp: 80, maxHp: 80,
    atk: 18, def: 12, spd: 22,
    aiPattern: 'aggressive',
    superMoveId: '',
    isBoss: false,
    position: [8, 0, -6],
  },
  {
    id: 'enemy_arasuna_mob1_002',
    name: '荒砂連ザコ',
    faction: '荒砂連',
    hp: 80, maxHp: 80,
    atk: 18, def: 12, spd: 22,
    aiPattern: 'aggressive',
    superMoveId: '',
    isBoss: false,
    position: [-7, 0, 8],
  },
  {
    id: 'enemy_arasuna_mob2_001',
    name: '荒砂連中堅',
    faction: '荒砂連',
    hp: 120, maxHp: 120,
    atk: 22, def: 16, spd: 20,
    aiPattern: 'balanced',
    superMoveId: '',
    isBoss: false,
    position: [12, 0, 3],
  },
  {
    id: 'boss_enemy_tetsuji_001',
    name: '巌 鉄次',
    faction: '荒砂連',
    hp: 280, maxHp: 280,
    atk: 35, def: 30, spd: 20,
    aiPattern: 'boss',
    superMoveId: 'skill_local_arasuna',
    isBoss: true,
    position: [0, 0, -14],
  },
]

export default function GameInitializer() {
  const { addEnemy, setStoryFlag } = useGameStore()

  useEffect(() => {
    // 初期敵を配置
    INITIAL_ENEMIES.forEach(enemy => addEnemy(enemy))
    // 初期フラグ
    setStoryFlag('game_initialized', true)
  }, [])

  return null
}
