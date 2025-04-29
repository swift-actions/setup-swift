import { addPath, debug } from "@actions/core";
import { downloadTool } from "@actions/tool-cache";
import { cmd, tempDir } from "../core";
import { machine } from "os";
import { join } from "path";
import { coerce } from "semver";

/**
 * Setup Swift on Windows as theres no support for Swiftly yet.
 */
export async function setupWindows(version: string) {
  const path = await download(version);
  addPath(path);
}

async function download(version: string) {
  const m = machine();

  let url: string;
  if (m === "arm64") {
    url = `https://download.swift.org/swift-${version}-release/windows10-arm64/swift-${version}-RELEASE/swift-${version}-RELEASE-windows10-arm64.exe`;
  } else {
    url = `https://download.swift.org/swift-${version}-release/windows10/swift-${version}-RELEASE/swift-${version}-RELEASE-windows10.exe`;
  }

  debug(`Downloading Swift installer from ${url}`);

  const tmpPath = tempDir();

  const installerPath = await downloadTool(
    url,
    join(tmpPath, "swift-installer.exe"),
  );

  const targetPath = join(tmpPath, "Swift");

  await cmd(
    installerPath,
    "/passive",
    "/quiet",
    "/norestart",
    `InstallRoot=${targetPath}`,
  );

  return join(
    targetPath,
    "Toolchains",
    `${coerce(version)}+Asserts`,
    "usr",
    "bin",
  );
}
