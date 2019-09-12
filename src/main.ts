import * as core from '@actions/core'
import { selectSwift } from './select-swift'

async function run() {
  let version = core.getInput('swift-version', { required: true })
  await selectSwift(version)
}

run();
