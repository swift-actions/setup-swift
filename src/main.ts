import { EOL } from "os";
import { matchesVersion, getOS } from "./core";
import { installSwift, setupLinux, setupMacOS } from "./swiftly";
import { currentVersion } from "./swift";
import {
  getBooleanInput,
  getInput,
  info,
  setFailed,
  setOutput,
} from "@actions/core";
import { setupWindows } from "./windows";

/**
 * Main entry point for the action
 */
async function run() {
  try {
    const version = getInput("swift-version", { required: true });
    const skipVerifySignature = getBooleanInput("skip-verify-signature");
    const os = await getOS();

    // First check if the requested version is already installed
    let current = await currentVersion().catch(() => null);
    if (version !== "latest" && current && matchesVersion(version, current)) {
      info(`Swift ${current} is already installed`);
      setOutput("version", current);
      return;
    }

    // Setup Swiftly on the runner
    let installedVersion: string | undefined;
    switch (os) {
      case "darwin":
        await setupMacOS();
        installedVersion = await installSwift(version);
        break;
      case "linux":
        await setupLinux({ skipVerifySignature });
        installedVersion = await installSwift(version);
        break;
      case "win32":
        await setupWindows(version);
        break;
    }

    // Verify the requested version is now installed
    current = await currentVersion();
    const resolvedVersion = installedVersion ?? current;
    const isSnapshot = resolvedVersion?.includes("-snapshot-") ?? false;
    const snapshotBranch =
      resolvedVersion && isSnapshot
        ? resolvedVersion.slice(0, resolvedVersion.indexOf("-snapshot-"))
        : undefined;
    if (
      current &&
      matchesVersion(version, resolvedVersion) &&
      (isSnapshot
        ? current.endsWith("-dev") &&
          (snapshotBranch === "main" ||
            matchesVersion(snapshotBranch, current.slice(0, -4)))
        : matchesVersion(resolvedVersion, current))
    ) {
      setOutput("version", isSnapshot ? resolvedVersion : current);
    } else {
      setFailed(
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
