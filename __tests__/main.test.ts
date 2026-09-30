const originalExitCode = process.exitCode;
const originalVersionInput = process.env["INPUT_SWIFT-VERSION"];
const originalSkipInput = process.env["INPUT_SKIP-VERIFY-SIGNATURE"];

async function runAction(
  requested: string,
  before: string | null,
  after: string | null,
  selected: string,
) {
  jest.resetModules();
  process.exitCode = undefined;
  process.env["INPUT_SWIFT-VERSION"] = requested;
  process.env["INPUT_SKIP-VERIFY-SIGNATURE"] = "false";

  const outputs: Record<string, unknown> = {};
  let finish!: () => void;
  const completed = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const versions = [before, after];

  jest.doMock("../src/core", () => ({
    ...jest.requireActual("../src/core"),
    getOS: async () => "linux",
  }));
  jest.doMock("../src/swift", () => ({
    currentVersion: async () => versions.shift(),
  }));
  jest.doMock("../src/swiftly", () => ({
    setupLinux: async () => {},
    installSwift: async () => selected,
  }));
  jest.doMock("@actions/core", () => {
    const actual = jest.requireActual("@actions/core");
    return {
      ...actual,
      setOutput: (name: string, value: unknown) => {
        outputs[name] = value;
        finish();
      },
      setFailed: (message: string) => {
        actual.setFailed(message);
        finish();
      },
    };
  });

  // Load the entry point after installing per-case mocks; a static import runs it too early.
  await import("../src/main");
  await completed;
  return { outputs, exitCode: process.exitCode ?? 0 };
}

afterEach(() => {
  process.exitCode = originalExitCode;
  if (originalVersionInput === undefined) {
    delete process.env["INPUT_SWIFT-VERSION"];
  } else {
    process.env["INPUT_SWIFT-VERSION"] = originalVersionInput;
  }
  if (originalSkipInput === undefined) {
    delete process.env["INPUT_SKIP-VERIFY-SIGNATURE"];
  } else {
    process.env["INPUT_SKIP-VERIFY-SIGNATURE"] = originalSkipInput;
  }
});

describe("action version validation", () => {
  it.each<[string, string | null, string | null, string, string]>([
    ["6.3", "6.3.3", null, "6.3.3", "6.3.3"],
    ["6.3", "6.4", "6.3.3", "6.3.3", "6.3.3"],
    ["latest", "6.3.3", "6.4.1", "6.4.1", "6.4.1"],
    [
      "main-snapshot",
      "6.4",
      "6.5-dev",
      "main-snapshot-2026-09-30",
      "main-snapshot-2026-09-30",
    ],
    [
      "6.3-snapshot-2026-09-30",
      "6.4",
      "6.3-dev",
      "6.3-snapshot-2026-09-30",
      "6.3-snapshot-2026-09-30",
    ],
  ])(
    "reports the installed version for %s",
    async (requested, before, after, selected, expected) => {
      const result = await runAction(requested, before, after, selected);
      expect(result).toEqual({ outputs: { version: expected }, exitCode: 0 });
    },
  );

  it.each<[string, string | null, string]>([
    ["6.3.3", "6.3.4", "6.3.4"],
    ["6.3", "6.4.1", "6.4.1"],
    ["6.3", null, "6.3.3"],
    ["6.3", "6.4.1", "6.3.3"],
    ["main-snapshot", "6.4", "main-snapshot-2026-09-30"],
    ["6.3-snapshot", "6.4-dev", "6.4-snapshot-2026-09-30"],
    ["6.3-snapshot", "6.4-dev", "6.3-snapshot-2026-09-30"],
  ])(
    "fails a mismatched or unreadable toolchain for %s",
    async (requested, after, selected) => {
      const result = await runAction(requested, "5.10.1", after, selected);
      expect(result).toEqual({ outputs: {}, exitCode: 1 });
    },
  );
});
