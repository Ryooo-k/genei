import type { GameState } from "./gameState.js";

export interface GameStartedEvent {
  type: "GAME_STARTED";
  gameId: string;
  yourPlayerId: string;
  hand: string[];
  state: GameState;
}

export interface StateUpdatedEvent {
  type: "STATE_UPDATED";
  state: GameState;
}

export interface GameEndedEvent {
  type: "GAME_ENDED";
  winnerId: string;
}

export interface CardDrawnEvent {
  type: "CARD_DRAWN";
  cardId: string;
}

export type GameEvent =
  | GameStartedEvent
  | StateUpdatedEvent
  | GameEndedEvent
  | CardDrawnEvent;
