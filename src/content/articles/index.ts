import type { Article } from "@/content/types";
import coffeeCherryToBean from "./coffee-cherry-to-bean";
import extractionBasics from "./extraction-basics";
import roastingBasics from "./roasting-basics";
import cuppingBasics from "./cupping-basics";
import beanStructureCompounds from "./bean-structure-compounds";
import coffeeProcessing from "./coffee-processing";
import roastDevelopment from "./roast-development";
import waterForCoffee from "./water-for-coffee";
import grinderBasics from "./grinder-basics";
import espressoBasics from "./espresso-basics";
import arabicaAndRobusta from "./arabica-and-robusta";
import coffeeVarieties from "./coffee-varieties";

// Array order drives listing order on the home page, /wiki, topic pages, and
// the sitemap. Kept as a diverse-but-progressive sequence.
export const articles: Article[] = [
  coffeeCherryToBean,
  extractionBasics,
  roastingBasics,
  cuppingBasics,
  beanStructureCompounds,
  coffeeProcessing,
  roastDevelopment,
  waterForCoffee,
  grinderBasics,
  espressoBasics,
  arabicaAndRobusta,
  coffeeVarieties,
];
