import { coerce, satisfies } from "semver";

/**
 * Match an installed release or canonical Swiftly snapshot against a selector.
 */
export function matchesVersion(
  requested: string | undefined | null,
  installed: string | undefined | null,
) {
  if (!requested || !installed) {
    return false;
  }

  const snapshot = requested.match(
    /^(main|\d+\.\d+(?:\.\d+)?)-snapshot(?:-(\d{4}-\d{2}-\d{2}))?$/,
  );
  if (snapshot) {
    const actual = installed.match(
      /^(main|\d+\.\d+(?:\.\d+)?)-snapshot-(\d{4}-\d{2}-\d{2})$/,
    );
    return Boolean(
      actual &&
        snapshot[1] === actual[1] &&
        (!snapshot[2] || snapshot[2] === actual[2]),
    );
  }

  if (!/^\d+\.\d+(?:\.\d+)?$/.test(installed)) {
    return false;
  }
  if (requested === "latest") {
    return true;
  }
  if (!/^\d+(?:\.\d+){0,2}$/.test(requested)) {
    return false;
  }

  const actual = coerce(installed);
  return Boolean(actual && satisfies(actual, requested));
}
