# TDD — 技術設計書 — 喧嘩番長7「波嵐烈伝」

## 技術スタック

| カテゴリ | 採用技術 | バージョン | 選定理由 |
|---------|---------|---------|---------|
| フレームワーク | Next.js | 15.3.3 | App Router・Server Actions・Vercelとの最適統合 |
| 言語 | TypeScript | 5.x | 型安全・R3F型定義との相性 |
| 3Dレンダリング | React Three Fiber | 8.17.10 | React的な3D記述。React 19対応は--legacy-peer-deps |
| 3Dユーティリティ | @react-three/drei | 9.117.3 | Html overlay・OrbitControls等 |
| 物理エンジン | @react-three/rapier | 1.5.0 | 将来の物理インタラクション用 |
| ポストプロセス | @react-three/postprocessing | 2.16.3 | Bloom・Vignette・ToneMapping |
| 3Dライブラリ | Three.js | 0.170.0 | R3Fの基盤 |
| 状態管理 | Zustand | 5.0.3 | subscribeWithSelector対応・軽量 |
| BaaS | Supabase | @supabase/ssr 0.5.2 | RLS・リアルタイム・認証一体 |
| デプロイ | Vercel | — | Next.jsと最適統合 |

---

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App Router                  │
│  ┌──────────────────────────────────────────────┐   │
│  │  app/page.tsx (Client Component)              │   │
│  │    │                                           │   │
│  │    ├── GameScene (R3F Canvas, ssr:false)       │   │
│  │    │     ├── CameraRig                         │   │
│  │    │     ├── DistrictLighting                  │   │
│  │    │     ├── DistrictField | BattleArena        │   │
│  │    │     ├── PlayerController                  │   │
│  │    │     ├── EnemyEntity × N                   │   │
│  │    │     └── EffectComposer                    │   │
│  │    │                                           │   │
│  │    ├── TitleScreen                             │   │
│  │    ├── FieldHUD                                │   │
│  │    ├── MenchiUI                                │   │
│  │    ├── TankaUI                                 │   │
│  │    ├── BattleHUD + BattleSystem                │   │
│  │    ├── ResultScreen                            │   │
│  │    ├── ChapterTitle                            │   │
│  │    └── MenuOverlay                             │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  app/actions.ts (Server Actions)                      │
│    ├── submitRankingScore                             │
│    ├── getRankings                                    │
│    ├── savePlayerProgress                             │
│    └── unlockAchievement                              │
└─────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
   Supabase DB                 Vercel Edge
   (PostgreSQL)                  Network
```

---

## ディレクトリ構成

```
app/
├── src/
│   ├── app/
│   │   ├── page.tsx          # メインオーケストレーター
│   │   ├── layout.tsx        # ルートレイアウト
│   │   ├── globals.css       # グローバルスタイル
│   │   └── actions.ts        # Server Actions
│   │
│   ├── components/
│   │   ├── three/
│   │   │   ├── GameScene.tsx         # R3F Canvas
│   │   │   ├── CharacterModel.tsx    # プロシージャルキャラ
│   │   │   ├── PlayerController.tsx  # WASD制御
│   │   │   ├── DistrictField.tsx     # 5地区フィールド
│   │   │   ├── BattleArena.tsx       # バトル闘技場
│   │   │   └── EnemyEntity.tsx       # 敵AI・近接判定
│   │   │
│   │   ├── ui/
│   │   │   ├── TitleScreen.tsx       # タイトル画面
│   │   │   ├── FieldHUD.tsx          # フィールドHUD
│   │   │   ├── MenchiUI.tsx          # メンチUI
│   │   │   ├── TankaUI.tsx           # タンカUI
│   │   │   ├── BattleHUD.tsx         # バトルHUD
│   │   │   ├── BattleSystem.tsx      # バトル入力処理
│   │   │   ├── ResultScreen.tsx      # 結果画面
│   │   │   └── ChapterTitle.tsx      # チャプタータイトル
│   │   │
│   │   └── game/
│   │       └── GameInitializer.tsx   # 初期敵配置
│   │
│   ├── store/
│   │   └── gameStore.ts      # Zustand全ゲーム状態
│   │
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts     # ブラウザSupabaseクライアント
│   │       └── server.ts     # サーバーSupabaseクライアント
│   │
│   └── types/
│       ├── game.ts           # ゲーム型定義
│       └── three-jsx.d.ts    # React 19 + R3F JSX型互換
│
├── supabase/
│   ├── migrations/0001_init.sql
│   └── seed.sql
│
├── .env.local.example
└── package.json
```

---

## React 19 + R3F v8 互換対応

### 問題
React 19でグローバル`JSX`名前空間が非推奨化。R3F v8は`declare namespace JSX`を使って3D要素(`mesh`, `group`等)を登録するが、React 19では`React.JSX`を使う必要がある。

### 解決策
`src/types/three-jsx.d.ts`にモジュール拡張を追加：
```typescript
import type { ThreeElements } from '@react-three/fiber'
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
```

### インストール
```bash
npm install --legacy-peer-deps
```
R3F v8のpeer depが`react@">=18 <19"`であるためlegacy-peer-depsが必要。

---

## 3Dレンダリング設計

### トゥーンシェーディング
```typescript
// BackSide outline trick: 元のメッシュをToonMaterialで描画し、
// その外側を少し大きくして黒BackSideメッシュを重ねる
<mesh>
  <boxGeometry />
  <meshToonMaterial color={bodyColor} />
