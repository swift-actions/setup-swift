import { downloadTool, find } from "@actions/tool-cache";
import { cmd } from "../../core";
import { addPath, debug } from "@actions/core";

export async function setupMacOS() {
  let path = find("swiftly", "1.0.0");

  if (!path) {
    path = await download();
  } else {
    debug("Found cached Swiftly");
  }

  addPath(path);

  debug(`Added Swiftly to PATH: ${path}`);
}

async function download() {
  const pkg = await downloadTool(
    "https://download.swift.org/swiftly/darwin/swiftly.pkg",
  );
  await cmd("installer", "-pkg", pkg, "-target", "CurrentUserHomeDirectory");
  return "~/.swiftly/bin/swiftly";
}
