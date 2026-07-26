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
  "coffee-science": {
    name: "Coffee Science",
    description: "The chemistry, physics, and microbiology behind flavor",
  },
  "history-and-culture": {
    name: "History & Culture",
    description: "Coffee's journeys, coffeehouses, and regional drinking cultures",
  },
  "sustainability-and-trade": {
    name: "Sustainability & Trade",
    description: "Climate, farmer livelihoods, prices, and responsible supply chains",
  },
  "cafe-operations": {
    name: "Café Operations & Quality",
    description: "Workflow, hygiene, costs, and consistent quality systems",
  },
  "drinks-and-recipes": {
    name: "Drinks & Recipes",
    description: "Coffee drinks, milk, ingredients, and recipe design",
  },
  "coffee-and-health": {
    name: "Coffee & Health",
    description: "Evidence-based information about caffeine, sleep, and consumption",
  },
};
