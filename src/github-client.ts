import * as github from "@actions/github";

export interface GitHubClient {
  hasApiToken(): boolean;
  getTags(page: number, limit: number): Promise<any>;
}

export class DefaultGitHubClient implements GitHubClient {
  hasApiToken(): boolean {
    return this.token() != "";
  }

  async getTags(page: number, limit: number): Promise<any> {
    const octokit = github.getOctokit(this.token())
    const response = await octokit.rest.repos.listTags({
      owner: "swiftlang",
      repo: "swift",
      per_page: limit,
      page: page,
    });
    return response.data;
  }

  private token(): string {
    return process.env.GH_TOKEN || "";
  }
}
