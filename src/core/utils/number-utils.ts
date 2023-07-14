
export function limitToRange(min: number, max: number, num: number): number {
  return Math.max(min, Math.min(max, num));
}

export function randomRangeInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomRangeFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}