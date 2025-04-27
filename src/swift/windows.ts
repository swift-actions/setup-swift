import { addPath, debug } from "@actions/core";
import { downloadTool, find } from "@actions/tool-cache";
import { cmd } from "../core";
import { machine } from "os";

/**
 * Setup Swift on Windows as theres no support for Swiftly yet.
 */
export async function setupWindows(version: string) {
  await download(version);
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

  const installerPath = await downloadTool(url);

  await cmd(installerPath);
}
