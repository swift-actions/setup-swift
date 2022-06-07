import { exec } from "@actions/exec";

export async function getVersion(
  command: string = "swift",
  args: string[] = ["--version"]
) {
  let output = "";
  let error = "";

  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
      stderr: (data: Buffer) => {
        error += data.toString();
      },
    },
  };

  await exec(command, args, options);

  if (!output && error) {
    throw new Error("Error getting swift version " + error);
  }

  return versionFromString(output);
}

export function versionFromString(subject: string): string | null {
  const match = subject.match(
    /Swift\ version (?<version>[0-9]+\.[0-9+]+(\.[0-9]+)?)/
  ) || {
    groups: { version: null },
  };

  if (!match.groups || !match.groups.version) {
    return null;
  }

  return match.groups.version;
}
