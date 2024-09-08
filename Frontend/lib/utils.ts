import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clearTempCheckers = (field: number[][]) => {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (field[y][x] === 9) field[y][x] = 0;
    }
  }
};
