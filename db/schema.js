export const SCHEMA_VERSION = 1;

export const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS schema_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS weapons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    weapon_type TEXT NOT NULL,
    damage INTEGER,
    damage_effects TEXT,
    damage_type TEXT,
    fire_rate TEXT,
    qualities TEXT,
    weight TEXT,
    price TEXT,
    rarity TEXT,
    ammo TEXT,
    mods_config TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS weapon_mods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    weapon_type TEXT NOT NULL,
    prefix TEXT,
    effects TEXT,
    weight REAL,
    price INTEGER,
    required_perks TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS perks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    perk_name TEXT NOT NULL,
    rank INTEGER NOT NULL DEFAULT 1,
    max_rank INTEGER NOT NULL DEFAULT 1,
    requirements TEXT,
    description TEXT,
    level_increase INTEGER
  )`,

  `CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    item_type TEXT NOT NULL,
    item_subtype TEXT,
    phys_dr INTEGER,
    energy_dr INTEGER,
    rad_dr INTEGER,
    protected_area TEXT,
    clothing_type TEXT,
    find_formula TEXT,
    weight TEXT,
    price TEXT,
    rarity TEXT,
    category TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    origin_name TEXT,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS perk_effects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    perk_name TEXT NOT NULL,
    perk_rank INTEGER NOT NULL DEFAULT 1,
    target_type TEXT NOT NULL,
    target_id TEXT,
    condition_field TEXT,
    condition_op TEXT,
    condition_value TEXT,
    effect_field TEXT,
    effect_op TEXT,
    effect_value TEXT,
    notes TEXT
  )`,
];
