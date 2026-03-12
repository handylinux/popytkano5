import { Platform } from 'react-native';

let adapter;

if (Platform.OS === 'web') {
  adapter = require('./adapters/WebAdapter');
} else {
  adapter = require('./adapters/SQLiteAdapter');
}

export const { initDatabase, runQuery, getAll, getFirst, runBatch, tableExists, getRowCount } = adapter;

export async function getWeapons(weaponType = null) {
  if (weaponType) {
    return getAll('SELECT * FROM weapons WHERE weapon_type = ?', [weaponType]);
  }
  return getAll('SELECT * FROM weapons');
}

export async function getWeaponById(id) {
  return getFirst('SELECT * FROM weapons WHERE id = ?', [id]);
}

export async function getWeaponMods(weaponType = null, category = null) {
  if (weaponType && category) {
    return getAll(
      'SELECT * FROM weapon_mods WHERE weapon_type = ? AND category = ?',
      [weaponType, category]
    );
  }
  if (weaponType) {
    return getAll('SELECT * FROM weapon_mods WHERE weapon_type = ?', [weaponType]);
  }
  return getAll('SELECT * FROM weapon_mods');
}

export async function getPerks(perkName = null) {
  if (perkName) {
    return getAll('SELECT * FROM perks WHERE perk_name = ? ORDER BY rank', [perkName]);
  }
  return getAll('SELECT * FROM perks ORDER BY perk_name, rank');
}

export async function getItems(itemType = null) {
  if (itemType) {
    return getAll('SELECT * FROM items WHERE item_type = ?', [itemType]);
  }
  return getAll('SELECT * FROM items ORDER BY item_type, name');
}

export async function getItemByName(name) {
  return getFirst('SELECT * FROM items WHERE name = ?', [name]);
}

export async function saveCharacter(id, name, level, originName, data) {
  const now = Date.now();
  const existing = await getFirst('SELECT id FROM characters WHERE id = ?', [id]);
  if (existing) {
    await runQuery(
      'UPDATE characters SET name = ?, level = ?, origin_name = ?, data = ?, updated_at = ? WHERE id = ?',
      [name, level, originName, typeof data === 'string' ? data : JSON.stringify(data), now, id]
    );
  } else {
    await runQuery(
      'INSERT INTO characters (id, name, level, origin_name, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, level, originName, typeof data === 'string' ? data : JSON.stringify(data), now, now]
    );
  }
}

export async function loadCharacterById(id) {
  const row = await getFirst('SELECT * FROM characters WHERE id = ?', [id]);
  if (!row) return null;
  return {
    ...row,
    data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
  };
}

export async function getCharactersList() {
  const rows = await getAll('SELECT id, name, level, origin_name, created_at, updated_at FROM characters ORDER BY created_at DESC');
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    level: r.level,
    originName: r.origin_name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function deleteCharacter(id) {
  await runQuery('DELETE FROM characters WHERE id = ?', [id]);
}

export async function getPerkEffects(perkName, rank = 1) {
  return getAll(
    'SELECT * FROM perk_effects WHERE perk_name = ? AND perk_rank = ?',
    [perkName, rank]
  );
}
