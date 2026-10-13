import { siteConfig } from "@/config/site";

/**
 * All money in the system is stored as integer minor units (poisha; ৳1 = 100).
 * This is the only place the server-side integers become human strings.
 */
export function formatBDT(minorUnits: number): string {
  const taka = minorUnits / 100;
  const hasPaisa = minorUnits % 100 !== 0;
  return `${siteConfig.currency.symbol}${taka.toLocaleString("en-US", {
    maximumFractionDigits: hasPaisa ? 2 : 0,
    minimumFractionDigits: hasPaisa ? 2 : 0,
  })}`;
}

/** Convert a "taka-only" user input (whole taka) into minor units. */
export function takaToMinorUnits(taka: number | ""): number | undefined {
  if (taka === "" || !Number.isFinite(taka)) {
    return undefined;
  }
  return Math.round(taka * 100);
}
