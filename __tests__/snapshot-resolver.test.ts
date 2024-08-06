import { GitHubClient } from "../src/github-client";
import { SnapshotResolver } from "../src/snapshot-resolver";
import { readFileSync } from "fs";

class MockGitHubClient implements GitHubClient {
  retryTimeout: number = 0;

  hasApiToken(): boolean {
    return true;
  }

  async getTags(page: number, _: number): Promise<any> {
    if (page > 14) {
      return [];
    }
    return JSON.parse(
      readFileSync(
        `__tests__/cached_responses/swift_tags_page${page}.json`,
        "utf8"
      )
    );
  }
}

describe("build snapshot package info", () => {
  const client = new MockGitHubClient();
  const resolver = new SnapshotResolver(client);

  it("resolve main branch latest snapshot", async () => {
    const toolchain = await resolver.getSnapshot("main-snapshot");

    expect(toolchain).toEqual({ branch: "main", date: "2024-08-03" });
  });

  it("resolve simver branch snapshot", async () => {
    const toolchain = await resolver.getSnapshot("6.0-snapshot");

    expect(toolchain).toEqual({ branch: "6.0", date: "2024-08-02" });
  });

  it("resolve with explicit date to main", async () => {
    const toolchain = await resolver.getSnapshot("main-snapshot-2022-01-28");

    expect(toolchain).toEqual({ branch: "main", date: "2022-01-28" });
  });

  it("resolve with explicit date to semver", async () => {
    const toolchain = await resolver.getSnapshot("5.7-snapshot-2022-08-30");

    expect(toolchain).toEqual({ branch: "5.7", date: "2022-08-30" });
  });
});
