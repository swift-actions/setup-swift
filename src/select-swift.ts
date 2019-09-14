import * as core from '@actions/core'
import { exec } from '@actions/exec'
import { setupSwiftenv } from './setup-swiftenv'

export async function selectSwift(version: string) {
  core.exportVariable('SWIFT_VERSION', version)
  await installSwift(version) 
}

async function installSwift(version: string) {
  let swiftenv = await setupSwiftenv('1.4.0')

  core.startGroup('Install swift')
  try {
    await exec('ls', ['-las', '/opt/hostedtoolcache/swiftenv/1.4.0/x64'])
    await exec('ls', ['-las', '/opt/hostedtoolcache/swiftenv/1.4.0/x64/libexec'])
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
