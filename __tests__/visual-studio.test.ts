import os from "os";
import * as path from "path";
import * as vs from "../src/visual-studio";
import { getPackage } from "../src/swift-package";
import { OS, System } from "../src/os";

jest.mock("fs", () => {
  const original = jest.requireActual("fs");
  return {
    ...original,
    existsSync: jest.fn((path) => true),
  };
});

const windows: System = { os: OS.Windows, version: "latest", name: "Windows" };

describe("visual studio resolver", () => {
  const env = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
  });

  it("fetches visual studio requirement for swift version", async () => {
    jest.spyOn(os, "release").mockReturnValue("10.0.17763");

    const req5_3 = vs.vsRequirement(await getPackage("5.3", windows));
    expect(req5_3.version).toBe("16");
    expect(req5_3.components).toContain(
      "Microsoft.VisualStudio.Component.VC.Tools.x86.x64"
    );
    expect(req5_3.components).toContain(
      "Microsoft.VisualStudio.Component.Windows10SDK.17763"
    );

    const req5_6 = vs.vsRequirement(await getPackage("5.6", windows));
    expect(req5_6.version).toBe("16");
    expect(req5_6.components).toContain(
      "Microsoft.VisualStudio.Component.VC.Tools.x86.x64"
    );
    expect(req5_6.components).toContain(
      "Microsoft.VisualStudio.Component.Windows10SDK.17763"
    );
  });

  it("adds latest sdk for release newer than or equal to build 17763", async () => {
    jest.spyOn(os, "release").mockReturnValue("10.0.17763");
    const req17763 = vs.vsRequirement(await getPackage("5.3", windows));
    expect(req17763.components).toContain(
      "Microsoft.VisualStudio.Component.Windows10SDK.17763"
    );

    jest.spyOn(os, "release").mockReturnValue("10.0.18363");
    const req18363 = vs.vsRequirement(await getPackage("5.3", windows));
    expect(req18363.components).toContain(
      "Microsoft.VisualStudio.Component.Windows10SDK.18363"
    );
  });

  it("adds recommended sdk for release older than build 17763", async () => {
    jest.spyOn(os, "release").mockReturnValue("10.0.16299");
    const req16299 = vs.vsRequirement(await getPackage("5.3", windows));
    expect(req16299.components).toContain(
      "Microsoft.VisualStudio.Component.Windows10SDK.17763"
    );
  });

  it("finds vswhere path from environment value", async () => {
    const vswherePath = path.join("C:", "bin");
    const vswhereExe = path.join(vswherePath, "vswhere.exe");
    process.env.VSWHERE_PATH = vswherePath;
    expect(await vs.getVsWherePath()).toBe(vswhereExe);
  });

  it("finds vswhere path from ProgramFiles environment value", async () => {
    const vswhereExe = path.join(
      "C:",
      "Program Files (x86)",
      "Microsoft Visual Studio",
      "Installer",
      "vswhere.exe"
    );
    process.env["ProgramFiles(x86)"] = path.join("C:", "Program Files (x86)");
    expect(await vs.getVsWherePath()).toBe(vswhereExe);
  });
});
