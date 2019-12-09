import * as core from '@actions/core'
import * as toolCache from '@actions/tool-cache'
import * as io from '@actions/io'
import * as path from 'path'
import { exec } from '@actions/exec'
import { System } from './os'
import { swiftPackage, Package } from './swift-versions'

export async function install(version: string, system: System) {
  
  const toolchain = await toolchainVersion(version)

  if (toolchain !== version) {
    let swiftPath = toolCache.find('swift-macOS', version)

    if (swiftPath === null || swiftPath.trim().length == 0) {
      core.debug(`No matching installation found`)

      const path = await download(swiftPackage(version, system))
      const extracted = await unpack(path, version)

      swiftPath = extracted
    } else {
      core.debug('Matching installation found')
    }

    core.debug('Adding swift to path')

    let binPath = path.join(swiftPath, '/usr/bin')
    core.addPath(binPath)
  
    core.debug('Swift installed')
  }

  core.exportVariable('TOOLCHAINS', `swift ${version}`)
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

async function setToolchainVersion(requestedVersion: string) {
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

async function unpack(packagePath: string, version: string) {
  core.debug('Extracting package')
  const unpackedPath = await extractXar(packagePath)
  const extractedPath = await toolCache.extractTar(path.join(unpackedPath, 'Payload'))
  core.debug('Package extracted')
  const cachedPath = await toolCache.cacheDir(extractedPath, 'swift-macOS', version)
  core.debug('Package cached')
  return cachedPath
}

//FIXME: Workaround until https://github.com/actions/toolkit/pull/207 is merged
export async function extractXar(file: string): Promise<string> {
  const dest = path.join(process.env['RUNNER_TEMP'] || '', 'setup-swift', 'tmp')
  const xarPath: string = await io.which('xar', true)
  await exec(`"${xarPath}"`, ['-x', '-C', dest, '-f', file])
  return dest
}
