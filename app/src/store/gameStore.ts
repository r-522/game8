import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  GamePhase, MenchiType, TankaResult, BattleResult,
  PlayerStats, EnemyData, SkillData, ItemData, DachiData,
  HitEffect, CutinData, TankaFragment,
} from '@/types/game'

interface InputState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  attack: boolean
  heavyAttack: boolean
  guard: boolean
  dodge: boolean
  menchi: boolean
  super: boolean
  grab: boolean
}

interface BattleState {
  isActive: boolean
  enemy: EnemyData | null
  combo: number
  maxCombo: number
  buchikireFill: number
  buchikireModeActive: boolean
  hitEffects: HitEffect[]
  tankaResult: TankaResult | null
  playerTurn: boolean
  turnCount: number
}

interface MenchiState {
  isActive: boolean
  selectedFace: MenchiType
  targetEnemyId: string | null
  beamActive: boolean
}

interface TankaState {
  isActive: boolean
  fragments: TankaFragment[]
  completed: string[]
  timeLeft: number
  shimisenMode: boolean
  bossSpecial: boolean
  result: TankaResult | null
}

interface CutsceneState {
  isActive: boolean
  cutinData: CutinData | null
  sceneId: string | null
  chapter: number
}

interface GameState {
  phase: GamePhase
  player: PlayerStats
  playerPosition: [number, number, number]
  playerRotation: number
  cameraYaw: number
  cameraPitch: number

  battle: BattleState
  menchi: MenchiState
  tanka: TankaState
  cutscene: CutsceneState

  input: InputState

  deck: SkillData[]
  inventory: { item: ItemData; quantity: number }[]
  dachi: DachiData[]
  capturedDistricts: number[]
  currentDistrict: number
  chapter: number
  storyFlags: Record<string, boolean>
  otokogi: number
  shibuShaba: number

  enemies: EnemyData[]
  nearbyEnemyId: string | null
  dachiCalledIds: string[]

  screenShake: number
  hitStop: number
  isHitStopActive: boolean

  // actions
  setPhase: (phase: GamePhase) => void
  setPlayerPosition: (pos: [number, number, number]) => void
  setPlayerRotation: (rot: number) => void
  setCameraYaw: (yaw: number) => void
  setCameraPitch: (pitch: number) => void

  updateInput: (input: Partial<InputState>) => void

  startMenchi: (enemyId: string) => void
  selectMenchiFace: (face: MenchiType) => void
  endMenchi: () => void

  startTanka: (fragments: TankaFragment[], isBoss?: boolean) => void
  completeTankaFragment: (fragmentId: string) => void
  endTanka: (result: TankaResult) => void

  startBattle: (enemy: EnemyData) => void
  dealDamageToEnemy: (damage: number) => void
  dealDamageToPlayer: (damage: number) => void
  addHitEffect: (effect: HitEffect) => void
  clearHitEffects: () => void
  incrementCombo: () => void
  resetCombo: () => void
  fillBuchikire: (amount: number) => void
  activateBuchikireMode: () => void
  endBattle: (result: BattleResult) => void

  showCutin: (data: CutinData) => void
  hideCutin: () => void
  startCutscene: (sceneId: string, chapter?: number) => void
  endCutscene: () => void

  triggerScreenShake: (intensity: number) => void
  triggerHitStop: (frames: number) => void

  gainExp: (amount: number) => void
  changeOtokogi: (delta: number) => void
  addDachi: (dachi: DachiData) => void
  captureDistrict: (districtNo: number) => void
  setStoryFlag: (flag: string, value: boolean) => void
  advanceChapter: () => void

  addEnemy: (enemy: EnemyData) => void
  setNearbyEnemy: (id: string | null) => void
  callDachi: (id: string) => void

  useItem: (itemId: string) => void
}

