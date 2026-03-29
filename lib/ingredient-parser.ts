import Fraction from "fraction.js";
import type { Ingredient, ShoppingListItem } from "./types";

// ─── Imperial → Metric conversion ────────────────────────────────────────────
// Volume conversions to ml
const VOLUME_TO_ML: Record<string, number> = {
  tsp: 5,
  teaspoon: 5,
  teaspoons: 5,
  tbsp: 15,
  tablespoon: 15,
  tablespoons: 15,
  "fl oz": 30,
  "fluid oz": 30,
  "fluid ounce": 30,
  "fluid ounces": 30,
  cup: 240,
  cups: 240,
  pt: 473,
  pint: 473,
  pints: 473,
  qt: 946,
  quart: 946,
  quarts: 946,
  gal: 3785,
  gallon: 3785,
  gallons: 3785,
};

// Weight conversions to grams
const WEIGHT_TO_G: Record<string, number> = {
  oz: 28,
  ounce: 28,
  ounces: 28,
  lb: 454,
  lbs: 454,
  pound: 454,
  pounds: 454,
};

// Already metric units — keep as-is
const METRIC_UNITS = new Set([
  "ml", "milliliter", "milliliters", "millilitre", "millilitres",
  "l", "liter", "liters", "litre", "litres",
  "g", "gram", "grams", "gr",
  "kg", "kilogram", "kilograms",
  "mg", "milligram", "milligrams",
]);

function toMetric(quantity: number, unit: string): { quantity: number; unit: string } {
  const normalized = unit.toLowerCase().trim();

  if (METRIC_UNITS.has(normalized)) {
    return { quantity, unit: normalizeMetricUnit(normalized) };
  }

  if (normalized in VOLUME_TO_ML) {
    const ml = quantity * VOLUME_TO_ML[normalized];
    if (ml >= 1000) {
      return { quantity: round(ml / 1000, 3), unit: "l" };
    }
    return { quantity: round(ml, 1), unit: "ml" };
  }

  if (normalized in WEIGHT_TO_G) {
    const g = quantity * WEIGHT_TO_G[normalized];
    if (g >= 1000) {
      return { quantity: round(g / 1000, 3), unit: "kg" };
    }
    return { quantity: round(g, 1), unit: "g" };
  }

  // Unknown unit — return as-is
  return { quantity, unit };
}

