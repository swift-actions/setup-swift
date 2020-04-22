import * as core from "@actions/core";
import * as system from "./os";
import * as versions from "./swift-versions";
import * as macos from "./macos-install";
import * as linux from "./linux-install";
import { getVersion } from "./get-version";

async function run() {
  try {
    const requestedVersion = core.getInput("swift-version", { required: true });
    let version = versions.verify(requestedVersion);

    let platform = await system.getSystem();
    switch (platform.os) {
      case system.OS.MacOS:
        await macos.install(version, platform);
        break;
      case system.OS.Ubuntu:
        await linux.install(version, platform);
        break;
    }

    const current = await getVersion();
    if (current !== version) {
      core.error("Failed to setup requested swift version");
    }
  } catch (error) {
    core.setFailed(
      "Unexpected error, unable to continue. Please report at https://github.com/fwal/setup-swift/issues"
    );
  }
}

run();
