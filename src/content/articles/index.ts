import type { Article } from "@/content/types";
import coffeeCherryToBean from "./coffee-cherry-to-bean";
import extractionBasics from "./extraction-basics";
import roastDevelopment from "./roast-development";
import cuppingBasics from "./cupping-basics";
import coffeeProcessing from "./coffee-processing";
import waterForCoffee from "./water-for-coffee";
import grinderBasics from "./grinder-basics";
import espressoBasics from "./espresso-basics";
import arabicaAndRobusta from "./arabica-and-robusta";

// Order MUST match the original articles[] order — it drives listing order and sitemap.
export const articles: Article[] = [
  coffeeCherryToBean,
  extractionBasics,
  roastDevelopment,
  cuppingBasics,
  coffeeProcessing,
  waterForCoffee,
  grinderBasics,
  espressoBasics,
  arabicaAndRobusta,
];
