import * as core from '@actions/core'
import * as toolCache from '@actions/tool-cache'
import { System } from './os'

export async function install(version: string, system: System) {
  core.exportVariable('TOOLCHAINS', version)
}
