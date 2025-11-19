import { getOS } from "../src/core";

jest.mock("getos");

const setSystem = require("getos").__setSystem;

describe("os resolver", () => {
  it("finds matching system and version", async () => {
    setSystem({ os: "linux", dist: "Ubuntu", release: "22.04" });

    let ubuntu = await getOS();
    expect(ubuntu).toBe("linux");

    setSystem({ os: "darwin", dist: "macOS", release: "latest" });

    let mac = await getOS();
    expect(mac).toBe("darwin");

    setSystem({ os: "win32", dist: "Windows", release: "latest" });

    let windows = await getOS();
    expect(windows).toBe("win32");
  });
});
