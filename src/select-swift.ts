import * as core from '@actions/core'
import { exec } from '@actions/exec'
import { getSwiftenv } from './get-swiftenv'

export async function selectSwift(version: string) {
  core.exportVariable('SWIFTENV_ROOT', 'something')
  core.addPath('$SWIFTENV_ROOT/bin')
  await installSwift(version)
  core.exportVariable('SWIFT_VERSION', version)
}

async function installSwift(version: string) {
  let swiftenv = await getSwiftenv('1.4.0')

  core.startGroup('Install swift')
  try {
    await exec(`"${swiftenv}"`, ['install', version, '--verify'])
  } catch(error) {
    if (/already installed/.test(error)) {
      core.debug(error)
    } else {
      core.setFailed(error)
    }
  }
  core.endGroup()
}
