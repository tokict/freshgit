import axios, { AxiosInstance, AxiosResponse } from "axios";
import { CliUx } from "@oclif/core";
export type GithubUserType = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  company?: string;
  location: "Bulgaria";
  name: string;
  email: string;
  hireable?: string;
  bio: "JS/TS/Solidity/Kubernetes and all other strange words. Open for short projects";
  twitter_username?: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  total_private_repos: 10;
  owned_private_repos: 8;
};

export default class GitHubClient {
  private client: AxiosInstance;

  constructor(token: string) {
    this.client = axios.create({
      baseURL: "https://api.github.com/",
      headers: {
        Authorization: "token " + token,
      },
    });
  }

  testCredentials = async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    CliUx.ux.action.start("Testing GITHUB token");
    try {
      await this.getUser("omidiora");
    } catch (e: any) {
      return {
        success: false,
        message:
          "There was an error with your GITHUB credentials: " + e.message,
      };
    }
    CliUx.ux.action.stop(); // shows 'starting a process... done'
    return { success: true };
  };

  getUser = async (username: string): Promise<AxiosResponse<GithubUserType>> =>
    this.client.get(`users/${username}`);
}
