import "dotenv/config";
import { CliUx, Command } from "@oclif/core";
import GitHubClient, { GithubUserType } from "../clients/github";
import FreshdeskClient, { FreshDeskContactType } from "../clients/freshdesk";
import * as inquirer from "inquirer";
import { doApiAction, showUser, toFreshdeskUser } from "../helper";

export default class Migrate extends Command {
  static description = "Migrate user from Github to Freshdesk";

  static flags = {};

  static args = [
    { name: "domain", description: "Freshdesk domain" },
    { name: "githubUser", description: "Github username" },
  ];

  private freshdeskClient?: FreshdeskClient;
  private githubClient?: GitHubClient;

  /**
   * Built in entry point
   * */
  async run(): Promise<void> {
    //Set up all the app needs to run and test
    const {
      args: { domain, githubUser },
    } = await this.parse(Migrate);

    // Make sure we have all we need to work
    if (!process.env.GITHUB_TOKEN?.trim()) {
      this.log(
        "Missing Git token. Please populate the GITHUB_TOKEN env variable to proceed"
      );
      process.exit(1);
    }
    if (!process.env.FRESHDESK_TOKEN?.trim()) {
      this.log(
        "Missing Freshdesk token. Please populate the FRESHDESK_TOKEN env variable to proceed"
      );
      process.exit(1);
    }

    //Test passed creds
    this.githubClient = new GitHubClient(process.env.GITHUB_TOKEN);
    const testGithub = await this.githubClient.testCredentials();
    if (!testGithub.success) {
      this.log(testGithub.message);
      process.exit(1);
    }

    let freshdeskDomain = domain;
    // Ask user for freshdesk domain if not provided already
    if (!domain) {
      const { domainInput } = await inquirer.prompt([
        {
          type: "input",
          name: "domainInput",
          message: "Enter your Freshdesk domain",
          validate(input: any) {
            return input.trim().length < 2
              ? "Please enter valid FRESHDESK domain"
              : true;
          },
        },
      ]);
      freshdeskDomain = domainInput;
    }

    this.freshdeskClient = new FreshdeskClient(
      process.env.FRESHDESK_TOKEN,
      freshdeskDomain
    );
    const testFreshdesk = await this.freshdeskClient.testCredentials();
    if (!testFreshdesk.success) {
      this.log(testFreshdesk.message);
      process.exit(1);
    }

    // kick it off
    await this.promptAndExecute(githubUser);
  }

  /**
   * Gets the username and starts the migration process
   * */
  async promptAndExecute(username?: string) {
    if (!this.githubClient || !this.freshdeskClient) return; //Cant happen

    // Ask user for username to migrate from github if not provided already
    let githubUsername = username;
    if (!githubUsername) {
      const { usernameInput } = await inquirer.prompt([
        {
          type: "input",
          name: "usernameInput",
          message: "Enter GITHUB username to migrate / update?",
          validate(input: any) {
            return input.trim().length < 2
              ? "Please enter valid GITHUB username"
              : true;
          },
        },
      ]);
      githubUsername = usernameInput;
    }

    try {// Exception would be 404, which means user was not found. We dont handle other quirks, just restart process
      const { data: githubUser }: { data: GithubUserType } = await doApiAction(
        this.githubClient.getUser,
        `Fetching user ${githubUsername} from GITHUB`,
        [githubUsername]
      );

      try {// Assume 404 which means we dont have user already and we try to update. Other quirks are not handled
        // Find contact by username in freshdesk
        const {
          data: { results },
        }: { data: { results: FreshDeskContactType[] } } = await doApiAction(
          this.freshdeskClient.findContactByUsername,
          "Looking up user in Freshdesk",
          [githubUser.login]
        );
        // UPDATE if user exists
        const freshdeskUser = toFreshdeskUser(githubUser);
        // these cant be used in update
        delete freshdeskUser.email;
        delete freshdeskUser.unique_external_id;

        await doApiAction(
          this.freshdeskClient.updateContactById,
          "Updating Freshdesk account",
          [freshdeskUser, results[0].id]
        );
        // Show some data
        showUser(freshdeskUser);
      } catch (e: any) {
        //CREATE new user since we found none
        try {//Since I dont know fully what can break, we leave this as trace in case something is missing in data from github
          await doApiAction(
            this.freshdeskClient.createContact,
            "Creating Freshdesk account since no existing user was found",
            [toFreshdeskUser(githubUser)]
          );

          showUser(toFreshdeskUser(githubUser));
        } catch (e: any) {
          console.log(e.response.data);
        }
      }
    } catch (e: any) {
      if (e.response.status === 404) {
        this.log(
          "Could not find GITHUB user with that username. Try another one"
        );
      }
      await this.promptAndExecute(); // If something broke, let user try a different username maybe
    }
  }
}
