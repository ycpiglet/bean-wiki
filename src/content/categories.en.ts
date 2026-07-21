// English display strings for categories, keyed by slug. The canonical category
// data (categories.ts) keeps Korean names as the matching key; this only
// provides the English label + description for the /en surface.
export const categoriesEn: Record<string, { name: string; description: string }> = {
  "coffee-basics": {
    name: "Coffee Basics",
    description: "The structure of coffee and the whole flow of making a cup",
  },
  "origin-and-green": {
    name: "Origin & Green Coffee",
    description: "Varieties, growing environment, processing, and green quality",
  },
  roasting: {
    name: "Roasting",
    description: "From heat transfer to profile design and quality control",
  },
  brewing: {
    name: "Brewing",
    description: "Designing taste with water, grind size, and ratio",
  },
  sensory: {
    name: "Sensory",
    description: "Cupping, flavor language, and the principles of sensory evaluation",
  },
  "cafe-and-gear": {
    name: "Café & Gear",
    description: "Espresso machines, grinders, and bar operations",
  },
};
