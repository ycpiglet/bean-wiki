const HEX = /^#[0-9A-F]{6}$/;

export const retiredPaletteTerms = [
  "Himalayan Pink Salt",
  "히말라얀 핑크 솔트",
  "Volcanic Terroir Earth",
  "볼캐닉 테루아 어스",
  "Sugar Cube Crystal White",
  "각설탕 크리스털 화이트",
  "Cookies & Cream Gray",
  "쿠키 앤 크림 그레이",
  "Espresso Macchiato Black",
  "에스프레소 마키아토 블랙",
  "Cascara Infusion Rose",
  "카스카라 인퓨전 로즈",
  "Swedish Pearl Sugar White",
  "스웨디시 펄 슈거 화이트",
  "Lemon Peel Yellow",
  "레몬 필 옐로",
  "Spent Espresso Puck Umber",
  "스펜트 에스프레소 퍽 엄버",
  "Ceremonial Matcha Green",
  "세리머니얼 말차 그린",
  "Sourdough Open Crumb Ivory",
  "사워도우 오픈 크럼 아이보리",
  "Black Sesame Frangipane Gray",
  "블랙 세서미 프랑지판 그레이",
  "Coffee Farm Mist Sage",
  "커피 팜 미스트 세이지",
  "Washed Tank Blue",
  "워시드 탱크 블루",
  "강력분 화이트",
  "딸기잼 레드",
];

export const retiredPaletteIds = [
  "cascara-infusion-rose",
  "swedish-pearl-sugar-white",
  "lemon-peel-yellow",
  "spent-espresso-puck-umber",
  "ceremonial-matcha-green",
  "sourdough-open-crumb-ivory",
  "black-sesame-frangipane-gray",
  "coffee-farm-mist-sage",
  "washed-tank-blue",
];