function normalizeMetricUnit(unit: string): string {
  if (["milliliter", "milliliters", "millilitre", "millilitres"].includes(unit)) return "ml";
  if (["liter", "liters", "litre", "litres"].includes(unit)) return "l";
  if (["gram", "grams", "gr"].includes(unit)) return "g";
  if (["kilogram", "kilograms"].includes(unit)) return "kg";
  if (["milligram", "milligrams"].includes(unit)) return "mg";
  return unit;
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ─── Fraction parsing ─────────────────────────────────────────────────────────
const UNICODE_FRACTIONS: Record<string, string> = {
  "½": "1/2", "⅓": "1/3", "⅔": "2/3", "¼": "1/4", "¾": "3/4",
  "⅕": "1/5", "⅖": "2/5", "⅗": "3/5", "⅘": "4/5",
  "⅙": "1/6", "⅚": "5/6", "⅛": "1/8", "⅜": "3/8", "⅝": "5/8", "⅞": "7/8",
};

function normalizeQuantityStr(s: string): string {
  let out = s;
  for (const [unicode, ascii] of Object.entries(UNICODE_FRACTIONS)) {
    out = out.replace(new RegExp(unicode, "g"), ascii);
  }
  return out;
}

function parseQuantity(s: string): number | null {
  const normalized = normalizeQuantityStr(s).trim();

  // "1 1/2" or "1½"
  const mixed = normalized.match(/^(\d+)\s+(\d+\/\d+)$/);
  if (mixed) {
    try {
      return new Fraction(mixed[1]).add(new Fraction(mixed[2])).valueOf();
    } catch { /* fall through */ }
  }

  try {
    return new Fraction(normalized).valueOf();
  } catch { /* fall through */ }

  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

// ─── Known units for regex matching ──────────────────────────────────────────
const ALL_UNITS = [
  ...Object.keys(VOLUME_TO_ML),
  ...Object.keys(WEIGHT_TO_G),
  ...Array.from(METRIC_UNITS),
  "fl oz", "fluid oz", "fluid ounce", "fluid ounces",
].sort((a, b) => b.length - a.length); // longest first for greedy match

const UNIT_PATTERN = ALL_UNITS.map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

// Main ingredient parse regex: optional quantity, optional unit, then name
const INGREDIENT_RE = new RegExp(
  `^([\\d\\s½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞/.-]*)\\s*(${UNIT_PATTERN})\\.?\\s+(.+)$`,
  "i"
);

const QUANTITY_ONLY_RE = /^([\d\s½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞/.-]+)\s+(.+)$/;

// Words to strip from ingredient names for grouping
const NOISE_WORDS = new Set([
  "fresh", "frozen", "dried", "chopped", "sliced", "diced", "minced", "grated",
  "crushed", "peeled", "cooked", "raw", "large", "small", "medium", "extra",
  "fine", "finely", "roughly", "thinly", "thick", "lean", "boneless", "skinless",
  "whole", "halved", "quartered", "rinsed", "drained", "packed", "heaping",
  "lightly", "firmly", "level", "sifted",
]);

export function parseIngredient(raw: string): Ingredient {
  const text = raw.trim();

  const withUnits = INGREDIENT_RE.exec(text);
  if (withUnits) {
    const [, qtyStr, unitStr, nameStr] = withUnits;
    const parsedQty = parseQuantity(qtyStr.trim());
    const name = normalizeIngredientName(nameStr);

    if (parsedQty !== null) {
      const { quantity, unit } = toMetric(parsedQty, unitStr);
      return { raw: text, name, quantity, unit };
    }
  }

  const withQtyOnly = QUANTITY_ONLY_RE.exec(text);
  if (withQtyOnly) {
    const [, qtyStr, nameStr] = withQtyOnly;
    const parsedQty = parseQuantity(qtyStr.trim());
    if (parsedQty !== null) {
      return { raw: text, name: normalizeIngredientName(nameStr), quantity: parsedQty, unit: null };
    }
  }

  return { raw: text, name: normalizeIngredientName(text), quantity: null, unit: null };
}

function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // remove parenthetical notes
    .replace(/,.*$/, "")     // remove everything after comma
    .split(/\s+/)
    .filter((word) => !NOISE_WORDS.has(word))
    .join(" ")
    .trim();
}

// ─── Shopping list merger ─────────────────────────────────────────────────────
export function buildShoppingList(ingredientArrays: Ingredient[][]): ShoppingListItem[] {
  const all = ingredientArrays.flat();
  const grouped = new Map<string, { items: Ingredient[] }>();

  for (const ing of all) {
    const existing = grouped.get(ing.name);
    if (existing) {
      existing.items.push(ing);
    } else {
      grouped.set(ing.name, { items: [ing] });
    }
  }

  const result: ShoppingListItem[] = [];

  for (const [name, { items }] of grouped) {
    // Try to merge items with same unit
    const byUnit = new Map<string, number>();
    const noUnit: string[] = [];

    for (const item of items) {
      if (item.quantity === null || item.unit === null) {
        noUnit.push(item.raw);
        continue;
      }
      const key = item.unit.toLowerCase();
      byUnit.set(key, (byUnit.get(key) ?? 0) + item.quantity);
    }

    if (byUnit.size > 0) {
      for (const [unit, quantity] of byUnit) {
        result.push({
          name,
          quantity: round(quantity, 3),
          unit,
          entries: items.map((i) => i.raw),
        });
      }
    } else {
      result.push({
        name,
        quantity: null,
        unit: null,
        entries: noUnit,
      });
    }
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export function formatShoppingItem(item: ShoppingListItem): string {
  if (item.quantity !== null && item.unit) {
    const qty = formatQuantity(item.quantity);
    return `${qty} ${item.unit} ${item.name}`;
  }
  if (item.quantity !== null) {
    return `${formatQuantity(item.quantity)} ${item.name}`;
  }
  return item.name;
}

function formatQuantity(qty: number): string {
  // Show as integer if whole number
  if (Number.isInteger(qty)) return String(qty);
  // Round to 2 decimal places for display
  return String(round(qty, 2));
}

export function shoppingListToText(items: ShoppingListItem[]): string {
  return items.map((item) => `- ${formatShoppingItem(item)}`).join("\n");
}
