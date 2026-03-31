export interface PlayCardAction {
  type: "PLAY_CARD";
  cardId: string;
  position?: number;
}

export interface SurrenderAction {
  type: "SURRENDER";
}

export type Action = PlayCardAction | SurrenderAction;
