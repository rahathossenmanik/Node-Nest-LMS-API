export const MINUTES_IN_A_HOUR = 60;
export const MINUTES_IN_A_DAY = 24 * MINUTES_IN_A_HOUR;
export const SECONDS_IN_A_DAY = MINUTES_IN_A_DAY * 60;;
export const MS_IN_A_DAY = SECONDS_IN_A_DAY * 1000;
export const MS_PER_MINUTE = 60 * 1000;
export const MS_PER_SECONDS = 1000;

export const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180)
}

export const to2DigitDecimal = (num: number) => {
  return Math.round(num * 100) / 100;
}