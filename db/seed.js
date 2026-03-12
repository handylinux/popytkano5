import { runBatch, getRowCount, getAll, runQuery } from './Database';

import lightWeaponsData from '../assets/Equipment/light_weapons.json';
import heavyWeaponsData from '../assets/Equipment/heavy_weapons.json';
import energyWeaponsData from '../assets/Equipment/energy_weapons.json';
import meleeWeaponsData from '../assets/Equipment/melee_weapons.json';
import lightWeaponModsData from '../assets/Equipment/light_weapon_mods.json';
import armorData from '../assets/Equipment/armor.json';
import clothesData from '../assets/Equipment/Clothes.json';
import chemsData from '../assets/Equipment/chems.json';
import ammoData from '../assets/Equipment/ammoData.json';
import miscData from '../assets/Equipment/miscellaneous.json';
import perksData from '../assets/Perks/perks.json';

function slugify(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, '')
    .trim()
    .replace(/\s+/g, '_');
}

function safeStr(v) {
  if (v === null || v === undefined) return null;
  return String(v);
}

function safeNum(v) {
  if (v === null || v === undefined || v === '—' || v === '-') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

async function seedWeapons() {
  const count = await getRowCount('weapons');
  if (count > 0) return;

  const statements = [];

  const addWeapon = (weapon, weaponType) => {
    const id = weapon.code || slugify(weapon['Название']) + '_' + weaponType;
    statements.push({
      sql: `INSERT OR REPLACE INTO weapons
        (id, name, weapon_type, damage, damage_effects, damage_type, fire_rate, qualities, weight, price, rarity, ammo, mods_config)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        id,
        weapon['Название'] || weapon.name || '',
        weaponType,
        safeNum(weapon['Урон']),
        safeStr(weapon['Эффекты']),
        safeStr(weapon['Тип урона']),
        safeStr(weapon['Скорость стрельбы']),
        safeStr(weapon['Качества']),
        safeStr(weapon['Вес']),
        safeStr(weapon['Цена']),
        safeStr(weapon['Редкость']),
        safeStr(weapon['Патроны']),
        weapon['Модификации'] ? JSON.stringify(weapon['Модификации']) : null,
      ],
    });
  };

  lightWeaponsData.forEach(w => addWeapon(w, 'light'));
  heavyWeaponsData.forEach(w => addWeapon(w, 'heavy'));
  energyWeaponsData.forEach(w => addWeapon(w, 'energy'));
  meleeWeaponsData.forEach(w => addWeapon(w, 'melee'));

  if (statements.length > 0) await runBatch(statements);
}

async function seedWeaponMods() {
  const count = await getRowCount('weapon_mods');
  if (count > 0) return;

  const statements = [];
  const modsObj = lightWeaponModsData['Модификации'] || {};

  Object.entries(modsObj).forEach(([category, modsInCat]) => {
    Object.entries(modsInCat).forEach(([modName, modData]) => {
      const id = `${slugify(category)}_${slugify(modName)}_light`;
      statements.push({
        sql: `INSERT OR REPLACE INTO weapon_mods
          (id, name, category, weapon_type, prefix, effects, weight, price, required_perks)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [
          id,
          modName,
          category,
          'light',
          safeStr(modData['Префикс имени']),
          safeStr(modData['Эффекты']),
          safeNum(modData['Вес']),
          safeNum(modData['Цена']),
          modData['Перки'] ? JSON.stringify(modData['Перки']) : '[]',
        ],
      });
    });
  });

  if (statements.length > 0) await runBatch(statements);
}

async function seedPerks() {
  const count = await getRowCount('perks');
  if (count > 0) return;

  const statements = [];
  perksData.forEach(perk => {
    statements.push({
      sql: `INSERT INTO perks (perk_name, rank, max_rank, requirements, description, level_increase)
            VALUES (?, ?, ?, ?, ?, ?)`,
      params: [
        perk.perk_name,
        perk.rank || 1,
        perk.max_rank || 1,
        perk.requirements ? JSON.stringify(perk.requirements) : null,
        perk.description || '',
        perk.level_increase ?? null,
      ],
    });
  });

  if (statements.length > 0) await runBatch(statements);
}

async function seedItems() {
  const count = await getRowCount('items');
  if (count > 0) return;

  const statements = [];

  const addItem = (item, itemType, category = null, subtype = null) => {
    const name = item.name || item['Название'] || '';
    const id = slugify(name) + '_' + itemType + (category ? '_' + slugify(category) : '');
    statements.push({
      sql: `INSERT OR REPLACE INTO items
        (id, name, item_type, item_subtype, phys_dr, energy_dr, rad_dr, protected_area, clothing_type, find_formula, weight, price, rarity, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        id,
        name,
        itemType,
        subtype,
        safeNum(item['Физ.СУ']),
        safeNum(item['Энрг.СУ']),
        safeNum(item['Рад.СУ']),
        safeStr(item['protected_area']),
        safeStr(item['clothingType']),
        safeStr(item['find_formula']),
        safeStr(item['weight'] ?? item['Вес']),
        safeStr(item['price'] ?? item['Цена']),
        safeStr(item['rarity'] ?? item['Редкость']),
        category,
      ],
    });
  };

  armorData.armor.forEach(group => {
    group.items.forEach(item => addItem(item, 'armor', group.type));
  });

  clothesData.clothes.forEach(group => {
    group.items.forEach(item => addItem(item, 'clothing', group.type, item.clothingType));
  });

  chemsData.forEach(item => {
    const name = item['Название'] || '';
    const id = 'chem_' + slugify(name);
    statements.push({
      sql: `INSERT OR REPLACE INTO items (id, name, item_type, weight, price, rarity)
            VALUES (?, ?, ?, ?, ?, ?)`,
      params: [id, name, 'chem', safeStr(item['Вес']), safeStr(item['Цена']), safeStr(item['Редкость'])],
    });
  });

  ammoData.forEach(item => {
    const id = 'ammo_' + slugify(item.name);
    statements.push({
      sql: `INSERT OR REPLACE INTO items (id, name, item_type, find_formula, weight, price, rarity)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      params: [id, item.name, 'ammo', item.find_formula, safeStr(item.weight), safeStr(item.price), safeStr(item.rarity)],
    });
  });

  miscData.miscellaneous.forEach(group => {
    group.items.forEach(item => addItem(item, item.itemType || 'misc', group.type));
  });

  if (statements.length > 0) await runBatch(statements);
}

export async function seedDatabase(isFirstRun) {
  if (!isFirstRun) {
    const weaponCount = await getRowCount('weapons');
    const perkCount = await getRowCount('perks');
    if (weaponCount > 0 && perkCount > 0) return;
  }
  await Promise.all([
    seedWeapons(),
    seedWeaponMods(),
    seedPerks(),
    seedItems(),
  ]);
}
