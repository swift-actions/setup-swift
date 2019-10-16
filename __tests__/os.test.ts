import * as os from '../src/os'

describe('os resolver', () => {
  it('finds matching system and version', () => {
    let ubuntu = os.getSystem('ubuntu-18.04')
    expect(ubuntu.os).toBe(os.OS.Ubuntu)
    expect(ubuntu.version).toBe('18.04')
    expect(ubuntu.name).toBe('ubuntu-18.04')


    let mac = os.getSystem('macOS-latest')
    expect(mac.os).toBe(os.OS.MacOS)
    expect(mac.version).toBe('latest')
    expect(mac.name).toBe('macOS-latest')
  })

  it('throws an error if the provided system is invalid', () => {
    expect.assertions(2)
    try {
      os.getSystem('')
    } catch (e) {
      expect(e).toEqual(new Error('Provided os "" not valid'))
    }
    try {
      os.getSystem('foobar')
    } catch (e) {
      expect(e).toEqual(new Error('Provided os "foobar" not valid'))
    }
  })

  it('throws an error if the os is not supported', () => {
    expect.assertions(1)
    try {
      os.getSystem('foobar-1.0')
    } catch (e) {
      expect(e).toEqual(new Error('"foobar" is not a supported platform'))
    }
  })

  it('throws an error if the version is not supported', () => {
    expect.assertions(1)
    try {
      os.getSystem('macOS-0.1')
    } catch (e) {
      expect(e).toEqual(new Error('Version "0.1" of macOS is not supported'))
    }
  })
})
