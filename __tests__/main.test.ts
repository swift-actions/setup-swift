jest.mock("@actions/core");
jest.mock("../src/swift");
jest.mock("../src/swiftly");
jest.mock("../src/core", () => ({
  ...jest.requireActual("../src/core"),
  getOS: jest.fn().mockResolvedValue("linux"),
}));

beforeEach(() => jest.resetModules());

async function runAction(
  requested: string,
  before: string,
  after: string | null = before,
) {
  const core = jest.mocked(await import("@actions/core"));
  const swift = jest.mocked(await import("../src/swift"));
  const swiftly = jest.mocked(await import("../src/swiftly"));

  swift.getRequestedVersion.mockResolvedValue(requested);
  swift.currentVersion.mockResolvedValueOnce(before).mockResolvedValue(after);
  const finished = new Promise<void>((resolve) => {
    core.setOutput.mockImplementation(() => resolve());
    core.setFailed.mockImplementation(() => resolve());
  });

  require("../src/main");
  await finished;
  return { core, swiftly };
}

it.each([
  ["6.2", "6.2", "6.2.4"],
  ["latest", "6.2.4", "6.4"],
  ["main-snapshot", "6.2.4", "6.4"],
])(
  "resolves %s and reports the actual installed version",
  async (requested, before, after) => {
    const { core, swiftly } = await runAction(requested, before, after);

    expect(swiftly.installSwift).toHaveBeenCalledWith(requested);
    expect(core.setOutput).toHaveBeenCalledWith("version", after);
    expect(core.setFailed).not.toHaveBeenCalled();
  },
);

it("reuses an installed exact version and reports the compiler's version", async () => {
  const { core, swiftly } = await runAction("6.2.0", "6.2");

  expect(swiftly.installSwift).not.toHaveBeenCalled();
  expect(core.setOutput).toHaveBeenCalledWith("version", "6.2");
});

it.each<[string, string | null]>([
  ["6.2", "6.3.0"],
  ["6.2.3", "6.2.4"],
  ["latest", null],
])(
  "fails when requested %s does not match installed %s",
  async (requested, installed) => {
    const { core } = await runAction(requested, "6.1.0", installed);

    expect(core.setFailed).toHaveBeenCalledWith(
      `Failed to setup requested Swift version. requested: ${requested}, actual: ${installed}`,
    );
    expect(core.setOutput).not.toHaveBeenCalled();
  },
);
