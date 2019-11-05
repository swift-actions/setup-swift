import * as core from '@actions/core'
import * as system from './os'
import * as versions from './swift-versions'
import * as macos from './macos-install'
import * as linux from './linux-install'

async function run() {
  let version = versions.verify(core.getInput('swift-version', { required: true }))

  let platform = await system.getSystem()
  switch (platform.os) {
    case system.OS.MacOS:
      await macos.install(version, platform)
      break
    case system.OS.Ubuntu:
      await linux.install(version, platform)
      break
  }
}

run();
