import { DefaultGitHubClient, GitHubClient } from "./github-client";
import { System } from "./os";

export type Tag = {
  name: string;
};

export type Snapshot = {
  branch: string;
  date: string;
};

export class SnapshotResolver {
  private githubClient: GitHubClient;
  private limit: number = 100;

  constructor(githubClient: GitHubClient = new DefaultGitHubClient()) {
    this.githubClient = githubClient;
  }

  async execute(version: string, platform: System): Promise<Snapshot> {
    const snapshot = await this.getSnapshot(version);
    if (!snapshot) {
      throw new Error(
        `Couldn't form a package for requested version ${version} on ${platform}`
      );
    }
    return snapshot;
  }

  async getSnapshot(version: string): Promise<Snapshot | null> {
    let index = version.indexOf("-");
    if (index === -1) {
      return null;
    }
    const branch = version.split("-")[0];
    index = version.indexOf("-", index + 1);
    if (index === -1) {
      const snapshot = await this.fetchSnapshot(branch);
      return snapshot;
    }
    const date = version.slice(index + 1, version.length);
    return { branch, date };
  }

  private async fetchSnapshot(targetBranch: string): Promise<Snapshot | null> {
    let page = 1;
    while (true) {
      const tags = await this.getTags(page);
      for (const tag of tags) {
        const snapshot = this.parseSnapshot(tag);
        if (snapshot && snapshot.branch == targetBranch) {
          return snapshot;
        }
      }
      if (tags.length < this.limit) {
        return null;
      }
      page += 1;
    }
  }

  private parseSnapshot(tag: Tag): Snapshot | null {
    const matches = tag.name.match(
      /swift(?:-(\d+)\.(\d+))?-DEVELOPMENT-SNAPSHOT-(\d{4}-\d{2}-\d{2})/
    );
    if (!matches) {
      return null;
    }
    if (matches[1] && matches[2]) {
      const major = matches[1];
      const minor = matches[2];
      return { branch: `${major}.${minor}`, date: matches[3] };
    }
    return { branch: "main", date: matches[3] };
  }

  private async getTags(page: number): Promise<Tag[]> {
    let json = await this.githubClient.getTags(page, this.limit);
    if (!Array.isArray(json)) {
      // try second time after 5s if response not an array of tags
      await new Promise((r) => setTimeout(r, 5000));
      json = await this.githubClient.getTags(page, this.limit);
    }
    if (!Array.isArray(json)) {
      // fail if couldn't get from second try
      let errorMessage =
        "Failed to retrive snapshot tags. Please, try again later.";
      if (!this.githubClient.hasApiToken()) {
        errorMessage +=
          " To avoid limits specify `API_GITHUB_ACCESS_TOKEN` in your project settings.";
      }
      throw new Error(errorMessage);
    }
    const tags: Tag[] = json.map((e: any) => {
      return { name: e.name };
    });
    return tags;
  }
}
