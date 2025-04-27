import { EOL } from "os";
import { equalVersions, getOS } from "./core";
import { installSwift, setupLinux, setupMacOS } from "./swiftly";
import { currentVersion } from "./swift";
import { error, getInput, info, setFailed, setOutput } from "@actions/core";

/**
 * Main entry point for the action
 */
async function run() {
  try {
    const version = getInput("swift-version", { required: true });
    const os = await getOS();

    // First check if the requested version is already installed
    let current = await currentVersion().catch(() => null);
    if (equalVersions(version, current)) {
      info(`Swift ${version} is already installed`);
      setOutput("version", version);
      return;
    }

    // Setup Swiftly on the runner
    switch (os) {
      case "darwin":
        await setupMacOS();
        break;
      case "linux":
        await setupLinux({ skipVerifySignature: true });
        break;
      case "win32":
        throw Error("Not implemented yet on Windows");
    }

    // Install the requested version
    await installSwift(version);

    // Verify the requested version is now installed
    current = await currentVersion();
    if (equalVersions(version, current)) {
      setOutput("version", version);
    } else {
      error(
        `Failed to setup requested Swift version. requested: ${version}, actual: ${current}`,
      );
    }
  } catch (error) {
    let dump: String;
    if (error instanceof Error) {
      dump = `${error.message}${EOL}Stacktrace:${EOL}${error.stack}`;
    } else {
      dump = `${error}`;
    }

    setFailed(
      `Unexpected error, unable to continue. Please report at https://github.com/swift-actions/setup-swift/issues${EOL}${dump}`,
    );
  }
}

run();
