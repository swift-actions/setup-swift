import { coerce, eq } from "semver";

/**
 * Compare two version strings.
 * @param a First version
 * @param b Second version
 * @returns True if the versions are equal
 */
export function equalVersions(
  a: string | undefined | null,
  b: string | undefined | null,
) {
  if (!a || !b) {
    return false;
  }
  const versionA = coerce(a);
  const versionB = coerce(b);
  return Boolean(versionA && versionB && eq(versionA, versionB));
}
