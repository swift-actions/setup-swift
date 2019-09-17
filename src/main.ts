import * as os from 'os'
import * as semver from 'semver' 
import * as core from '@actions/core'
import * as versions from './swift-versions'
import * as linux from './linux-install'

async function run() {

  let version = versions.verify(core.getInput('swift-version', { required: true }))

  let platform = os.platform()
  switch (platform) {
    case 'linux':
      await linux.install(version)
      break
    default:
      core.setFailed(`${platform} is not supported`)
      return
  }
}

run();
