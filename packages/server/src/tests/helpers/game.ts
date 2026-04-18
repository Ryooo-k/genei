import type { GameState, UnitOnField } from "@genei/shared";

export function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    gameId: "game-1",
    tick: 0,
    status: "waiting",
    startedAt: null,
    winnerId: null,
    players: {
      p1: {
        id: "p1",
        hero: { id: "h1", name: "Hero1", arts: [] },
        art: {
          id: "a1",
          name: "Art1",
          type: "art",
          cost: 3,
          description: "",
          cooldown: 10,
        },
        artCooldownRemaining: 0,
        ap: 0,
        hp: 20,
        damage: 0,
      },
      p2: {
        id: "p2",
        hero: { id: "h2", name: "Hero2", arts: [] },
        art: {
          id: "a2",
          name: "Art2",
          type: "art",
          cost: 3,
          description: "",
          cooldown: 10,
        },
        artCooldownRemaining: 0,
        ap: 0,
        hp: 20,
        damage: 0,
      },
    },
    field: {
      p1: {
        0: { unit: undefined },
        1: { unit: undefined },
        2: { unit: undefined },
      },
      p2: {
        0: { unit: undefined },
        1: { unit: undefined },
        2: { unit: undefined },
      },
    },
    ...overrides,
  };
}

export function makeUnit(attackInterval = 180): UnitOnField {
  return {
    card: {
      id: "c1",
      name: "Unit1",
      type: "unit",
      cost: 2,
      description: "",
      attack: 3,
      hp: 5,
      attackInterval,
    },
    damage: 0,
    attackTick: 0,
  };
}
