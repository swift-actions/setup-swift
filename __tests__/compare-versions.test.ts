import { matchesVersion } from "../src/core/compare-versions";

describe("Swift version selectors", () => {
  it.each<[string, string | null | undefined, boolean]>([
    ["6", "6.3.3", true],
    ["6", "5.10.1", false],
    ["6.3", "6.3.3", true],
    ["6.3", "6.4.0", false],
    ["6.3.3", "6.3.3", true],
    ["6.3.3", "6.3.4", false],
    ["6.4.0", "6.4", true],
    ["latest", "6.4", true],
    ["latest", "6.4-dev", false],
    ["6.4", "6.4-dev", false],
    ["latest", "main-snapshot-2026-09-30", false],
    ["main-snapshot", "main-snapshot-2026-09-30", true],
    ["main-snapshot", "6.3-snapshot-2026-09-30", false],
    ["6.3-snapshot", "6.3-snapshot-2026-09-30", true],
    ["6.3-snapshot", "6.4-snapshot-2026-09-30", false],
    ["6.3-snapshot", "6.3.3", false],
    ["main-snapshot-2026-09-30", "main-snapshot-2026-09-30", true],
    ["main-snapshot-2026-09-30", "main-snapshot-2026-09-29", false],
    ["6.3-snapshot-2026-09-30", "6.3-snapshot-2026-09-30", true],
    ["6.3-snapshot-2026-09-30", "6.3-snapshot-2026-09-29", false],
    ["6.3", null, false],
    ["latest", undefined, false],
    ["", "6.3.3", false],
    ["not-a-selector", "6.3.3", false],
  ])("matches %s against %s: %s", (requested, installed, expected) => {
    expect(matchesVersion(requested, installed)).toBe(expected);
  });
});
