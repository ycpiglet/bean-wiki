import paletteData from "./brand-colors.json";

export type ColorFamily =
  | "amber"
  | "beige"
  | "berry"
  | "black"
  | "blue"
  | "brown"
  | "burgundy"
  | "caramel"
  | "copper"
  | "dark-brown"
  | "gold"
  | "gray"
  | "green"
  | "greige"
  | "ivory"
  | "lime"
  | "mahogany"
  | "olive"
  | "pink"
  | "red"
  | "rose"
  | "ruby"
  | "sage"
  | "silver"
  | "tan"
  | "taupe"
  | "teal"
  | "umber"
  | "warm-white"
  | "white"
  | "yellow";

export type CoffeeRelation =
  | "baking"
  | "cafe-menu"
  | "coffee-plant"
  | "equipment"
  | "espresso"
  | "green-coffee"
  | "interior"
  | "milk"
  | "processing"
  | "roasting"
  | "sensory";

export type BrandSwatch = {
  id: string;
  brandName: string;
  englishName: string;
  token: `--${string}`;
  hex: `#${string}`;
  darkHex: `#${string}`;
  family: ColorFamily;
  nearDuplicateGroup?: string;
  relation: CoffeeRelation;
  material: string;
  evidence: string[];
  story: string;
};

export type BrandPalette = {
  version: number;
  disclaimer: string;
  namingPolicy: {
    targetKoreanCharacters: number;
    hardMaxKoreanCharacters: number;
    preferredGroupSize: number;
    minimumGroupSize: number;
    maximumGroupSize: number;
  };
  sources: Record<string, { label: string; url: string }>;
  groups: Array<{
    id: string;
    title: string;
    description: string;
    swatches: BrandSwatch[];
  }>;
};

export const brandPalette = paletteData as BrandPalette;
