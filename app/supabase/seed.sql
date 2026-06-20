-- シードデータ — 喧嘩番長7

-- ============================================================
-- 地区マスタ
-- ============================================================
insert into kenka_stages (id, district_no, name, captured_default, connections, lighting_mood, unlock_chapter) values
('stage_arasunacho', 1, '荒砂町', false, '["stage_tekkiku"]', 'evening_harbor', 0),
('stage_tekkiku', 2, '鉄機区', false, '["stage_arasunacho","stage_shiramineward"]', 'rust_backlight', 2),
('stage_shiramineward', 3, '白峰学園区', false, '["stage_tekkiku","stage_yotakagai"]', 'clear_noon', 3),
('stage_yotakagai', 4, '夜鷹街', false, '["stage_shiramineward","stage_arashijou"]', 'neon_night', 4),
('stage_arashijou', 5, '嵐城跡', false, '["stage_yotakagai"]', 'moonlit_ruin', 5);

-- ============================================================
-- キャラクターマスタ
-- ============================================================
insert into kenka_characters (id, name, faction, role, base_stats, portrait, description, district_no) values
('player_souta', '神威 蒼太', '波嵐第七高校', 'playable',
  '{"hp":120,"sp":80,"atk":30,"def":20,"spirit":25,"spd":35,"level":1}',
  '/portraits/souta.png', '転校生番長。無関心を装う熱血漢', null),

('boss_tetsujii', '巌 鉄次', '荒砂連', 'boss',
  '{"hp":280,"sp":60,"atk":35,"def":30,"spirit":20,"spd":20,"level":5}',
  '/portraits/tetsuji.png', '荒砂連頭目。人情派おっさん番長', 1),

('boss_gantetu', '轟 ガンテツ', '鋼鉄牙', 'boss',
  '{"hp":420,"sp":40,"atk":55,"def":45,"spirit":15,"spd":15,"level":10}',
  '/portraits/gantetu.png', '元プロレスラー崩れ。130kgの鉄壁', 2),

('boss_reiji', '白銀 怜二', '白峰同盟', 'boss',
  '{"hp":320,"sp":90,"atk":40,"def":35,"spirit":40,"spd":40,"level":15}',
  '/portraits/reiji.png', '剣道3段の冷静な頭脳派', 3),

('boss_nui', '鴉 縫', '夜鷹衆', 'boss',
  '{"hp":380,"sp":100,"atk":45,"def":25,"spirit":35,"spd":60,"level":20}',
  '/portraits/nui.png', '舞踏のような動きのスピード型女傑', 4),

('boss_mizunoe', '鬼刃 壬', '嵐城鬼衆', 'boss',
  '{"hp":550,"sp":80,"atk":70,"def":60,"spirit":50,"spd":25,"level":28}',
  '/portraits/mizunoe.png', '無言の巨漢。圧倒的破壊力', 5),

('boss_tenra', '天羅', '波嵐の頂点', 'boss',
  '{"hp":800,"sp":150,"atk":90,"def":70,"spirit":80,"spd":70,"level":40}',
  '/portraits/tenra.png', '5年前の覇者。真のラスボス', 5),

('npc_soosuke', '多岐 颯介', '荒砂町', 'npc',
  '{"hp":180,"sp":60,"atk":28,"def":18,"spirit":22,"spd":38,"level":3}',
  '/portraits/soosuke.png', '荒砂出身の一匹狼。最初のダチ', 1),

('npc_rei', '神城 玲', '白峰学園区', 'npc',
  '{"hp":120,"sp":80,"atk":18,"def":15,"spirit":35,"spd":42,"level":8}',
  '/portraits/rei.png', '情報通の秀才系不良女子', 3);

