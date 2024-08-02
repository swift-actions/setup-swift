import { OS } from "../src/os";
import { getPackage } from "../src/swift-package";

describe("make package", () => {
  it("main branch for macOS", async () => {
    const pkg = await getPackage("main-snapshot-2024-08-01", {
      os: OS.MacOS,
      version: "latest",
      name: "macOS",
    });

    expect(pkg).toStrictEqual({
      url: "https://swift.org/builds/development/xcode/swift-DEVELOPMENT-SNAPSHOT-2024-08-01-a/swift-DEVELOPMENT-SNAPSHOT-2024-08-01-a-osx.pkg",
      name: "swift-DEVELOPMENT-SNAPSHOT-2024-08-01-a-osx",
      version: "6.0",
    });
  });

  it("main branch for Ubuntu", async () => {
    const pkg = await getPackage("main-snapshot-2024-08-01", {
      os: OS.Ubuntu,
      version: "22.04",
      name: "Ubuntu",
    });

    expect(pkg).toStrictEqual({
      url: "https://swift.org/builds/development/ubuntu2204/swift-DEVELOPMENT-SNAPSHOT-2024-08-01-a/swift-DEVELOPMENT-SNAPSHOT-2024-08-01-a-ubuntu22.04.tar.gz",
      name: "swift-DEVELOPMENT-SNAPSHOT-2024-08-01-a-ubuntu22.04",
      version: "6.0",
    });
  });

  it("simver branch for macOS", async () => {
    const pkg = await getPackage("5.10-snapshot-2024-08-02", {
      os: OS.MacOS,
      version: "latest",
      name: "macOS",
    });

    expect(pkg).toStrictEqual({
      url: "https://swift.org/builds/swift-5.10-branch/xcode/swift-5.10-DEVELOPMENT-SNAPSHOT-2024-08-02-a/swift-5.10-DEVELOPMENT-SNAPSHOT-2024-08-02-a-osx.pkg",
      name: "swift-5.10-DEVELOPMENT-SNAPSHOT-2024-08-02-a-osx",
      version: "5.10",
    });
  });

  it("simver branch for Ubuntu", async () => {
    const pkg = await getPackage("5.10-snapshot-2024-08-02", {
      os: OS.Ubuntu,
      version: "22.04",
      name: "Ubuntu",
    });

    expect(pkg).toStrictEqual({
      url: "https://swift.org/builds/swift-5.10-branch/ubuntu2204/swift-5.10-DEVELOPMENT-SNAPSHOT-2024-08-02-a/swift-5.10-DEVELOPMENT-SNAPSHOT-2024-08-02-a-ubuntu22.04.tar.gz",
      name: "swift-5.10-DEVELOPMENT-SNAPSHOT-2024-08-02-a-ubuntu22.04",
      version: "5.10",
    });
  });
});
