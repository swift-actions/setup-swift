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
]

export function  verify(version: string) {

  if (!semver.valid(version)) {
    throw new Error('Version must be a valid semver format.')
  }

  let matchingVersion = evaluateVersions(AVAILABLE_VERSIONS, version)
  if (matchingVersion === null) {
    throw new Error(`Version "${version}" is not available`)
  }

  let semverVersion = semver.parse(matchingVersion)
  if (semverVersion === null) {
    throw new Error('Matched version is not a valid semver version.')
  }

  let [prerelease] = semverVersion.prerelease
  if (!prerelease) {
    semverVersion.prerelease = ['release']
  }

  return matchingVersion
}

// TODO - should we just export this from @actions/tool-cache? Lifted directly from there
function evaluateVersions(versions: string[], versionSpec: string): string {
  let version = ''

  versions = versions.sort((a, b) => {
    if (semver.gt(a, b)) {
      return 1;
    }
    return -1;
  })

  for (let i = versions.length - 1; i >= 0; i--) {
    const potential: string = versions[i]
    const satisfied: boolean = semver.satisfies(potential, versionSpec)
    if (satisfied) {
      version = potential
      break
    }
  }

  return version
}
