import * as os from "../src/os";

jest.mock("getos");

const setSystem = require("getos").__setSystem;

describe("os resolver", () => {
  it("finds matching system and version", async () => {
    setSystem({ os: "linux", dist: "Ubuntu", release: "18.04" });

    let ubuntu = await os.getSystem();
    expect(ubuntu.os).toBe(os.OS.Ubuntu);
    expect(ubuntu.version).toBe("18.04");
    expect(ubuntu.name).toBe("Ubuntu");

    setSystem({ os: "darwin", dist: "macOS", release: "latest" });

    let mac = await os.getSystem();
    expect(mac.os).toBe(os.OS.MacOS);
    expect(mac.version).toBe("latest");
    expect(mac.name).toBe("macOS");

    setSystem({ os: "win32", dist: "Windows", release: "latest" });

    let windows = await os.getSystem();
    expect(windows.os).toBe(os.OS.Windows);
    expect(windows.version).toBe("latest");
    expect(windows.name).toBe("Windows");
  });

  it("throws an error if the os is not supported", async () => {
    setSystem({ os: "windows", dist: "Microsoft Windows 10", release: "10.0" });
    expect.assertions(1);
    try {
      await os.getSystem();
    } catch (e) {
      expect(e).toEqual(new Error('"windows" is not a supported platform'));
    }
  });

  it("throws an error if the version is not supported", async () => {
    setSystem({ os: "linux", dist: "Ubuntu", release: "15.04" });
    expect.assertions(1);
    try {
      await os.getSystem();
    } catch (e) {
      expect(e).toEqual(
        new Error('Version "15.04" of Ubuntu is not supported')
      );
    }
  });
});
