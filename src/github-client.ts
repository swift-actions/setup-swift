export interface GitHubClient {
  retryTimeout: number;
  hasApiToken(): boolean;
  getTags(page: number, limit: number): Promise<any>;
}

export class DefaultGitHubClient implements GitHubClient {
  retryTimeout: number = 5000;
  private githubToken: string | null;

  constructor(githubToken: string | null = null) {
    this.githubToken = githubToken || process.env.GH_TOKEN || null;
  }

  hasApiToken(): boolean {
    return this.githubToken != null && this.githubToken != "";
  }

  async getTags(page: number, limit: number): Promise<any> {
    const url = `https://api.github.com/repos/swiftlang/swift/tags?per_page=${limit}&page=${page}`;
    return await this.get(url);
  }

  private async get(url: string): Promise<any> {
    let headers = {};
    if (this.hasApiToken()) {
      headers = {
        Authorization: `Bearer ${this.githubToken}`,
      };
    }
    const response = await fetch(url, {
      headers: headers,
    });
    const json: any = await response.json();
    return json;
  }
}
