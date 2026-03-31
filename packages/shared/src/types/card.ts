export type CardType = "unit" | "spell" | "field" | "art";

export interface Card {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  description: string;
}

export interface UnitCard extends Card {
  type: "unit";
  attack: number;
  hp: number;
}

export interface SpellCard extends Card {
  type: "spell";
}

export interface FieldCard extends Card {
  type: "field";
}

export interface ArtCard extends Card {
  type: "art";
  cooldown: number;
}
