import * as core from "@actions/core";
import { mkdtemp, mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { getRequestedVersion } from "../src/swift";

describe("requested Swift version", () => {
  let workspace: string;
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    workspace = await mkdtemp(join(tmpdir(), "setup-swift-version-"));
    process.env.GITHUB_WORKSPACE = workspace;
    delete process.env["INPUT_SWIFT-VERSION"];
    delete process.env["INPUT_SWIFT-VERSION-FILE"];
    jest.spyOn(core, "info").mockImplementation(() => {});
    jest.spyOn(core, "warning").mockImplementation(() => {});
  });

  afterEach(async () => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
    await rm(workspace, { recursive: true, force: true });
  });

  it("prefers an explicit version over an explicitly selected missing file", async () => {
    process.env["INPUT_SWIFT-VERSION"] = "6.2.1";
    process.env["INPUT_SWIFT-VERSION-FILE"] = "missing";

    await expect(getRequestedVersion()).resolves.toBe("6.2.1");
    expect(core.warning).toHaveBeenCalledWith(
      "Both swift-version and swift-version-file are set. Using swift-version.",
    );
  });

  it("prefers an explicit selector over the root version file", async () => {
    process.env["INPUT_SWIFT-VERSION"] = "latest";
    await writeFile(join(workspace, ".swift-version"), "6.2.1\n");

    await expect(getRequestedVersion()).resolves.toBe("latest");
    expect(core.warning).not.toHaveBeenCalled();
  });

  it("reads a selector from the root file, trimming whitespace and CRLF", async () => {
    await writeFile(
      join(workspace, ".swift-version"),
      "\uFEFF main-snapshot-2025-09-01 \r\n",
    );

    await expect(getRequestedVersion()).resolves.toBe(
      "main-snapshot-2025-09-01",
    );
    expect(core.warning).not.toHaveBeenCalled();
  });

  it("reads an explicit nested file instead of the root file", async () => {
    await mkdir(join(workspace, "my package"));
    const file = join("my package", "version.txt");
    await writeFile(join(workspace, file), "6.2.1\n");
    await writeFile(join(workspace, ".swift-version"), "5.10\n");
    process.env["INPUT_SWIFT-VERSION-FILE"] = file;

    await expect(getRequestedVersion()).resolves.toBe("6.2.1");
  });

  it("uses latest when no input or root version file exists", async () => {
    await writeFile(
      join(workspace, "Package.swift"),
      "// swift-tools-version:6.2\n",
    );

    await expect(getRequestedVersion()).resolves.toBe("latest");
  });

  it("fails for an explicit missing file even when the root file exists", async () => {
    process.env["INPUT_SWIFT-VERSION-FILE"] = "missing";
    await writeFile(join(workspace, ".swift-version"), "6.2.1\n");

    await expect(getRequestedVersion()).rejects.toMatchObject({
      code: "ENOENT",
    });
  });

  it("does not hide errors reading the default file", async () => {
    await mkdir(join(workspace, ".swift-version"));

    await expect(getRequestedVersion()).rejects.toMatchObject({
      code: "EISDIR",
    });
  });

  it.each([" \r\n", "6.2\n6.3"])(
    "rejects an empty or multiline version file: %j",
    async (contents) => {
      await writeFile(join(workspace, ".swift-version"), contents);

      await expect(getRequestedVersion()).rejects.toThrow(
        `Expected a single Swift version in ${join(workspace, ".swift-version")}.`,
      );
    },
  );

  it.each([
    ["// swift-tools-version:5.10", "5.10"],
    [
      "// License header\r\n\t//\tSWIFT-TOOLS-VERSION: 6.2.1; trailing comment\r\n",
      "6.2.1",
    ],
  ])(
    "reads the tools version from a nested manifest: %j",
    async (header, version) => {
      await mkdir(join(workspace, "package"));
      process.env["INPUT_SWIFT-VERSION-FILE"] = "package/Package.swift";
      await writeFile(
        join(workspace, "package", "Package.swift"),
        `${header}\nimport PackageDescription\nlet package = Package(name: "Example")\n`,
      );

      await expect(getRequestedVersion()).resolves.toBe(version);
    },
  );

  it.each(["import PackageDescription", "// swift-tools-version: 6.2.3.4"])(
    "rejects a missing or malformed tools version: %j",
    async (contents) => {
      process.env["INPUT_SWIFT-VERSION-FILE"] = "Package.swift";
      await writeFile(join(workspace, "Package.swift"), contents);

      await expect(getRequestedVersion()).rejects.toThrow(
        `No valid swift-tools-version declaration found in ${join(workspace, "Package.swift")}.`,
      );
    },
  );
});
