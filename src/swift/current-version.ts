import { cmd } from "../core";

/**
 * Get the current swift version
 * @returns Current swift version
 */
export async function currentVersion() {
  const output = await cmd("swift", "--version");
  return versionFromString(output);
}

export function versionFromString(subject: string): string | null {
  const match = subject.match(
    /Swift\ version (?<version>[0-9]+\.[0-9+]+(\.[0-9]+)?)/,
  ) || {
    groups: { version: null },
  };

  if (!match.groups || !match.groups.version) {
    return null;
  }

  return match.groups.version;
}
