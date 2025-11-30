import { debug, error } from "@actions/core";
import { exec } from "@actions/exec";

/**
 * Runs a command and returns the output
 * @param command Command to run
 * @param args Arguments to pass to the command
 * @returns Output of the command
 */
export async function cmd(command: string, ...args: string[]) {
  let stdout = "";
  let stderr = "";

  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        stdout += data.toString();
      },
      stderr: (data: Buffer) => {
        stderr += data.toString();
      },
    },
  };

  debug(`Running command: ${command} ${args.join(" ")}`);

  const code = await exec(command, args, options);

  if (code !== 0) {
    error(`Command failed with code ${code}`);
    throw new Error("Error running command " + error);
  }

  debug(`Command output: ${stdout}`);

  return stdout;
}
