import * as core from '@actions/core'
import * as toolCache from '@actions/tool-cache'
import * as io from '@actions/io'
import * as path from 'path'
import { exec } from '@actions/exec'
import { System } from './os'
import { swiftPackage, Package } from './swift-versions'

export async function install(version: string, system: System) {
  
  const toolchainName = `swift ${version}`
  const toolchain = await toolchainVersion(toolchainName)

  if (toolchain !== version) {
    let swiftPath = toolCache.find('swift-macOS', version)

    if (swiftPath === null || swiftPath.trim().length == 0) {
      core.debug(`No matching installation found`)

      const pkg = swiftPackage(version, system)
      const path = await download(pkg)
      const extracted = await unpack(pkg, path, version)

      swiftPath = extracted
    } else {
      core.debug('Matching installation found')
    }

    core.debug('Adding swift to path')

    let binPath = path.join(swiftPath, '/usr/bin')
    core.addPath(binPath)
  
    core.debug('Swift installed')
  }

  core.exportVariable('TOOLCHAINS', toolchainName)
}

async function toolchainVersion(requestedVersion: string) {
  let output = ''
  let error = ''

  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString()
      },
      stderr: (data: Buffer) => {
        error += data.toString()
      }
    }
  }

  await exec('xcrun', ['--toolchain', requestedVersion, '--run', 'swift', '--version'], options)

  if (error) {
    throw new Error(error)
  }

  const match = output.match(/(?<version>[0-9]+\.[0-9+]+(\.[0-9]+)?)/) || { groups: { version: null } }

  if (!match.groups || !match.groups.version) {
    return null
  }

  return match.groups.version
}

async function download({ url }: Package) {
  core.debug('Downloading swift for macOS')
  return toolCache.downloadTool(url)
}

async function unpack({ name }: Package, packagePath: string, version: string) {
  core.debug('Extracting package')
  const unpackedPath = await extractXar(packagePath)
  const extractedPath = await toolCache.extractTar(path.join(unpackedPath, name, 'Payload'))
  core.debug('Package extracted')
  const cachedPath = await toolCache.cacheDir(extractedPath, 'swift-macOS', version)
  core.debug('Package cached')
  return cachedPath
}

//FIXME: Workaround until https://github.com/actions/toolkit/pull/207 is merged
export async function extractXar(file: string): Promise<string> {
  const dest = path.join(process.env['RUNNER_TEMP'] || '', 'setup-swift', 'extract.tmp')
  await io.mkdirP(dest)
  const xarPath: string = await io.which('xar', true)
  await exec(`"${xarPath}"`, ['-x', '-C', dest, '-f', file])
  return dest
}
