import * as core from '@actions/core'
import * as toolCache from '@actions/tool-cache'

export async function getSwiftenv(version: string) {
  let toolPath = toolCache.find('swiftenv', version)

  if (!toolPath) {
    return installSwiftenv(version)
  }
  
  return toolPath
}

async function installSwiftenv(version: string) {
  return await core.group('Install swifenv', async () => {
    let downloadPath = await toolCache.downloadTool('https://github.com/kylef/swiftenv/archive/' + version + '.tar.gz')
    let extractPath = await toolCache.extractTar(downloadPath)
    let cachedPath = await toolCache.cacheDir(extractPath, 'swiftenv', version)
    return cachedPath
  })
}
