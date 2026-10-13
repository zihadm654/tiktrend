import { describe, expect, it } from "vitest";

import { formatBDT, takaToMinorUnits } from "./money";

describe("formatBDT", () => {
  it("formats whole taka without decimals", () => {
    expect(formatBDT(1_999_900)).toBe("৳19,999");
    expect(formatBDT(0)).toBe("৳0");
  });

  it("shows poisha when the amount is not whole taka", () => {
    expect(formatBDT(1_999_950)).toBe("৳19,999.50");
    expect(formatBDT(5)).toBe("৳0.05");
  });
});

describe("takaToMinorUnits", () => {
  it("converts whole taka to poisha", () => {
    expect(takaToMinorUnits(19_999)).toBe(1_999_900);
    expect(takaToMinorUnits(0)).toBe(0);
  });

  it("returns undefined for empty or non-finite input", () => {
    expect(takaToMinorUnits("")).toBeUndefined();
    expect(takaToMinorUnits(Number.NaN)).toBeUndefined();
  });
});
