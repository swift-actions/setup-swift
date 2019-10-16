import * as core from '@actions/core'

export enum OS {
  MacOS = "macOS",
  Ubuntu = "ubuntu",
}

const AVAILABLE_OS: { [platform: string]: string[] } = {
  'macOS': ['latest', '10.14'],
  'ubuntu': ['18.04', '16.04']
}

export interface System {
  os: OS
  version: string
  name: string
}

export function getSystem(system: string): System {
  let parts = system.split('-')

  if (parts.length < 2) {
    throw new Error(`Provided os "${system}" not valid`)
  }

  let name = parts[0]
  let version = name == 'ubuntu' && parts[1] == 'latest' ? '18.04' : parts[1]

  if (!Object.keys(AVAILABLE_OS).includes(name)) {
    throw new Error(`"${name}" is not a supported platform`)
  }

  if (!AVAILABLE_OS[name].includes(version)) {
    throw new Error(`Version "${version}" of ${name} is not supported`)
  }

  let enumName = name[0].toUpperCase() + name.slice(1)

  return { os: (<any>OS)[enumName], version, name: `${name}-${version}` }
}
