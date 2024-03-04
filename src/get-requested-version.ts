import * as core from "@actions/core";

import { readFile } from "fs";
import { join } from "path";

const semverRegex = /^((?:\d+)(?:\.\d+){0,2})$/;

async function readVersionFromFile(filePath: string) {
  let version = "";

  readFile(filePath, "utf8", (err, data) => {
    if (err != null) throw err;

    const parsedVersion = data.match(semverRegex)?.at(1);

    if (parsedVersion == null)
      throw new Error(
        `Version provided at ${filePath} is in an unexpected format. Please refer to README.md when providing versions.`
      );

    version = parsedVersion;
  });

  return version;
}

export async function getRequestedVersion(): Promise<string> {
  const swiftVersion = core.getInput("swift-version");
  const swiftVersionFile = core.getInput("swift-version-file");

  if (swiftVersion !== "" && swiftVersionFile !== "")
    core.warning(
      "Both swift-version as swift-version-file are set. Continuing with swift-version."
    );

  if (swiftVersion) {
    return swiftVersion;
  }

  if (swiftVersionFile) {
    const versionFilePath = join(
      process.env.GITHUB_WORKSPACE!,
      swiftVersionFile
    );

    return readVersionFromFile(versionFilePath);
  }

  throw new Error(
    "Please set swift-version or swift-version-file in the action's configuration."
  );
}
