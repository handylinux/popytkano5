// components/screens/CharacterScreen/logic/ammoLogic.js
import { calculateDamage, parseFormula } from './Calculator.js';

// Импортируем все данные по оружию и патронам
import lightWeapons from '../../../../assets/Equipment/light_weapons.json';
import heavyWeapons from '../../../../assets/Equipment/heavy_weapons.json';
import energyWeapons from '../../../../assets/Equipment/energy_weapons.json';
import meleeWeapons from '../../../../assets/Equipment/melee_weapons.json';
import ammoData from '../../../../assets/Equipment/ammoData.json'; // <--- ИМПОРТ

// Создаем единый массив со всем оружием для удобного поиска
const allWeapons = [
  ...lightWeapons,
  ...heavyWeapons,
  ...energyWeapons,
  ...meleeWeapons,
];

/**
 * Находит оружие по названию и возвращает тип его патронов.
 * @param {string} weaponName - Название оружия.
 * @returns {string|null} Тип патронов или null.
 */
function getAmmoTypeForWeapon(weaponName) {
  const weapon = allWeapons.find(w => w.Название === weaponName);
  return weapon?.Патроны || null;
}

/**
 * Парсит формулу вида "X+Nfn{CD} <tag>" или "N <tag>".
 * @param {string} lootFormula - Формула для лута.
 * @returns {{quantityFormula: string, tag: string}|null}
 */
function parseLootFormula(lootFormula) {
    if (!lootFormula || typeof lootFormula !== 'string') return null;
    
    const regex = /^(.*?)<(\w+)>$/;
    const match = lootFormula.match(regex);

    if (match) {
        return {
            quantityFormula: match[1].trim(),
            tag: match[2].toLowerCase(),
        };
    }
    return null;
}

/**
 * Рассчитывает конкретный предмет и его количество на основе формулы лута.
 * @param {string} lootFormula - Формула, например "5+5fn{CD} <ammo>".
 * @param {object} context - Контекст, необходимый для некоторых тегов. Например, { weaponName: '10-мм Пистолет' } для тега <ammo>.
 * @returns {{name: string, quantity: number, type: string, price?: number, weight?: any, rarity?: number}|null}
 */
export function resolveLoot(lootFormula, context) {
    const parsed = parseLootFormula(lootFormula);
    if (!parsed) {
        console.error(`Неверный формат формулы лута: "${lootFormula}"`);
        return null;
    }

    const { quantityFormula, tag } = parsed;
    
    // Используем parseFormula из Calculator.js для разбора части с количеством
    const { baseValue, diceCount } = parseFormula(quantityFormula);
    const { finalValue: quantity } = calculateDamage(baseValue, diceCount);

    switch (tag) {
        case 'ammo':
            if (!context?.weaponName) {
                console.error("Для тега <ammo> требуется 'weaponName' в контексте.");
                return null;
            }
            const ammoType = getAmmoTypeForWeapon(context.weaponName);
            if (!ammoType) return null; // Оружие не использует патроны

            // Находим полные данные о боеприпасе в ammoData.json
            const ammoDetails = ammoData.find(ammo => ammo.name === ammoType);

            if (!ammoDetails) {
                console.warn(`Детали для боеприпаса "${ammoType}" не найдены в ammoData.json`);
                return { name: ammoType, quantity, type: 'ammo' }; // Возвращаем базовые данные, если детали не найдены
            }
            
            // Объединяем детали из файла с рассчитанным количеством
            return { 
                ...ammoDetails, 
                Название: ammoDetails.name, // Убедимся, что есть поле "Название"
                Цена: ammoDetails.price, // Убедимся, что есть поле "Цена"
                Вес: ammoDetails.weight, // Убедимся, что есть поле "Вес"
                quantity, 
            };

        case 'caps':
            return { name: 'Крышки', quantity, type: 'currency', Цена: 1, Вес: 0 };

        case 'basicmaterial':
            return { name: 'Базовые материалы', quantity, type: 'material' };

        default:
            console.warn(`Неизвестный тег в формуле лута: <${tag}>`);
            return null;
    }
} 