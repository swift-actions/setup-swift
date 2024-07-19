import getos from "getos";
import getArch from "./arch";

export enum OS {
  MacOS,
  Ubuntu,
  Windows,
}

export namespace OS {
  export function all(): OS[] {
    return [OS.MacOS, OS.Ubuntu, OS.Windows];
  }
}

const AVAILABLE_OS: { [platform: string]: string[] } = {
  macOS: ["latest", "14", "13", "12", "11"],
  Ubuntu: ["latest", "24.04", "22.04", "20.04"],
  Windows: ["latest", "10"],
};

export interface System {
  os: OS;
  version: string;
  name: string;
  arch: string;
}

export async function getSystem(): Promise<System> {
  let detectedSystem = await new Promise<getos.Os>((resolve, reject) => {
    getos((error, os) => {
      os ? resolve(os) : reject(error || "No OS detected");
    });
  });
  const arch = getArch();

  let system: System;

  switch (detectedSystem.os) {
    case "darwin":
      system = {
        os: OS.MacOS,
        version: "latest",
        name: "macOS",
        arch,
      };
      break;
    case "linux":
      if (detectedSystem.dist !== "Ubuntu") {
        throw new Error(
          `"${detectedSystem.dist}" is not a supported Linux distribution`
        );
      }
      if (arch !== "x64" && arch !== "arm64") {
        throw new Error(`${arch} is not a supported architecture for Linux`);
      }
      system = {
        os: OS.Ubuntu,
        version: detectedSystem.release,
        name: "Ubuntu",
        arch,
      };
      break;
    case "win32":
      if (arch !== "x64") {
        throw new Error(`${arch} is not a supported architecture for Windows`);
      }
      system = {
        os: OS.Windows,
        version: "latest",
        name: "Windows",
        arch,
      };
      break;
    default:
      throw new Error(`"${detectedSystem.os}" is not a supported platform`);
  }

  if (!AVAILABLE_OS[system.name].includes(system.version)) {
    throw new Error(
      `Version "${system.version}" of ${system.name} is not supported`
    );
  }

  return system;
}