export function parseThemeTokens(css) {
  const readBlock = (selector) => {
    const block = css.match(selector)?.[1] ?? "";
    return new Map(
      [...block.matchAll(/^\s*(--[\w-]+)\s*:\s*(#[0-9a-f]{6})\s*;/gim)].map(
        ([, token, value]) => [token, value.toUpperCase()],
      ),
    );
  };

  return {
    light: readBlock(/:root\s*\{([\s\S]*?)\}/),
    dark: readBlock(/\[data-theme="dark"\]\s*\{([\s\S]*?)\}/),
  };
}

function srgbChannel(channel) {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

export function hexToOklch(hex) {
  const value = hex.replace("#", "");
  const red = srgbChannel(Number.parseInt(value.slice(0, 2), 16));
  const green = srgbChannel(Number.parseInt(value.slice(2, 4), 16));
  const blue = srgbChannel(Number.parseInt(value.slice(4, 6), 16));

  const l = 0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue;
  const m = 0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue;
  const s = 0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue;
  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  const lightness =
    0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const a =
    1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const b =
    0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;
  const chroma = Math.sqrt(a * a + b * b);
  const hue = (Math.atan2(b, a) * 180) / Math.PI;

  return {
    l: lightness,
    c: chroma,
    h: hue < 0 ? hue + 360 : hue,
    a,
    b,
  };
}

function inCircularRange(value, start, end) {
  return start <= end
    ? value >= start && value <= end
    : value >= start || value <= end;
}

function addUniqueError(seen, errors, label, value) {
  if (seen.has(value)) errors.push(`duplicate ${label}: "${value}"`);
  seen.add(value);
}

export function validateBrandColors(palette, themes) {
  const errors = [];
  const warnings = [];
  const groupIds = new Set();
  const groupTitles = new Set();
  const ids = new Set();
  const tokens = new Set();
  const brandNames = new Set();
  const englishNames = new Set();
  const hexes = new Set();
  const sourceIds = new Set(Object.keys(palette.sources ?? {}));
  const swatches = (palette.groups ?? []).flatMap((group) => group.swatches ?? []);

  if (!Number.isInteger(palette.version) || palette.version < 1) {
    errors.push("palette.version must be a positive integer");
  }
  if (!palette.disclaimer?.trim()) errors.push("palette disclaimer is missing");
  if (!swatches.length) errors.push("palette has no swatches");

  const namingPolicy = palette.namingPolicy ?? {};
  for (const key of [
    "desktopColumns",
    "minimumGroupSize",
    "maximumGroupSize",
  ]) {
    if (!Number.isInteger(namingPolicy[key]) || namingPolicy[key] < 1) {
      errors.push(`namingPolicy.${key} must be a positive integer`);
    }
  }
  if (namingPolicy.minimumGroupSize > namingPolicy.maximumGroupSize) {
    errors.push(
      "namingPolicy group sizes must satisfy minimum ≤ maximum",
    );
  }
  if (typeof namingPolicy.singleLineDisplay !== "boolean") {
    errors.push("namingPolicy.singleLineDisplay must be a boolean");
  }

  for (const group of palette.groups ?? []) {
    const prefix = group.id || group.title || "unknown group";
    addUniqueError(groupIds, errors, "group id", group.id);
    addUniqueError(groupTitles, errors, "group title", group.title);
    for (const field of ["id", "title", "description"]) {
      if (typeof group[field] !== "string" || !group[field].trim()) {
        errors.push(`${prefix}: missing group "${field}"`);
      }
    }
    if (!Array.isArray(group.swatches)) {
      errors.push(`${prefix}: swatches must be an array`);
      continue;
    }
    if (
      Number.isInteger(namingPolicy.minimumGroupSize) &&
      group.swatches.length < namingPolicy.minimumGroupSize
    ) {
      errors.push(
        `${prefix}: ${group.swatches.length} swatches is below the minimum ${namingPolicy.minimumGroupSize}`,
      );
    }
    if (
      Number.isInteger(namingPolicy.maximumGroupSize) &&
      group.swatches.length > namingPolicy.maximumGroupSize
    ) {
      errors.push(
        `${prefix}: ${group.swatches.length} swatches exceeds the maximum ${namingPolicy.maximumGroupSize}`,
      );
    }
  }

  for (const [id, source] of Object.entries(palette.sources ?? {})) {
    if (!source.label?.trim()) errors.push(`source "${id}" is missing a label`);
    if (!/^https:\/\//.test(source.url ?? "")) {
      errors.push(`source "${id}" must use an https URL`);
    }
  }

  for (const swatch of swatches) {
    const prefix = swatch.id || swatch.englishName || "unknown swatch";
    addUniqueError(ids, errors, "swatch id", swatch.id);
    addUniqueError(tokens, errors, "CSS token", swatch.token);
    addUniqueError(brandNames, errors, "Korean brand name", swatch.brandName);
    addUniqueError(englishNames, errors, "English brand name", swatch.englishName);
    addUniqueError(hexes, errors, "canonical HEX", swatch.hex);

    for (const field of [
      "id",
      "brandName",
      "englishName",
      "token",
      "family",
      "relation",
      "material",
      "story",
    ]) {
      if (typeof swatch[field] !== "string" || !swatch[field].trim()) {
        errors.push(`${prefix}: missing "${field}"`);
      }
    }
    if (!/^--[\w-]+$/.test(swatch.token ?? "")) {
      errors.push(`${prefix}: invalid CSS token "${swatch.token}"`);
    }
    if (!HEX.test(swatch.hex ?? "")) {
      errors.push(`${prefix}: canonical HEX must be uppercase #RRGGBB`);
      continue;
    }
    if (!HEX.test(swatch.darkHex ?? "")) {
      errors.push(`${prefix}: darkHex must be uppercase #RRGGBB`);
    }
    if (/[\u3131-\uD79D]/.test(swatch.englishName ?? "")) {
      errors.push(`${prefix}: English name contains Hangul`);
    }
    if (retiredPaletteIds.includes(swatch.id)) {
      errors.push(`retired palette id remains: "${swatch.id}"`);
    }
    if (
      swatch.brandName !== swatch.brandName?.trim() ||
      /[\n\r\t]|\s{2,}/.test(swatch.brandName ?? "")
    ) {
      errors.push(`${prefix}: Korean brand name has invalid whitespace`);
    }
    const lightValue = themes.light.get(swatch.token);
    const darkValue = themes.dark.get(swatch.token);
    if (!lightValue) {
      errors.push(`${prefix}: ${swatch.token} is missing from :root`);
    } else if (lightValue !== swatch.hex) {
      errors.push(
        `${prefix}: ${swatch.token} light CSS ${lightValue} != canonical ${swatch.hex}`,
      );
    }
    if (!darkValue) {
      errors.push(`${prefix}: ${swatch.token} is missing from the dark theme`);
    } else if (darkValue !== swatch.darkHex) {
      errors.push(
        `${prefix}: ${swatch.token} dark CSS ${darkValue} != catalog ${swatch.darkHex}`,
      );
    }

    if (!Array.isArray(swatch.evidence)) {
      errors.push(`${prefix}: evidence must be an array`);
    } else {
      for (const evidenceId of swatch.evidence) {
        if (!sourceIds.has(evidenceId)) {
          errors.push(`${prefix}: unknown evidence source "${evidenceId}"`);
        }
      }
    }

    const evidenceRequired = new Set([
      "baking",
      "coffee-plant",
      "espresso",
      "green-coffee",
      "milk",
      "processing",
      "roasting",
      "sensory",
    ]);
    if (evidenceRequired.has(swatch.relation) && !swatch.evidence?.length) {
      errors.push(`${prefix}: relation "${swatch.relation}" requires evidence`);
    }

    const { l, c, h } = hexToOklch(swatch.hex);
    if (swatch.family === "white" && (l < 0.94 || c > 0.05)) {
      errors.push(`${prefix}: white must have OKLab L ≥ 0.94 and C ≤ 0.05`);
    }
    if (swatch.family === "warm-white" && (l < 0.92 || c > 0.06)) {
      errors.push(`${prefix}: warm-white must have L ≥ 0.92 and C ≤ 0.06`);
    }
    if (swatch.family === "black" && l > 0.38) {
      errors.push(`${prefix}: black must have OKLab L ≤ 0.38`);
    }
    if (swatch.family === "gray" && c > 0.035) {
      errors.push(`${prefix}: gray must have OKLab C ≤ 0.035`);
    }
    if (
      swatch.family === "silver" &&
      (c > 0.035 || l < 0.65 || l > 0.9)
    ) {
      errors.push(`${prefix}: silver must be low-chroma with 0.65 ≤ L ≤ 0.90`);
    }

    const hueFamilies = {
      red: [10, 45],
      pink: [350, 30],
      rose: [350, 35],
      ruby: [350, 25],
      yellow: [75, 115],
      gold: [55, 100],
      amber: [45, 85],
      green: [100, 155],
      olive: [90, 135],
      lime: [95, 130],
      teal: [145, 210],
      blue: [205, 265],
    };
    const expectedHue = hueFamilies[swatch.family];
    if (
      expectedHue &&
      c >= 0.045 &&
      !inCircularRange(h, expectedHue[0], expectedHue[1])
    ) {
      errors.push(
        `${prefix}: ${swatch.family} hue ${h.toFixed(1)}° is outside ${expectedHue[0]}–${expectedHue[1]}°`,
      );
    }
  }

  const serialized = JSON.stringify(palette);
  for (const retired of retiredPaletteTerms) {
    if (serialized.includes(retired)) {
      errors.push(`retired palette term remains: "${retired}"`);
    }
  }

  const byId = new Map(swatches.map((swatch) => [swatch.id, swatch]));
  const assertLighter = (lighterId, darkerId) => {
    const lighter = byId.get(lighterId);
    const darker = byId.get(darkerId);
    if (!lighter || !darker) return;
    if (hexToOklch(lighter.hex).l <= hexToOklch(darker.hex).l) {
      errors.push(`${lighterId} must be lighter than ${darkerId}`);
    }
  };
  assertLighter("coffee-blossom-white", "white-paper-filter");
  assertLighter("white-paper-filter", "bread-flour-white");
  assertLighter("bread-flour-white", "sourdough-ivory");
  assertLighter("first-crack-caramel", "brown-sugar-roast");
  assertLighter("brown-sugar-roast", "dark-chocolate-crack");
  assertLighter("dark-chocolate-crack", "vanilla-bean-black");
  assertLighter("velvet-milk-65", "iced-latte-beige");
  assertLighter("iced-latte-beige", "affogato-cream");
  assertLighter("affogato-cream", "espresso-crema-gold");
  assertLighter("espresso-crema-gold", "brewing-93-amber");
  assertLighter("brewing-93-amber", "cold-brew-brown");

  for (let index = 0; index < swatches.length; index += 1) {
    const left = swatches[index];
    if (!HEX.test(left.hex ?? "")) continue;
    const leftLab = hexToOklch(left.hex);
    for (let peer = index + 1; peer < swatches.length; peer += 1) {
      const right = swatches[peer];
      if (!HEX.test(right.hex ?? "")) continue;
      if (
        left.nearDuplicateGroup &&
        left.nearDuplicateGroup === right.nearDuplicateGroup
      ) {
        continue;
      }
      const rightLab = hexToOklch(right.hex);
      const delta = Math.sqrt(
        (leftLab.l - rightLab.l) ** 2 +
          (leftLab.a - rightLab.a) ** 2 +
          (leftLab.b - rightLab.b) ** 2,
      );
      if (delta < 0.015) {
        warnings.push(
          `${left.englishName} and ${right.englishName} are near-duplicates (OKLab Δ ${delta.toFixed(4)})`,
        );
      }
    }
  }

  return { errors, warnings, count: swatches.length };
}
