import * as semver from 'semver' 

const AVAILABLE_VERSIONS = [
    '5.0.3',
    '5.0.2',
    '5.0.1',
    '5.0',
    '4.2.4',
    '4.2.3',
    '4.2.2',
    '4.2.1',
    '4.2',
    '4.1.3',
    '4.1.2',
    '4.1.1',
    '4.1',
    '4.0.3',
    '4.0.2',
    '4.0',
    '3.1.1',
    '3.1',
    '3.0.2',
    '3.0.1',
    '3.0',
    '2.2.1',
    '2.2'
].map(semver.coerce).filter(notEmpty)

function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function verify(version: string) {
  let range = semver.validRange(version)
  if (range === null) {
    throw new Error('Version must be a valid semver format.')
  }

  let matchingVersion = evaluateVersions(AVAILABLE_VERSIONS, version)
  if (matchingVersion === null) {
    throw new Error(`Version "${version}" is not available`)
  }

  return matchingVersion
}

// TODO - should we just export this from @actions/tool-cache? Lifted directly from there
function evaluateVersions(versions: semver.SemVer[], versionSpec: string) {
  let version = null

  versions = versions.sort((a, b) => {
    if (semver.gt(a, b)) {
      return 1;
    }
    return -1;
  })

  for (let i = versions.length - 1; i >= 0; i--) {
    const potential = versions[i]
    const satisfied: boolean = semver.satisfies(potential, versionSpec)
    if (satisfied) {
      version = potential
      break
    }
  }

  if (version === null) {
    return null
  }

  return `${version.major}.${version.minor}${version.patch > 0 ? `.${version.patch}` : ''}`
}
