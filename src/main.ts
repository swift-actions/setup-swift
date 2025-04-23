import { EOL } from "os";
import { getOS } from "./core";
import { installSwift, setupLinux } from "./swiftly";
import { currentVersion } from "./swift";
import { error, getInput, setFailed, setOutput } from "@actions/core";

/**
 * Main entry point for the action
 */
async function run() {
  try {
    const version = getInput("swift-version", { required: true });
    const os = await getOS();

    switch (os) {
      case "darwin":
        throw Error("Not implemented yet on macOS");
      case "linux":
        await setupLinux();
        break;
      case "win32":
        throw Error("Not implemented yet on Windows");
    }

    await installSwift(version);

    const current = await currentVersion();
    if (current === version) {
      setOutput("version", version);
    } else {
      error(
        `Failed to setup requested swift version. requestd: ${version}, actual: ${current}`,
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
