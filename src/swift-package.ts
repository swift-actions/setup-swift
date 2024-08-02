import { OS, System } from "./os";
import { Snapshot, SnapshotResolver } from "./snapshot-resolver";
import { verify } from "./swift-versions";

export interface Package {
  url: string;
  name: string;
  version: string;
}

export async function getPackage(
  requestedVersion: string,
  system: System
): Promise<Package> {
  try {
    let version = verify(requestedVersion, system);
    return makeStablePackage(version, system);
  } catch {
    const resolver = new SnapshotResolver(null);
    const snapshot = await resolver.execute(requestedVersion, system);
    return makeSnapshotPackage(snapshot, system);
  }
}

function makeStablePackage(version: string, system: System): Package {
  return makePackage(
    version,
    `swift-${version}-release/`,
    `swift-${version}-RELEASE`,
    system
  );
}

function makeSnapshotPackage(snapshot: Snapshot, system: System): Package {
  if (snapshot.branch === "main") {
    return makePackage(
      "6.0",
      "development",
      `swift-DEVELOPMENT-SNAPSHOT-${snapshot.date}-a`,
      system
    );
  }
  return makePackage(
    snapshot.branch,
    `swift-${snapshot.branch}-branch`,
    `swift-${snapshot.branch}-DEVELOPMENT-SNAPSHOT-${snapshot.date}-a`,
    system
  );
}

function makePackage(
  version: string,
  root: string,
  identifier: string,
  system: System
): Package {
  let platform: string;
  let archiveName: string;
  let archiveFile: string;
  switch (system.os) {
    case OS.MacOS:
      platform = "xcode";
      archiveName = `${identifier}-osx`;
      archiveFile = `${archiveName}.pkg`;
      break;
    case OS.Ubuntu:
      platform = `ubuntu${system.version.replace(/\D/g, "")}`;
      archiveName = `${identifier}-ubuntu${system.version}`;
      archiveFile = `${archiveName}.tar.gz`;
      break;
    case OS.Windows:
      platform = "windows10";
      archiveName = `${identifier}-windows10.exe`;
      archiveFile = archiveName;
      break;
    default:
      throw new Error("Cannot create download URL for an unsupported platform");
  }
  let url = "https://swift.org/builds/";
  url += `${root}/`;
  url += `${platform}/`;
  url += `${identifier}/`;
  url += archiveFile;
  return {
    url: url,
    name: archiveName,
    version: version,
  };
}