-- ============================================================
-- 技マスタ
-- ============================================================
insert into kenka_skills (id, name, type, power_rate, sp_cost, is_super, description, combo_input) values
('skill_weak1', '荒波突き', 'weak', 0.8, 0, false, '素早い直突き3連', ARRAY['square','square','square']),
('skill_weak2', '砂嵐薙ぎ', 'weak', 0.9, 0, false, '横薙ぎの連打', ARRAY['square','square','triangle']),
('skill_strong1', '神威砕き', 'strong', 1.8, 10, false, '渾身の一撃', ARRAY['triangle']),
('skill_strong2', '波砕拳', 'strong', 2.2, 15, false, '溜めからの強烈な拳', ARRAY['hold_triangle']),
('skill_grab1', '荒砂投げ', 'grab', 1.5, 8, false, '掴んで投げる', ARRAY['circle']),
('skill_counter1', '神威返し', 'counter', 2.5, 20, false, '相手の攻撃をはじき返す', ARRAY['L1','square']),
('skill_area1', '荒砂嵐', 'area', 1.6, 30, false, '周囲全員に範囲攻撃', ARRAY['L1','triangle']),
('skill_super_souta', '神威の一迅', 'super', 5.0, 50, true, '無音の超加速→収束爆裂拳。必殺技', ARRAY['L2','R2','triangle']),
('skill_local_arasuna', '荒砂必滅陣', 'super', 4.0, 40, true, '荒砂連から継承した地元スペシャル', ARRAY['L2','R2','square']),
('skill_local_tekkiku', '鋼鉄魂砕き', 'super', 5.5, 45, true, '鋼鉄牙から継承した豪快連打', ARRAY['L2','R2','circle']),
('skill_local_shiramine', '白峰一刀流', 'super', 4.8, 42, true, '白峰同盟から継承した連続技', ARRAY['L2','R2','cross']),
('skill_local_yotaka', '夜鷹乱舞', 'super', 4.5, 40, true, '夜鷹衆から継承した乱舞連撃', ARRAY['L2','L1','triangle']),
('skill_local_arashi', '嵐城鬼技・滅', 'super', 6.5, 55, true, '嵐城鬼衆から継承した最強技', ARRAY['L2','L1','R1','triangle']);

-- ============================================================
-- アイテムマスタ
-- ============================================================
insert into kenka_items (id, name, category, effect_json, price, description) values
('item_onigiri', 'デカおにぎり', 'recovery', '{"hp":50}', 100, 'コンビニのおにぎり。腹が膨れてHPが回復'),
('item_energy_drink', '漢気ドリンク', 'recovery', '{"hp":30,"sp":40}', 180, '気合ゲージも一緒に回復する謎ドリンク'),
('item_ramen', '波嵐ラーメン特盛', 'recovery', '{"hp":150}', 350, '荒砂町の名店の特盛。元気が出る'),
('item_iron_pipe', '鉄パイプ', 'weapon', '{"atk_bonus":20,"otokogi_per_use":-5,"durability":10}', 0, '攻撃力大幅増だが使うたびに男気が下がる'),
('item_atk_up', 'テンション錠', 'buff', '{"atk_rate":1.5,"duration":3}', 300, 'テンションが上がって3ターン攻撃力1.5倍'),
('item_def_up', '根性バンデージ', 'buff', '{"def_rate":1.5,"duration":3}', 250, '気合いで傷を押さえ込む。3ターン防御力1.5倍'),
('item_speed_up', '猛ダッシュ剤', 'buff', '{"spd_rate":2.0,"duration":2}', 400, '2ターン移動速度2倍'),
('item_lace_gakuran', '白刺繍学ラン', 'custom', '{"atk_bonus":5,"display_name":"白刺繍学ラン"}', 2000, '背中に白糸の代紋刺繍入り学ラン'),
('item_riizento', 'リーゼントセット', 'custom', '{"spirit_bonus":10,"display_name":"リーゼントヘア"}', 1500, '盛り上がったリーゼントは気合が違う'),
('item_bench', 'ボロベンチ', 'hideout', '{"comfort":5,"item_type":"furniture"}', 500, 'アジトに置くと快適度が上がる'),
('item_sandbag', 'サンドバッグ', 'hideout', '{"atk_training":3,"item_type":"training"}', 1200, 'アジトに設置すると攻撃訓練ができる');

-- ============================================================
-- 敵マスタ（ザコ敵）
-- ============================================================
insert into kenka_enemies (id, name, faction, stats, ai_pattern, drop_table, district_no, is_boss) values
('enemy_arasuna_mob1', '荒砂連ザコ', '荒砂連', '{"hp":80,"atk":18,"def":12,"spd":22}', 'aggressive',
  '[{"item_id":"item_onigiri","rate":0.3}]', 1, false),
('enemy_arasuna_mob2', '荒砂連中堅', '荒砂連', '{"hp":120,"atk":22,"def":16,"spd":20}', 'balanced',
  '[{"item_id":"item_energy_drink","rate":0.2}]', 1, false),
('enemy_tekkiku_mob1', '鋼鉄牙ザコ', '鋼鉄牙', '{"hp":140,"atk":28,"def":22,"spd":15}', 'aggressive',
  '[{"item_id":"item_iron_pipe","rate":0.4}]', 2, false),
