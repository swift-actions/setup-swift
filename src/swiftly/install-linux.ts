import { machine } from "os";
import { addPath, debug, info } from "@actions/core";
import { downloadTool, find, extractTar, cacheDir } from "@actions/tool-cache";
import { verify } from "../core/gpg";

interface Options {
  /** Skip signature verification */
  skipVerifySignature?: boolean;
}

/**
 * Setup Swiftly on Linux
 */
export async function setupLinux(options: Options) {
  let path = find("swiftly", "1.0.0");

  if (!path) {
    path = await download(options);
  } else {
    debug("Found cached Swiftly");
  }

  addPath(path);
}

async function download({ skipVerifySignature = false }: Options = {}) {
  info("Downloading Swiftly");

  const m = machine();
  const url = `https://download.swift.org/swiftly/linux/swiftly-1.0.0-${m}.tar.gz`;

  debug(`Downloading Swiftly from ${url}`);

  const [pkg, signature] = await Promise.all([
    downloadTool(url),
    downloadTool(`${url}.sig`),
  ]);

  if (skipVerifySignature) {
    info("Skipping signature verification");
  } else {
    await verify(signature, pkg);
  }

  const extracted = await extractTar(pkg);
  debug(`Extracted Swiftly to ${extracted}`);

  const cached = await cacheDir(extracted, "swiftly", "1.0.0");
  debug(`Cached Swiftly to ${cached}`);

  return cached;
}
