import * as os from 'os'
import * as path from 'path'
import { exec } from '@actions/exec'
import * as core from '@actions/core'
import * as toolCache from '@actions/tool-cache'
import { System } from './os'
import { sign } from 'crypto'

export async function install(version: string, system: System) {
  if (os.platform() !== 'linux') {
    core.error('Trying to run linux installer on non-linux os')
    return
  }

  let swiftPath = toolCache.find(`swift-${system.name}`, version)

  if (swiftPath === null || swiftPath.trim().length == 0) {
    core.debug(`No matching installation found`)

    let [[pkg, signature], _] = await Promise.all([
      download(version, system.version),
      setupKeys()
    ])

    await verify(signature, pkg)

    swiftPath = await unpack(pkg, version, system)
  } else {
    core.debug('Matching installation found')
  }

  core.debug('Adding swift to path')

  let binPath = path.join(swiftPath, '/usr/bin' )
  core.addPath(binPath)

  core.debug('Swift installed')
}

async function download(version: string, ubuntuVersion: string) {
  core.debug(`Downloading swift ${version} for ubuntu ${ubuntuVersion}`)

  let versionUpperCased = version.toUpperCase()
  let ubuntuVersionString = ubuntuVersion.replace(/\D/g, "")
  let url = `https://swift.org/builds/swift-${version}-release/ubuntu${ubuntuVersionString}/swift-${versionUpperCased}-RELEASE/swift-${versionUpperCased}-RELEASE-ubuntu${ubuntuVersion}.tar.gz`

  return await Promise.all([
    toolCache.downloadTool(url),
    toolCache.downloadTool(`${url}.sig`)
  ])
}

async function unpack(packagePath: string, version: string, system: System) {
  core.debug('Extracting package')
  let extractPath = await toolCache.extractTar(packagePath)
  core.debug('Package extracted')
  let cachedPath = await toolCache.cacheDir(extractPath, `swift-${system.name}`, version)
  core.debug('Package cached')
  return cachedPath
}

async function setupKeys() {
  core.debug('Fetching verification keys')
  let path = await toolCache.downloadTool('https://swift.org/keys/all-keys.asc')
  await exec(`gpg --import "${path}"`)
  await exec('gpg --keyserver hkp://pool.sks-keyservers.net --refresh-keys Swift')
}

async function verify(signaturePath: string, packagePath: string) {
  core.debug('Verifying signature')
  await exec('gpg', ['--verify', signaturePath, packagePath])
}
