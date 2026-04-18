import type { UnitCard, ArtCard, FieldCard } from "./card.js";
import type { Hero } from "./hero.js";

export type PlayerId = string;
export type FieldPosition = 0 | 1 | 2;

export interface UnitOnField {
  card: UnitCard;
  damage: number;
  attackTick: number;
}

export interface FieldEffectOnField {
  card: FieldCard;
}

export interface FieldCell {
  unit?: UnitOnField;
  effect?: FieldEffectOnField;
}

export interface PlayerState {
  id: PlayerId;
  hero: Hero;
  art: ArtCard;
  artCooldownRemaining: number;
  ap: number;
  hp: number;
  damage: number;
}

export interface GameState {
  gameId: string;
  tick: number;
  players: Record<PlayerId, PlayerState>;
  field: Record<PlayerId, Record<FieldPosition, FieldCell>>;
  status: "waiting" | "playing" | "spell" | "finished";
  startedAt: number | null;
  winnerId: PlayerId | null;
}
