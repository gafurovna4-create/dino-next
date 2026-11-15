export type ScoreEntry = { name: string; score: number; date: string };

export interface ScoreService {
  getHighScore(): Promise<number>;
  saveScore(name: string, score: number): Promise<void>;
  getLeaderboard(): Promise<ScoreEntry[]>;
}