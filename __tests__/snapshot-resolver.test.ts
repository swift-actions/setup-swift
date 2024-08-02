import { OS } from "../src/os";
import { SnapshotResolver } from "../src/snapshot-resolver";

describe("build snapshot package info", () => {
  const githubToken = process.env.TEST_GITHUB_TOKEN;
  if (githubToken) {
    const resolver = new SnapshotResolver(githubToken);
    const expectedDate = new Date().toISOString().split("T")[0];

    it("resolve main branch latest snapshot", async () => {
      const toolchain = await resolver.getSnapshot("main-snapshot");

      expect(toolchain).toEqual({ branch: "main", date: expectedDate });
    });

    it("resolve simver branch snapshot", async () => {
      const toolchain = await resolver.getSnapshot("6.0-snapshot");

      expect(toolchain).toEqual({ branch: "6.0", date: expectedDate });
    });
  }

  const resolver = new SnapshotResolver(null);

  it("resolve with explicit date to main", async () => {
    const toolchain = await resolver.getSnapshot("main-snapshot-2022-01-28");

    expect(toolchain).toEqual({ branch: "main", date: "2022-01-28" });
  });

  it("resolve with explicit date to semver", async () => {
    const toolchain = await resolver.getSnapshot("5.7-snapshot-2022-08-30");

    expect(toolchain).toEqual({ branch: "5.7", date: "2022-08-30" });
  });
});
