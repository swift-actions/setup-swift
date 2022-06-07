import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as semver from "semver";
import * as io from "@actions/io";
import * as core from "@actions/core";
import { ExecOptions, exec } from "@actions/exec";
import { Package } from "./swift-versions";

export interface VisualStudio {
  installationPath: string;
  installationVersion: string;
  catalog: VsCatalog;
  properties: VsProperties;
}

export interface VsCatalog {
  productDisplayVersion: string;
}

export interface VsProperties {
  setupEngineFilePath: string;
}

export interface VsRequirement {
  version: string;
  components: string[];
}

/// Setup different version and component requirement
/// based on swift versions if required
function vsRequirement({ version }: Package): VsRequirement {
  const recVersion = "10.0.17763";
  const currentVersion = os.release();
  const useVersion = semver.gte(currentVersion, recVersion)
    ? currentVersion
    : recVersion;
  return {
    version: "16",
    components: [
      "Microsoft.VisualStudio.Component.VC.Tools.x86.x64",
      `Microsoft.VisualStudio.Component.Windows10SDK.${semver.patch(
        useVersion
      )}`,
    ],
  };
}

/// Do swift version based additional support files setup
async function setupSupportFiles({ version }: Package, vsInstallPath: string) {
  if (semver.lt(version, "5.4.2")) {
    /// https://docs.microsoft.com/en-us/cpp/build/building-on-the-command-line?view=msvc-170
    const nativeToolsScriptx86 = path.join(
      vsInstallPath,
      "VC\\Auxiliary\\Build\\vcvars32.bat"
    );
    const copyCommands = [
      'copy /Y %SDKROOT%\\usr\\share\\ucrt.modulemap "%UniversalCRTSdkDir%\\Include\\%UCRTVersion%\\ucrt\\module.modulemap"',
      'copy /Y %SDKROOT%\\usr\\share\\visualc.modulemap "%VCToolsInstallDir%\\include\\module.modulemap"',
      'copy /Y %SDKROOT%\\usr\\share\\visualc.apinotes "%VCToolsInstallDir%\\include\\visualc.apinotes"',
      'copy /Y %SDKROOT%\\usr\\share\\winsdk.modulemap "%UniversalCRTSdkDir%\\Include\\%UCRTVersion%\\um\\module.modulemap"',
    ].join("&&");
    let code = await exec("cmd /k", [nativeToolsScriptx86], {
      failOnStdErr: true,
      input: Buffer.from(copyCommands, "utf8"),
    });
    core.info(`Ran command for swift and exited with code: ${code}`);
  }
}

/// set up required visual studio tools for swift on windows
export async function setupVsTools(pkg: Package) {
  /// https://github.com/microsoft/vswhere/wiki/Find-MSBuild
  /// get visual studio properties
  const vswhereExe = await getVsWherePath();
  const requirement = vsRequirement(pkg);
  const vsWhereExec =
    `-products * ` +
    `-format json -utf8 ` +
    `-latest -version "${requirement.version}"`;

  let payload = "";
  const options: ExecOptions = {};
  options.listeners = {
    stdout: (data: Buffer) => {
      payload = payload.concat(data.toString("utf-8"));
    },
    stderr: (data: Buffer) => {
      core.error(data.toString());
    },
  };

  // execute the find putting the result of the command in the options vsInstallPath
  await exec(`"${vswhereExe}" ${vsWhereExec}`, [], options);
  let vs: VisualStudio = JSON.parse(payload)[0];
  if (!vs.installationPath) {
    core.setFailed(
      `Unable to find any visual studio installation for version: ${requirement.version}.`
    );
    return;
  }

  /// https://docs.microsoft.com/en-us/visualstudio/install/use-command-line-parameters-to-install-visual-studio?view=vs-2022
  /// install required visual studio components
  const vsInstallerExec =
    `modify --installPath "${vs.installationPath}"` +
    requirement.components.reduce(
      (previous, current) => `${previous} --add "${current}"`,
      ""
    ) +
    ` --quiet`;

  // install required visual studio components
  const code = await exec(
    `"${vs.properties.setupEngineFilePath}" ${vsInstallerExec}`,
    []
  );
  if (code != 0) {
    core.setFailed(
      `Visual Studio installer failed to install required components with exit code: ${code}.`
    );
    return;
  }

  await setupSupportFiles(pkg, vs.installationPath);
}

/// Get vswhere and vs_installer paths
/// Borrowed from setup-msbuild action: https://github.com/microsoft/setup-msbuild
/// From source file: https://github.com/microsoft/setup-msbuild/blob/master/src/main.ts
async function getVsWherePath() {
  // check to see if we are using a specific path for vswhere
  let vswhereToolExe = "";
  // Env variable for self-hosted runner to provide custom path
  const VSWHERE_PATH = process.env.VSWHERE_PATH;

  if (VSWHERE_PATH) {
    // specified a path for vswhere, use it
    core.debug(`Using given vswhere-path: ${VSWHERE_PATH}`);
    vswhereToolExe = path.join(VSWHERE_PATH, "vswhere.exe");
  } else {
    // check in PATH to see if it is there
    try {
      const vsWhereInPath: string = await io.which("vswhere", true);
      core.debug(`Found tool in PATH: ${vsWhereInPath}`);
      vswhereToolExe = vsWhereInPath;
    } catch {
      // fall back to VS-installed path
      vswhereToolExe = path.join(
        process.env["ProgramFiles(x86)"] as string,
        "Microsoft Visual Studio\\Installer\\vswhere.exe"
      );
      core.debug(`Trying Visual Studio-installed path: ${vswhereToolExe}`);
    }
  }

  if (!fs.existsSync(vswhereToolExe)) {
    core.setFailed("Action requires the path to where vswhere.exe exists");
    return;
  }

  return vswhereToolExe;
}
