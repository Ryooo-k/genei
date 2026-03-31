import type { ArtCard } from "./card.js";

export interface Hero {
  id: string;
  name: string;
  arts: ArtCard[];
}
