import { ScoreEntry, ScoreService } from "./score";


const KEY = "dino-scores";

const read = (): ScoreEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};

export const localScores: ScoreService = {
  async getHighScore() {
    return Math.max(0, ...read().map((s) => s.score));
  },
  async saveScore(name, score) {
    const list = read();
    list.push({ name, score, date: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(list));
  },
  async getLeaderboard() {
    return read().sort((a, b) => b.score - a.score).slice(0, 10);
  },
};