const initialPlayer: PlayerStats = {
  hp: 120, maxHp: 120,
  sp: 80, maxSp: 80,
  atk: 30, def: 20,
  spirit: 25, spd: 35,
  level: 1, exp: 0, expToNext: 100,
  otokogi: 50, shibuShaba: 0,
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: 'title',
    player: initialPlayer,
    playerPosition: [0, 0, 0],
    playerRotation: 0,
    cameraYaw: 0,
    cameraPitch: 0.3,

    battle: {
      isActive: false, enemy: null,
      combo: 0, maxCombo: 0,
      buchikireFill: 0, buchikireModeActive: false,
      hitEffects: [], tankaResult: null,
      playerTurn: true, turnCount: 0,
    },

    menchi: {
      isActive: false, selectedFace: 'otoko',
      targetEnemyId: null, beamActive: false,
    },

    tanka: {
      isActive: false, fragments: [],
      completed: [], timeLeft: 8,
      shimisenMode: false, bossSpecial: false, result: null,
    },

    cutscene: {
      isActive: false, cutinData: null,
      sceneId: null, chapter: 0,
    },

    input: {
      forward: false, backward: false, left: false, right: false,
      attack: false, heavyAttack: false, guard: false,
      dodge: false, menchi: false, super: false, grab: false,
    },

    deck: [], inventory: [], dachi: [],
    capturedDistricts: [], currentDistrict: 1,
    chapter: 0, storyFlags: {},
    otokogi: 50, shibuShaba: 0,
    enemies: [], nearbyEnemyId: null, dachiCalledIds: [],

    screenShake: 0, hitStop: 0, isHitStopActive: false,

    setPhase: (phase) => set({ phase }),
    setPlayerPosition: (pos) => set({ playerPosition: pos }),
    setPlayerRotation: (rot) => set({ playerRotation: rot }),
    setCameraYaw: (yaw) => set({ cameraYaw: yaw }),
    setCameraPitch: (pitch) => set({ cameraPitch: pitch }),

    updateInput: (input) => set(s => ({ input: { ...s.input, ...input } })),

    startMenchi: (enemyId) => set({
      phase: 'menchi',
      menchi: { isActive: true, selectedFace: 'otoko', targetEnemyId: enemyId, beamActive: true },
    }),
    selectMenchiFace: (face) => set(s => ({ menchi: { ...s.menchi, selectedFace: face } })),
    endMenchi: () => set(s => ({
      menchi: { ...s.menchi, isActive: false, beamActive: false },
    })),

    startTanka: (fragments, isBoss = false) => set({
      phase: 'tanka',
      tanka: {
        isActive: true, fragments,
        completed: [], timeLeft: isBoss ? 6 : 8,
        shimisenMode: false, bossSpecial: isBoss, result: null,
      },
    }),
    completeTankaFragment: (id) => set(s => ({
      tanka: { ...s.tanka, completed: [...s.tanka.completed, id] },
    })),
    endTanka: (result) => set(s => ({
      tanka: { ...s.tanka, isActive: false, result },
    })),

    startBattle: (enemy) => set({
      phase: 'battle',
      battle: {
        isActive: true, enemy,
        combo: 0, maxCombo: 0,
        buchikireFill: 0, buchikireModeActive: false,
        hitEffects: [], tankaResult: get().tanka.result,
        playerTurn: true, turnCount: 0,
      },
    }),

    dealDamageToEnemy: (dmg) => set(s => {
      if (!s.battle.enemy) return {}
      const newHp = Math.max(0, s.battle.enemy.hp - dmg)
      return { battle: { ...s.battle, enemy: { ...s.battle.enemy, hp: newHp } } }
    }),

    dealDamageToPlayer: (dmg) => set(s => {
      const newHp = Math.max(0, s.player.hp - dmg)
      return { player: { ...s.player, hp: newHp } }
    }),

    addHitEffect: (effect) => set(s => ({
      battle: { ...s.battle, hitEffects: [...s.battle.hitEffects.slice(-10), effect] },
    })),

    clearHitEffects: () => set(s => ({ battle: { ...s.battle, hitEffects: [] } })),

    incrementCombo: () => set(s => {
      const newCombo = s.battle.combo + 1
      return { battle: { ...s.battle, combo: newCombo, maxCombo: Math.max(s.battle.maxCombo, newCombo) } }
    }),

    resetCombo: () => set(s => ({ battle: { ...s.battle, combo: 0 } })),

    fillBuchikire: (amount) => set(s => {
      const newFill = Math.min(100, s.battle.buchikireFill + amount)
      return { battle: { ...s.battle, buchikireFill: newFill } }
    }),

    activateBuchikireMode: () => set(s => ({
      battle: { ...s.battle, buchikireModeActive: true, buchikireFill: 0 },
    })),

    endBattle: (result) => {
      set({ phase: 'result' })
      const state = get()
      if (result === 'win') {
        const expGain = Math.floor((state.battle.enemy?.hp ?? 100) / 2) + 50
        get().gainExp(expGain)
      }
    },

    showCutin: (data) => set(s => ({ cutscene: { ...s.cutscene, cutinData: data } })),
    hideCutin: () => set(s => ({ cutscene: { ...s.cutscene, cutinData: null } })),
    startCutscene: (sceneId, chapter = 0) => set({
      phase: 'cutscene',
      cutscene: { isActive: true, cutinData: null, sceneId, chapter },
    }),
    endCutscene: () => set(s => ({
      phase: 'field',
      cutscene: { ...s.cutscene, isActive: false, sceneId: null },
    })),

    triggerScreenShake: (intensity) => {
      set({ screenShake: intensity })
      setTimeout(() => set({ screenShake: 0 }), 400)
    },

    triggerHitStop: (frames) => {
      set({ isHitStopActive: true, hitStop: frames })
      setTimeout(() => set({ isHitStopActive: false, hitStop: 0 }), (frames / 60) * 1000)
    },

    gainExp: (amount) => set(s => {
      let { exp, expToNext, level, maxHp, maxSp, atk, def, spirit, spd } = s.player
      exp += amount
      while (exp >= expToNext) {
        exp -= expToNext
        level++
        expToNext = Math.floor(expToNext * 1.4)
        maxHp += 15; maxSp += 10; atk += 3; def += 2; spirit += 2; spd += 2
      }
      return { player: { ...s.player, exp, expToNext, level, maxHp, maxSp, atk, def, spirit, spd, hp: maxHp, sp: maxSp } }
    }),

    changeOtokogi: (delta) => set(s => {
      const newVal = Math.max(0, Math.min(100, s.otokogi + delta))
      return { otokogi: newVal, player: { ...s.player, otokogi: newVal } }
    }),

    addDachi: (dachi) => set(s => {
      if (s.dachi.find(d => d.id === dachi.id)) return {}
      return { dachi: [...s.dachi, dachi] }
    }),

    captureDistrict: (no) => set(s => ({
      capturedDistricts: s.capturedDistricts.includes(no) ? s.capturedDistricts : [...s.capturedDistricts, no],
    })),

    setStoryFlag: (flag, value) => set(s => ({ storyFlags: { ...s.storyFlags, [flag]: value } })),
    advanceChapter: () => set(s => ({ chapter: s.chapter + 1 })),

    addEnemy: (enemy) => set(s => {
      if (s.enemies.find(e => e.id === enemy.id)) return {}
      return { enemies: [...s.enemies, enemy] }
    }),

    setNearbyEnemy: (id) => set({ nearbyEnemyId: id }),
    callDachi: (id) => set(s => ({
      dachiCalledIds: s.dachiCalledIds.includes(id) ? s.dachiCalledIds : [...s.dachiCalledIds, id],
    })),

    useItem: (itemId) => set(s => {
      const found = s.inventory.find(i => i.item.id === itemId)
      if (!found || found.quantity <= 0) return {}
      const effect = found.item.effectJson
      const player = { ...s.player }
      if (effect.hp) player.hp = Math.min(player.maxHp, player.hp + (effect.hp as number))
      if (effect.sp) player.sp = Math.min(player.maxSp, player.sp + (effect.sp as number))
      const newInv = s.inventory.map(i =>
        i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ).filter(i => i.quantity > 0)
      return { player, inventory: newInv }
    }),
  }))
)