('enemy_shiramine_mob1', '白峰同盟生徒', '白峰同盟', '{"hp":100,"atk":22,"def":18,"spd":28}', 'defensive',
  '[{"item_id":"item_atk_up","rate":0.15}]', 3, false),
('enemy_yotaka_mob1', '夜鷹衆チンピラ', '夜鷹衆', '{"hp":110,"atk":25,"def":15,"spd":35}', 'aggressive',
  '[{"item_id":"item_energy_drink","rate":0.25}]', 4, false),
('enemy_arashi_mob1', '嵐城鬼衆精鋭', '嵐城鬼衆', '{"hp":200,"atk":38,"def":32,"spd":22}', 'balanced',
  '[{"item_id":"item_ramen","rate":0.1}]', 5, false),
('boss_enemy_tetsuji', '巌 鉄次', '荒砂連', '{"hp":280,"atk":35,"def":30,"spd":20}', 'boss',
  '[{"item_id":"item_ramen","rate":1.0},{"skill_id":"skill_local_arasuna","rate":1.0}]', 1, true),
('boss_enemy_gantetu', '轟 ガンテツ', '鋼鉄牙', '{"hp":420,"atk":55,"def":45,"spd":15}', 'boss',
  '[{"skill_id":"skill_local_tekkiku","rate":1.0}]', 2, true),
('boss_enemy_reiji', '白銀 怜二', '白峰同盟', '{"hp":320,"atk":40,"def":35,"spd":40}', 'boss',
  '[{"skill_id":"skill_local_shiramine","rate":1.0}]', 3, true),
('boss_enemy_nui', '鴉 縫', '夜鷹衆', '{"hp":380,"atk":45,"def":25,"spd":60}', 'boss',
  '[{"skill_id":"skill_local_yotaka","rate":1.0}]', 4, true),
('boss_enemy_mizunoe', '鬼刃 壬', '嵐城鬼衆', '{"hp":550,"atk":70,"def":60,"spd":25}', 'boss',
  '[{"skill_id":"skill_local_arashi","rate":1.0}]', 5, true),
('boss_enemy_tenra', '天羅', '波嵐の頂点', '{"hp":800,"atk":90,"def":70,"spd":70}', 'boss',
  '[{"item_id":"item_lace_gakuran","rate":1.0}]', 5, true);

-- ============================================================
-- 実績マスタ
-- ============================================================
insert into kenka_achievements (id, code, name, description, category, hidden, reward_json) values
('ach_first_fight', 'first_fight', '喧嘩道を歩む者', '初めての喧嘩に勝利した', 'battle', false, '{}'),
('ach_first_dachi', 'first_dachi', '絆の芽生え', '初めてのダチを作った', 'bond', false, '{}'),
('ach_10_dachi', 'ten_dachi', '波嵐の義兄弟', '10人のダチを作った', 'bond', false, '{"sp_bonus":10}'),
('ach_50_dachi', 'fifty_dachi', '漢の器', '50人のダチを作った', 'bond', false, '{"title":"漢の器"}'),
('ach_100_dachi', 'hundred_dachi', '波嵐の中心', '100人のダチを作った', 'bond', true, '{"title":"波嵐の中心","unlock_super":true}'),
('ach_no_weapon', 'no_weapon', '純粋なる拳', '武器を一切使わずに第1章をクリアした', 'style', false, '{"otokogi_bonus":20}'),
('ach_chapter1', 'chapter1_clear', '荒砂に刻む名', '第1章をクリアした', 'story', false, '{}'),
('ach_all_chapters', 'all_chapters', '波嵐制覇', '全章をクリアした', 'story', false, '{"title":"波嵐の番長"}'),
('ach_tenra', 'beat_tenra', '伝説の番長', '天羅を撃破した（真エンド）', 'story', true, '{"title":"波嵐烈伝の男"}'),
('ach_no_damage', 'no_damage_win', '無傷の漢', 'ノーダメージで任意のボスを撃破した', 'battle', false, '{"title":"無傷の漢"}'),
('ach_shibu_max', 'shibu_max', '最硬派番長', '男気値を100にした', 'style', false, '{"title":"硬派の極み"}'),
('ach_combo_30', 'combo_30', '嵐の乱打', '30コンボを達成した', 'battle', false, '{}');

