import * as core from '@actions/core'
import * as system from './os'
import * as versions from './swift-versions'
import * as linux from './linux-install'
import * as ops from 'os'
import getos from 'getos'

async function run() {
  let version = versions.verify(core.getInput('swift-version', { required: true }))
  let os = core.getInput('os', { required: true })

  console.log(`This platform is ${process.platform}`)
  console.log(process.env['RUNNER_OS'])

  console.log(ops.release())

  getos((_, os) => {
    console.log(JSON.stringify(os))
  })

  let platform = system.getSystem(os)
  switch (platform.os) {
    case system.OS.Ubuntu:
      await linux.install(version, platform)
      break
    default:
      core.setFailed(`${os} is not supported`)
      return
  }
}

run();
