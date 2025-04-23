import { debug } from "@actions/core";
import { exec } from "@actions/exec";

/**
 * Runs a command and returns the output
 * @param command Command to run
 * @param args Arguments to pass to the command
 * @returns Output of the command
 */
export async function cmd(command: string, ...args: string[]) {
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

  debug(`Running command: ${command} ${args.join(" ")}`);

  await exec(command, args, options);

  if (!output && error) {
    throw new Error("Error running command " + error);
  }

  debug(`Command output: ${output}`);

  return output;
}
