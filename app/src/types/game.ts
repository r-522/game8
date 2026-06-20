// Core game types

export type GamePhase =
  | 'title'
  | 'field'
  | 'menchi'
  | 'tanka'
  | 'battle'
  | 'result'
  | 'menu'
  | 'cutscene'
  | 'shop'
  | 'hideout'
  | 'rankings'

export type MenchiType = 'otoko' | 'azamuke' | 'ikari' | 'warau' | 'sugoi'

export type TankaResult = 'kanpai' | 'kachi' | 'hikiwake' | 'make' | 'kanpai_make'

export type BattleResult = 'win' | 'lose' | 'draw'

export type DachiResult = 'dachi' | 'gekitai'

export interface PlayerStats {
  hp: number
  maxHp: number
  sp: number
  maxSp: number
  atk: number
  def: number
  spirit: number
  spd: number
  level: number
  exp: number
  expToNext: number
  otokogi: number
  shibuShaba: number
}

export interface EnemyData {
  id: string
  name: string
  faction: string
  hp: number
  maxHp: number
  atk: number
  def: number
  spd: number
  aiPattern: 'aggressive' | 'defensive' | 'balanced' | 'boss'
  superMoveId: string
  isBoss: boolean
  position: [number, number, number]
}

export interface SkillData {
  id: string
  name: string
  type: 'weak' | 'strong' | 'grab' | 'super' | 'counter' | 'area'
  powerRate: number
  spCost: number
  isSuper: boolean
  description: string
  comboInput?: string[]
}

export interface ItemData {
  id: string
  name: string
  category: 'recovery' | 'buff' | 'weapon' | 'equip' | 'custom' | 'hideout' | 'key'
  effectJson: Record<string, number>
  price: number
}

export interface DachiData {
  id: string
  characterId: string
  name: string
  faction: string
  skill: string
  befriendedAt: string
}

export interface StageData {
  id: string
  districtNo: number
  name: string
  captured: boolean
  connections: string[]
  lightingMood: string
}

export interface TankaFragment {
  id: string
  text: string
  button: 'circle' | 'triangle' | 'square' | 'cross'
  timing: number
}

export interface ComboData {
  inputs: string[]
  skillId: string
  minCombo: number
}

export interface HitEffect {
  position: [number, number, number]
  type: 'weak' | 'strong' | 'super' | 'guard'
  damage: number
  timestamp: number
}

export interface CutinData {
  characterId: string
  skillName: string
  portraitSrc: string
  duration: number
}
