import { getInput, info, warning } from "@actions/core";
import { readFile } from "fs/promises";
import { basename, resolve } from "path";
import { valid } from "semver";

export async function getRequestedVersion(): Promise<string> {
  const version = getInput("swift-version");
  const versionFile = getInput("swift-version-file");

  if (version) {
    if (versionFile) {
      warning(
        "Both swift-version and swift-version-file are set. Using swift-version.",
      );
    }
    return version;
  }

  const filePath = resolve(
    process.env.GITHUB_WORKSPACE || process.cwd(),
    versionFile || ".swift-version",
  );

  let contents: string;
  try {
    contents = await readFile(filePath, "utf8");
  } catch (error) {
    if (!versionFile && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return "latest";
    }
    throw error;
  }

  let requestedVersion = contents.trim();

  if (basename(filePath) === "Package.swift") {
    requestedVersion = toolsVersionFromManifest(contents);

    const isNumericVersion = /^[\d.]+$/.test(requestedVersion);
    const normalizedVersion =
      requestedVersion.split(".").length === 2
        ? `${requestedVersion}.0`
        : requestedVersion;

    if (!isNumericVersion || !valid(normalizedVersion)) {
      throw new Error(
        `No valid swift-tools-version declaration found in ${filePath}.`,
      );
    }
  }

  if (!requestedVersion || /[\r\n]/.test(requestedVersion)) {
    throw new Error(`Expected a single Swift version in ${filePath}.`);
  }

  info(`Resolved Swift version ${requestedVersion} from ${filePath}`);
  return requestedVersion;
}

function toolsVersionFromManifest(contents: string): string {
  const prefix = "swift-tools-version:";

  for (const line of contents.split(/[\r\n]/)) {
    const comment = line.trimStart();
    if (!comment.startsWith("//")) continue;

    const declaration = comment.slice(2).trimStart();
    if (declaration.toLowerCase().startsWith(prefix)) {
      return declaration.slice(prefix.length).split(";")[0].trim();
    }
  }

  return "";
}
