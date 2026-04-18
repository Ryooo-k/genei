import type { Server } from "socket.io";
import type { GameState, Action } from "@genei/shared";
import { TICK_INTERVAL, GAME_DURATION_MS } from "./config.js";

export class GameRoom {
  private gameId: string;
  private io: Server;
  private state: GameState;
  private timer: NodeJS.Timeout | null = null;

  constructor(gameId: string, io: Server, initialState: GameState) {
    this.gameId = gameId;
    this.io = io;
    this.state = initialState;
  }

  start() {
    this.state.status = "playing";
    this.state.startedAt = Date.now();
    this.timer = setInterval(() => this.tick(), TICK_INTERVAL);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  handleAction(playerId: string, action: Action) {
    if (this.state.status !== "playing") return;

    switch (action.type) {
      case "PLAY_CARD":
        // カード効果の処理は別issueで実装
        break;
      case "SURRENDER":
        this.endGame(this.getOpponentId(playerId));
        break;
    }
  }

  private tick() {
    if (this.state.status !== "playing") return;

    this.state.tick++;

    if (this.isTimeUp()) {
      this.endGame(null);
      return;
    }

    this.processAutoAttack();

    this.io.to(this.gameId).emit("STATE_UPDATED", { state: this.state });
  }

  private isTimeUp(): boolean {
    return (
      this.state.startedAt !== null &&
      Date.now() - this.state.startedAt >= GAME_DURATION_MS
    );
  }

  private processAutoAttack() {
    for (const playerField of Object.values(this.state.field)) {
      for (const position of [0, 1, 2] as const) {
        const unit = playerField[position]?.unit;
        if (unit) {
          unit.attackTick++;
        }
      }
    }
  }

  private endGame(winnerId: string | null) {
    this.state.status = "finished";
    this.state.winnerId = winnerId;
    this.stop();
    this.io.to(this.gameId).emit("GAME_ENDED", { winnerId });
  }

  private getOpponentId(playerId: string): string | null {
    return Object.keys(this.state.players).find((id) => id !== playerId) ?? null;
  }
}
