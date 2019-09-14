import * as path from 'path'
import * as core from '@actions/core'
import * as toolCache from '@actions/tool-cache'

export async function setupSwiftenv(version: string) {
  let toolPath = toolCache.find('swiftenv', version) || await installSwiftenv(version)

  core.exportVariable('SWIFTENV_ROOT', toolPath)
  let binPath = path.join(toolPath, '/bin' )
  core.addPath(binPath)
  
  return binPath
}

async function installSwiftenv(version: string) {
  return await core.group('Install swifenv', async () => {
    let downloadPath = await toolCache.downloadTool('https://github.com/kylef/swiftenv/archive/' + version + '.tar.gz')
    let extractPath = await toolCache.extractTar(downloadPath)
    let cachedPath = await toolCache.cacheDir(extractPath, 'swiftenv', version)
    return cachedPath
  })
}
