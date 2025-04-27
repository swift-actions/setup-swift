import { addPath, debug } from "@actions/core";
import { find } from "@actions/tool-cache";
import { cmd } from "../../core";

export async function setupWindows() {
  //let path = find("swiftly", "1.0.0");

  //if (!path) {
  //  path = await download();
  //} else {
  //  debug("Found cached Swiftly");
  //}

  //addPath(path);

  await download();

  debug(`Added Swiftly`);
}

async function download() {
  await cmd("winget", "install", "--id", "Swift.Toolchain", "-e");
}

async function prerequisites() {
  await cmd(
    "winget",
    "install",
    "--id",
    "Microsoft.VisualStudio.2022.Community",
    "--exact",
    "--force",
    "--custom",
    '"--add Microsoft.VisualStudio.Component.Windows11SDK.22000 --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 --add Microsoft.VisualStudio.Component.VC.Tools.ARM64"',
  );
}