-- ============================================================
-- 伝説帖マスタ
-- ============================================================
insert into kenka_legends (id, code, name, lore, unlock_condition, category) values
('legend_tenra_disappear', 'tenra_disappear', '天羅失踪の真相',
  '5年前の波嵐制覇祭で覇者となった男・天羅。しかし彼はその夜忽然と姿を消した。街では「本物の番長を探しに旅に出た」という噂と「嵐城の奥に封印された」という噂が流れている。',
  '5地区の情報収集イベントを全て達成', 'urban_legend'),
('legend_seven_shadow', 'seven_shadow', '七つの影番長',
  '波嵐の各地区には表の番長とは別に「影番長」が存在するという。深夜・特定の天候・特定のメンチ顔の組み合わせで出現するとされる謎の存在たち。',
  '各地区の深夜限定ボスを全員撃破', 'secret_boss'),
('legend_arashijou_curse', 'arashijou_curse', '嵐城の呪い',
  '嵐城跡の最奥には封印された何かがある。かつてここで行われた最後の決戦の痕跡と、誰かが遺した謎の落書き「強さの果てに何がある」が今も残る。',
  '嵐城跡の全隠しエリアを発見', 'history'),
('legend_past_bancho', 'past_bancho_ob', '過去の番長たち',
  '波嵐市の古い不良仲間によると、かつてこの地を訪れた外の番長たちの話が残る。「一人は沿線を制した男」「一人は全国を旅した旅人番長」——彼らの足跡が波嵐にも残っているかもしれない。',
  '全地区のOBキャライベントをクリア', 'homage'),
('legend_hidden_master', 'hidden_master', '地下神殿の番長',
  '荒砂町の古い港の下、波嵐市が港町だった時代の地下遺構。かつてそこで誰かが修行したという痕跡がある。全ての伝説を解明した者だけがその場所に辿り着けるという。',
  '全伝説の解明・全章クリア・全ダチ達成', 'true_final');

-- ============================================================
-- 武勇伝（サブクエスト）マスタ
-- ============================================================
insert into kenka_subquests (id, district_no, title, summary, reward_json, unlock_chapter) values
('quest_arasuna1', 1, '漁師の恩返し', '荒砂町の漁師・木島が若い不良に絡まれている。助けてやれ', '{"exp":200,"item":"item_ramen","otokogi":15}', 0),
('quest_arasuna2', 1, '多岐颯介との出会い', '路地で一人で多数の敵と戦っている男がいる。どうする？', '{"dachi":"npc_soosuke","exp":300}', 0),
('quest_arasuna3', 1, '荒砂の犬', '荒砂町の公園で捨てられた子犬を見つけた。拾って育てるか？', '{"unlock_dog_system":true,"exp":100}', 1),
('quest_tekkiku1', 2, '廃工場の秘密', '鉄機区の廃工場に子どもが迷い込んだという噂。助けに行け', '{"exp":400,"item":"item_def_up","otokogi":20}', 2),
('quest_tekkiku2', 2, 'ガンテツの過去', '轟ガンテツが若い頃の話を聞いた。彼を正面から倒し、証明しろ', '{"exp":500,"skill_hint":"skill_local_tekkiku"}', 2),
('quest_shiramine1', 3, '白峰の勉強会', '白峰学園区の生徒が勉強を教えてほしいと言ってきた。怜二の弟子だ', '{"exp":300,"item":"item_atk_up","dachi_hint":true}', 3),
('quest_shiramine2', 3, '神城 玲の依頼', '玲が情報屋として奇妙な依頼を持ってきた。波嵐の裏情報に繋がる', '{"exp":500,"story_flag":"rei_quest_done"}', 3),
('quest_yotaka1', 4, '夜鷹の歌姫', '夜鷹街のスナックで歌っている女性が絡まれている。助けてやれ', '{"exp":400,"item":"item_speed_up","otokogi":10}', 4),
('quest_yotaka2', 4, '縫の試練', '縫から「本物かどうか試したい」と一対一の勝負を申し込まれた', '{"exp":600,"dachi_hint":true}', 4),
('quest_arashi1', 5, '嵐城の守り人', '嵐城跡を守る老人が倒れている。助けながら話を聞くと、天羅の手がかりが…', '{"exp":800,"legend_unlock":"legend_arashijou_curse"}', 5),
('quest_arashi2', 5, '真の番長とは', '壬を倒した後、彼から「番長の定義」を問われる。答えは行動で示せ', '{"exp":1000,"otokogi":30,"title_hint":true}', 5);
