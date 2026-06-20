-- 喧嘩番長7 Supabase スキーマ
-- すべてのテーブルに kenka_ プレフィックスを付与

-- 拡張機能
create extension if not exists "uuid-ossp";

-- ============================================================
-- プレイヤー本体
-- ============================================================
create table if not exists kenka_players (
  id uuid primary key default auth.uid(),
  display_name text not null default '名無しの番長',
  level int not null default 1,
  exp bigint not null default 0,
  otokogi int not null default 50,
  current_chapter int not null default 0,
  total_battles int not null default 0,
  total_wins int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table kenka_players enable row level security;
create policy "players_own" on kenka_players
  for all using (auth.uid() = id);

-- ============================================================
-- セーブスロット
-- ============================================================
create table if not exists kenka_save_slots (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references kenka_players(id) on delete cascade,
  slot_no int not null check (slot_no between 1 and 3),
  state_json jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique(player_id, slot_no)
);

alter table kenka_save_slots enable row level security;
create policy "save_slots_own" on kenka_save_slots
  for all using (auth.uid() = player_id);

-- ============================================================
-- キャラクターマスタ
-- ============================================================
create table if not exists kenka_characters (
  id text primary key,
  name text not null,
  faction text not null,
  role text not null check (role in ('playable','boss','npc','sub_boss')),
  base_stats jsonb not null default '{}',
  portrait text,
  description text,
  district_no int,
  created_at timestamptz not null default now()
);

alter table kenka_characters enable row level security;
create policy "characters_read" on kenka_characters
  for select using (true);

-- ============================================================
-- 技マスタ
-- ============================================================
create table if not exists kenka_skills (
  id text primary key,
  name text not null,
  type text not null check (type in ('weak','strong','grab','super','counter','area')),
  power_rate numeric not null default 1.0,
  sp_cost int not null default 0,
  is_super boolean not null default false,
  description text,
  combo_input text[],
  cutin_portrait text
);

alter table kenka_skills enable row level security;
create policy "skills_read" on kenka_skills
  for select using (true);

-- ============================================================
-- プレイヤー習得技
-- ============================================================
create table if not exists kenka_player_skills (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references kenka_players(id) on delete cascade,
  skill_id text not null references kenka_skills(id),
  level int not null default 1,
  in_deck boolean not null default false,
  deck_slot int,
  unique(player_id, skill_id)
);

alter table kenka_player_skills enable row level security;
create policy "player_skills_own" on kenka_player_skills
  for all using (auth.uid() = player_id);

-- ============================================================
-- アイテムマスタ
-- ============================================================
create table if not exists kenka_items (
  id text primary key,
  name text not null,
  category text not null check (category in ('recovery','buff','weapon','equip','custom','hideout','key')),
  effect_json jsonb not null default '{}',
  price int not null default 0,
  description text
);

alter table kenka_items enable row level security;
create policy "items_read" on kenka_items
  for select using (true);

-- ============================================================
-- プレイヤー所持品
-- ============================================================
create table if not exists kenka_player_items (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references kenka_players(id) on delete cascade,
  item_id text not null references kenka_items(id),
  quantity int not null default 1,
  equipped boolean not null default false,
  unique(player_id, item_id)
);

alter table kenka_player_items enable row level security;
create policy "player_items_own" on kenka_player_items
  for all using (auth.uid() = player_id);

-- ============================================================
-- 敵マスタ
-- ============================================================
create table if not exists kenka_enemies (
  id text primary key,
  name text not null,
  faction text not null,
  stats jsonb not null default '{}',
  ai_pattern text not null default 'balanced',
  drop_table jsonb not null default '[]',
  district_no int,
  is_boss boolean not null default false
);

alter table kenka_enemies enable row level security;
create policy "enemies_read" on kenka_enemies
  for select using (true);

-- ============================================================
-- 地区・ステージマスタ
-- ============================================================
create table if not exists kenka_stages (
  id text primary key,
  district_no int not null,
  name text not null,
  captured_default boolean not null default false,
  connections jsonb not null default '[]',
  lighting_mood text not null default 'evening',
  unlock_chapter int not null default 0
);

alter table kenka_stages enable row level security;
create policy "stages_read" on kenka_stages
  for select using (true);

-- ============================================================
-- ストーリー進行フラグ
-- ============================================================
create table if not exists kenka_story_progress (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references kenka_players(id) on delete cascade,
  chapter int not null default 0,
  flags jsonb not null default '{}',
  district_captured jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique(player_id)
);

alter table kenka_story_progress enable row level security;
create policy "story_progress_own" on kenka_story_progress
  for all using (auth.uid() = player_id);

-- ============================================================
-- ダチ（仲間）
-- ============================================================
create table if not exists kenka_dachi (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references kenka_players(id) on delete cascade,
  character_id text not null references kenka_characters(id),
  befriended_at timestamptz not null default now(),
  unique(player_id, character_id)
);

alter table kenka_dachi enable row level security;
create policy "dachi_own" on kenka_dachi
  for all using (auth.uid() = player_id);

-- ============================================================
-- アジト
-- ============================================================
create table if not exists kenka_hideout (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references kenka_players(id) on delete cascade,
  layout_json jsonb not null default '[]',
  comfort_level int not null default 0,
  unique(player_id)
);

alter table kenka_hideout enable row level security;
create policy "hideout_own" on kenka_hideout
  for all using (auth.uid() = player_id);

-- ============================================================
-- バトルログ
-- ============================================================
create table if not exists kenka_battle_records (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references kenka_players(id) on delete cascade,
  enemy_id text not null,
  result text not null check (result in ('win','lose','draw')),
  otokogi_delta int not null default 0,
  exp_gained int not null default 0,
  created_at timestamptz not null default now()
);

alter table kenka_battle_records enable row level security;
create policy "battle_records_own" on kenka_battle_records
  for all using (auth.uid() = player_id);

-- ============================================================
-- ランキング（連戦モード・ミニゲーム等）
-- ============================================================
create table if not exists kenka_rankings (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references kenka_players(id) on delete cascade,
  display_name text not null,
  mode text not null,
  score bigint not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table kenka_rankings enable row level security;
create policy "rankings_read" on kenka_rankings
  for select using (true);
create policy "rankings_insert_own" on kenka_rankings
  for insert with check (auth.uid() = player_id);

-- ============================================================
-- 実績・称号マスタ
-- ============================================================
create table if not exists kenka_achievements (
  id text primary key,
  code text unique not null,
  name text not null,
  description text not null,
  category text not null,
  hidden boolean not null default false,
  reward_json jsonb not null default '{}'
);

alter table kenka_achievements enable row level security;
create policy "achievements_read" on kenka_achievements
  for select using (true);

-- ============================================================
-- プレイヤー実績達成状況
-- ============================================================
create table if not exists kenka_player_achievements (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references kenka_players(id) on delete cascade,
  achievement_id text not null references kenka_achievements(id),
  unlocked_at timestamptz not null default now(),
  unique(player_id, achievement_id)
);

alter table kenka_player_achievements enable row level security;
create policy "player_achievements_own" on kenka_player_achievements
  for all using (auth.uid() = player_id);

-- ============================================================
-- 伝説帖マスタ
-- ============================================================
create table if not exists kenka_legends (
  id text primary key,
  code text unique not null,
  name text not null,
  lore text not null,
  unlock_condition text not null,
  category text not null default 'urban_legend'
);

alter table kenka_legends enable row level security;
create policy "legends_read" on kenka_legends
  for select using (true);

-- ============================================================
-- プレイヤー伝説解明状況
-- ============================================================
create table if not exists kenka_player_legends (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references kenka_players(id) on delete cascade,
  legend_id text not null references kenka_legends(id),
  discovered_at timestamptz not null default now(),
  unique(player_id, legend_id)
);

alter table kenka_player_legends enable row level security;
create policy "player_legends_own" on kenka_player_legends
  for all using (auth.uid() = player_id);

-- ============================================================
-- 武勇伝（サブクエスト）マスタ
-- ============================================================
create table if not exists kenka_subquests (
  id text primary key,
  district_no int not null,
  title text not null,
  summary text not null,
  reward_json jsonb not null default '{}',
  unlock_chapter int not null default 0
);

alter table kenka_subquests enable row level security;
create policy "subquests_read" on kenka_subquests
  for select using (true);

-- ============================================================
-- プレイヤーサブクエスト進行
-- ============================================================
create table if not exists kenka_player_subquests (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references kenka_players(id) on delete cascade,
  subquest_id text not null references kenka_subquests(id),
  status text not null check (status in ('not_started','in_progress','completed')),
  updated_at timestamptz not null default now(),
  unique(player_id, subquest_id)
);

alter table kenka_player_subquests enable row level security;
create policy "player_subquests_own" on kenka_player_subquests
  for all using (auth.uid() = player_id);

-- ============================================================
-- インデックス
-- ============================================================
create index if not exists idx_kenka_dachi_player on kenka_dachi(player_id);
create index if not exists idx_kenka_battle_records_player on kenka_battle_records(player_id);
create index if not exists idx_kenka_rankings_mode_score on kenka_rankings(mode, score desc);
create index if not exists idx_kenka_player_skills_player on kenka_player_skills(player_id);
create index if not exists idx_kenka_story_progress_player on kenka_story_progress(player_id);
