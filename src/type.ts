export interface StockData {
  date: string;
  close: number;
}

export const TIME_FRAMES = ["hourly", "daily", "weekly", "monthly"] as const;

export type TimeFrame = (typeof TIME_FRAMES)[number];
