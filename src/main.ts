import { EOL } from "os";
import * as core from "@actions/core";
import { getVersion } from "./get-version";
import { OS, getSystem } from "./os";
import { install as macos_install } from "./macos-install";
import { install as linux_install } from "./linux-install";
import { install as windows_install } from "./windows-install";
import { getPackage } from "./swift-package";

async function run() {
  try {
    const requestedVersion = core.getInput("swift-version", { required: true });
    let system = await getSystem();
    const pkg = await getPackage(requestedVersion, system);
    switch (system.os) {
      case OS.MacOS:
        await macos_install(pkg);
        break;
      case OS.Ubuntu:
        await linux_install(pkg, system);
        break;
      case OS.Windows:
        await windows_install(pkg, system);
    }
    const current = await getVersion();
    if (current === pkg.version) {
      core.setOutput("version", pkg.version);
    } else {
      core.error(
        `Failed to setup requested swift version. requested: ${pkg.version}, actual: ${current}`
      );
    }
  } catch (error) {
    let dump: String;
    if (error instanceof Error) {
      dump = `${error.message}${EOL}Stacktrace:${EOL}${error.stack}`;
    } else {
      dump = `${error}`;
    }
    core.setFailed(
      `Unexpected error, unable to continue. Please report at https://github.com/swift-actions/setup-swift/issues${EOL}${dump}`
    );
  }
}

run();
