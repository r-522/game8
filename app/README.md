# 喧嘩番長7 ～波嵐烈伝～

ブラウザで遊べる3Dサードパーソンアクションゲーム。  
Next.js 15 + React Three Fiber + Supabase で構築。

---

## 必要環境

- Node.js v20以上（推奨: v24）
- npm v10以上
- Supabaseアカウント（無料可）
- Vercelアカウント（デプロイ時）

---

## ローカル開発

### 1. 依存パッケージインストール
```bash
npm install --legacy-peer-deps
```
> R3F v8 の peer dep が `react@">=18 <19"` のため `--legacy-peer-deps` が必要

### 2. 環境変数の設定
```bash
cp .env.local.example .env.local
```
`.env.local` を編集して Supabase の値を設定:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```
> `.env.local` は絶対にGitにコミットしないこと

### 3. Supabase セットアップ
Supabase Dashboard の SQL Editor で以下を順番に実行:

```sql
-- 1. テーブル作成
-- supabase/migrations/0001_init.sql の内容を実行

-- 2. シードデータ投入
-- supabase/seed.sql の内容を実行
```

Authentication → Providers → Anonymous → Enable

### 4. 開発サーバー起動
```bash
npm run dev
```
`http://localhost:3000` でアクセス

---

## Vercel デプロイ

### 1. GitHubリポジトリにpush

### 2. Vercelに接続
1. vercel.com → New Project → リポジトリを選択
2. Root Directory: `app`（game8/app を指定）

### 3. 環境変数を設定
Vercel Project Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Deploy

---

## ゲーム操作

| キー | アクション |
|-----|----------|
| WASD / 矢印キー | 移動 |
| Shift | ダッシュ |
| マウス | カメラ操作（クリックでポインターロック） |
| R | メンチを切る（敵の近くで） |
| J | 弱攻撃（バトル中） |
| K | 強攻撃（バトル中） |
| I | 掴み（バトル中） |
| U | 超気合技・神威の一迅（SP50消費） |
| L | ガード（バトル中） |
| M | メニューを開く |
| Esc | キャンセル・メニューを閉じる |

---

## プロジェクト構成

```
game8/app/
├── src/
│   ├── app/
│   │   ├── page.tsx          # メインページ
│   │   ├── actions.ts        # Server Actions（スコア検証等）
│   │   └── globals.css       # グローバルスタイル
│   ├── components/
│   │   ├── three/            # 3Dコンポーネント（R3F）
│   │   └── ui/               # UIコンポーネント
│   ├── store/
│   │   └── gameStore.ts      # Zustand 状態管理
│   ├── lib/supabase/         # Supabaseクライアント
│   └── types/                # TypeScript型定義
├── supabase/
│   ├── migrations/0001_init.sql  # DBスキーマ（19テーブル）
│   └── seed.sql                  # マスターデータ
└── .env.local.example
```

---

## 技術スタック

| 技術 | バージョン | 用途 |
|-----|---------|------|
| Next.js | 15.3.3 | フレームワーク |
| React | 19.0.0 | UI |
| React Three Fiber | 8.17.10 | 3Dレンダリング |
| Three.js | 0.170.0 | 3Dライブラリ |
| Zustand | 5.0.3 | 状態管理 |
| Supabase | @supabase/ssr 0.5.2 | BaaS |
| TypeScript | 5.x | 型安全 |

---

## ストーリー概要

舞台は架空都市「波嵐市（はらんし）」。主人公・神威 蒼太（かむい そうた）が転校し、5年ごとに開かれる「波嵐制覇祭」に巻き込まれていく。

5地区の番長を制しながら、5年前に姿を消した前制覇者「天羅」の謎を追う。

---

## ライセンス

MIT License
