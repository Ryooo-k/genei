import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GameRoom } from "../../game/GameRoom.js";
import { TICK_INTERVAL } from "../../game/config.js";
import type { GameState } from "@genei/shared";

const mockEmit = vi.fn();
const mockTo = vi.fn(() => ({ emit: mockEmit }));
const mockIo = { to: mockTo } as any;

function makeState(overrides: Partial<GameState> = {}): GameState {
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

function makeUnit(attackInterval = 180) {
  return {
    card: {
      id: "c1",
      name: "Unit1",
      type: "unit" as const,
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

describe("GameRoom", () => {
  let state: GameState;
  let room: GameRoom;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    state = makeState();
    room = new GameRoom("game-1", mockIo, state);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe("start", () => {
    it("statusをplayingに変更する", () => {
      expect(state.status).toBe("waiting");
      room.start();
      expect(state.status).toBe("playing");
    });

    it("startedAtを設定する", () => {
      const before = Date.now();
      room.start();
      expect(state.startedAt).toBeGreaterThanOrEqual(before);
    });

    it("tickが起動する", () => {
      room.start();
      vi.advanceTimersByTime(TICK_INTERVAL);
      expect(state.tick).toBe(1);
    });

    it("複数tick経過するとstate.tickがその分増加する", () => {
      room.start();
      vi.advanceTimersByTime(TICK_INTERVAL * 3); // 3tick分
      expect(state.tick).toBe(3);
    });

    it("tickごとにSTATE_UPDATEDを送信する", () => {
      room.start();
      vi.advanceTimersByTime(TICK_INTERVAL);
      expect(mockTo).toHaveBeenCalledWith("game-1");
      expect(mockEmit).toHaveBeenCalledWith("STATE_UPDATED", { state });
    });

    describe("時間切れによるゲーム終了", () => {
      it("時間切れでゲーム終了しwinnerId=nullになる", () => {
        room.start();
        vi.advanceTimersByTime(5 * 60 * 1000 + TICK_INTERVAL);
        expect(state.status).toBe("finished");
        expect(state.winnerId).toBeNull();
        expect(mockEmit).toHaveBeenCalledWith("GAME_ENDED", { winnerId: null });
      });

      it("時間切れ後はSTATE_UPDATEDを送信しない", () => {
        room.start();
        vi.advanceTimersByTime(5 * 60 * 1000 + TICK_INTERVAL);
        mockEmit.mockClear();
        vi.advanceTimersByTime(100);
        expect(mockEmit).not.toHaveBeenCalledWith(
          "STATE_UPDATED",
          expect.anything(),
        );
      });
    });

    describe("ユニットの自動攻撃進行", () => {
      it("フィールド上のユニットのattackTickが毎tick増加する", () => {
        const unit = makeUnit();
        state.field.p1[0].unit = unit;
        room.start();
        vi.advanceTimersByTime(TICK_INTERVAL * 5); // 5tick
        expect(unit.attackTick).toBe(5);
      });

      it("複数プレイヤーのユニットがそれぞれ独立してattackTickが増加する", () => {
        const unit1 = makeUnit();
        const unit2 = makeUnit();
        state.field.p1[0].unit = unit1;
        state.field.p2[1].unit = unit2;
        room.start();
        vi.advanceTimersByTime(TICK_INTERVAL * 10); // 10tick
        expect(unit1.attackTick).toBe(10);
        expect(unit2.attackTick).toBe(10);
      });

      it("途中でフィールドに追加されたユニットはそこからattackTickが増加する", () => {
        const unit1 = makeUnit();
        const unit2 = makeUnit();
        state.field.p1[0].unit = unit1;
        room.start();
        vi.advanceTimersByTime(TICK_INTERVAL * 10); // 10tick

        state.field.p2[0].unit = unit2;
        vi.advanceTimersByTime(TICK_INTERVAL * 10); // 10tick
        expect(unit1.attackTick).toBe(20);
        expect(unit2.attackTick).toBe(10);
      });
    });
  });

  describe("stop", () => {
    it("stop後はSTATE_UPDATEDが発火されない ", () => {
      room.start();
      room.stop();
      vi.advanceTimersByTime(1000);
      expect(mockEmit).not.toHaveBeenCalledWith(
        "STATE_UPDATED",
        expect.anything(),
      );
    });

    it("stopを二重呼び出ししてもエラーにならない", () => {
      room.start();
      room.stop();
      expect(() => room.stop()).not.toThrow();
    });
  });

  describe("handleAction", () => {
    it("SURRENDER時にstatusがfinishedになる", () => {
      room.start();
      room.handleAction("p1", { type: "SURRENDER" });
      expect(state.status).toBe("finished");
    });

    it("SURRENDER時に相手がwinnerになる", () => {
      room.start();
      room.handleAction("p1", { type: "SURRENDER" });
      expect(state.winnerId).toBe("p2");
    });

    it("waiting状態では何もしない", () => {
      expect(state.status).toBe("waiting");
      room.handleAction("p1", { type: "SURRENDER" });
      expect(state.status).toBe("waiting");
      expect(state.winnerId).toBeNull();
    });

    it("finished状態では何もしない", () => {
      room.start();
      room.handleAction("p1", { type: "SURRENDER" });
      expect(state.status).toBe("finished");
      const winnerId = state.winnerId;
      room.handleAction("p2", { type: "SURRENDER" });
      expect(state.winnerId).toBe(winnerId);
    });

    it("プレイヤーが1人の状態でSURRENDERしてもエラーにならない", () => {
      const singlePlayerState = makeState({
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
        },
      });
      const singleRoom = new GameRoom("game-1", mockIo, singlePlayerState);
      singleRoom.start();
      expect(() =>
        singleRoom.handleAction("p1", { type: "SURRENDER" }),
      ).not.toThrow();
    });

    it("プレイヤーが1人の状態でSURRENDERするとwinnerIdがnullになる", () => {
      const singlePlayerState = makeState({
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
        },
      });
      const singleRoom = new GameRoom("game-1", mockIo, singlePlayerState);
      singleRoom.start();
      singleRoom.handleAction("p1", { type: "SURRENDER" });
      expect(singlePlayerState.winnerId).toBeNull();
    });
  });
});
