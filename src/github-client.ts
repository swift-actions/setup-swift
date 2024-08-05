export interface GitHubClient {
  hasApiToken(): boolean;
  getTags(page: number, limit: number): Promise<any>;
}

export class DefaultGitHubClient implements GitHubClient {
  private githubToken: string | null;

  constructor(githubToken: string | null = null) {
    this.githubToken =
      githubToken || process.env.API_GITHUB_ACCESS_TOKEN || null;
  }

  hasApiToken(): boolean {
    return this.githubToken != null && this.githubToken != "";
  }

  async getTags(page: number, limit: number): Promise<any> {
    const url = `https://api.github.com/repos/apple/swift/tags?per_page=${limit}&page=${page}`;
    return await this.get(url);
  }

  private async get(url: string): Promise<any> {
    let headers = {};
    if (this.githubToken) {
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
