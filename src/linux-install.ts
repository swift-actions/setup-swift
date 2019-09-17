import * as os from 'os'
import * as path from 'path'
import * as semver from 'semver' 
import { exec } from '@actions/exec'
import * as core from '@actions/core'
import * as toolCache from '@actions/tool-cache'

export async function install(version: string) {
  if (os.platform() !== 'linux') {
    core.error('Trying to run linux installer on non-linux os')
    return
  }

  let swiftPath = toolCache.find('swift-linux', version)

  if (swiftPath === null) {
    let [[pkg, signature], _] = await Promise.all([
      download(version, os.release()),
      setupKeys()
    ])

    await verify(signature)
    swiftPath = await unpack(pkg, version)
  }

  let binPath = path.join(swiftPath, '/usr/bin' )
  core.addPath(binPath)
}

async function download(version: string, ubuntuVersion: string) {
  let versionUpperCased = version.toUpperCase()
  let ubuntuVersionString = ubuntuVersion.replace(/\D/g, "")
  let url = `https://swift.org/builds/swift-${version}/ubuntu${ubuntuVersionString}/swift-${versionUpperCased}/swift-${versionUpperCased}-ubuntu${ubuntuVersion}.tar.gz`

  return await Promise.all([
    toolCache.downloadTool(url),
    toolCache.downloadTool(`${url}.sig`)
  ])
}

async function unpack(packagePath: string, version: string) {
  let extractPath = await toolCache.extractTar(packagePath)
  let basename = path.basename(packagePath, '.tar.gz')
  let cachedPath = await toolCache.cacheDir(path.join(extractPath, basename), 'swift-linux', version)
  return cachedPath
}

async function setupKeys() {
  await exec('wget -q -O - https://swift.org/keys/all-keys.asc | gpg --import -')
  await exec('gpg --keyserver hkp://pool.sks-keyservers.net --refresh-keys Swift')
}

async function verify(path: string) { 
  await exec('gpg', ['--verify', path])
}