</mesh>
<mesh scale={1.04}>
  <boxGeometry />
  <meshBasicMaterial color="black" side={THREE.BackSide} />
</mesh>
```

### キャラクターボーン構造
```typescript
// 親GroupでボーンTransformを模倣
// bonesRef.current.spine.rotation.z = ... で骨を回転
const bonesRef = useRef<BoneRefs>({
  root: null, spine: null, head: null,
  leftArm: null, rightArm: null,
  leftForearm: null, rightForearm: null,
  leftThigh: null, rightThigh: null,
  leftShin: null, rightShin: null,
})
```

### カメラリグ（TPS）
- プレイヤー位置から4.5unit後方・1.5unit上
- ポインターロック: マウス移動でyaw/pitch制御
- スクリーンシェイク: `screenShakeOffset`をuseFrameで変動

---

## 状態管理（Zustand）

### GameStore主要スライス
```typescript
phase: GamePhase          // title|field|menchi|tanka|battle|result
player: PlayerState       // HP/SP/stats/position/rotation
enemies: Map<string, EnemyData>
currentEnemy: EnemyData | null
hitEffects: HitEffect[]
screenShake: { intensity, duration }
buchikireMode: boolean
buchikireGauge: number
combo: number
comboTimer: number
```

### フェーズ遷移アクション
```typescript
startMenchi(enemyId) → phase = 'menchi'
startTanka(fragments) → phase = 'tanka'
startBattle(result) → phase = 'battle'
endBattle(won) → phase = 'result'
backToField() → phase = 'field'
```

---

## Supabase設計

### 認証
- 匿名認証（`signInAnonymously`）
- プレイヤーIDは`auth.uid()`と同一
- `kenka_players`に初回サインイン時レコード作成

### RLS方針
- マスターデータ（`kenka_characters`等）: 全ユーザー読み取り可
- プレイヤーデータ（`kenka_player_skills`等）: 自分のみ読み書き
- ランキング: 全ユーザー読み取り可、自分のみ書き込み

### Server Actions（service_role使用）
- スコア検証はサーバーサイドで実施（不正防止）
- クライアントからは生スコアを送り、サーバーで検証後書き込み

---

## パフォーマンス設計

### 目標
- 60FPS維持（1080p）
- 初回ロード3秒以内（プロシージャルジオメトリのため）

### 対策
| 項目 | 対策 |
|-----|------|
| 敵メッシュ再利用 | `useMemo`でGeometry/Material共有 |
| GameScene動的インポート | `next/dynamic`でssr:false |
| ジオメトリ | BoxGeometry・CylinderGeometryのみ（glTFなし） |
| ライティング | DistrictLightingで地区別最小限のライト数 |
| テクスチャ | なし（MeshToonMaterial・MeshBasicMaterialのみ） |

---

## セキュリティ設計

### 環境変数管理
- `NEXT_PUBLIC_SUPABASE_URL`: フロントエンド接続先
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: フロントエンド認証キー
- `SUPABASE_SERVICE_ROLE_KEY`: Server Actionsのみ使用（Vercel環境変数）
- **絶対にGitコミットしない**。`.gitignore`に`.env.local`を記載

### スコア改ざん防止
- ランキングスコアはServer Actionsで範囲チェック（0〜999999999）
- 既存スコアより低い場合は更新しない
- RLSで他ユーザーのレコードへの書き込みを禁止
