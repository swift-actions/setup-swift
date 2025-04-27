import { downloadTool, extractTar, find } from "@actions/tool-cache";
import { cmd, tempDir } from "../../core";
import { addPath, debug } from "@actions/core";
import { join } from "path";

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
  const tmpPath = tempDir();
  const pkg = await downloadTool(
    "https://download.swift.org/swiftly/darwin/swiftly.pkg",
    join(tmpPath, "swiftly.pkg"),
  );

  const target = join(tmpPath, "bin");

  await cmd("installer", "-pkg", pkg, "-target", target);

  return target;
}
