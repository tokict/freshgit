import { GithubUserType } from "./clients/github";
import { FreshDeskContactType } from "./clients/freshdesk";
import { CliUx } from "@oclif/core";

export const toFreshdeskUser = (
  githubUser: GithubUserType
): FreshDeskContactType => ({
  active: true,
  address: githubUser.location,
  description: githubUser.bio.replace(
    /[\r\n\x0B\x0C\u0085\u2028\u2029]+/g,
    " | "
  ),
  email: githubUser.email ?? githubUser.login + "@fakemail.com",
  job_title: "Developer",
  name: githubUser.name ?? "No name",
  twitter_id: githubUser.twitter_username,
  unique_external_id: githubUser.id.toString(),
});

export const doApiAction = async (
  fn: Function,
  title: string,
  params: any[]
): Promise<any | undefined> => {
  CliUx.ux.action.start(title);
  try {
    CliUx.ux.action.stop();
    return await fn(...params);
  } catch (e) {
    CliUx.ux.action.stop();
    throw e;
  }
};

export const showUser = (user: FreshDeskContactType) => {
  CliUx.ux.table([user], {
    address: {
      minWidth: 15,
    },
    description: {
      minWidth: 30,
    },
    email: {
      minWidth: 20,
    },
    job_title: {
      minWidth: 10,
    },
    name: {
      minWidth: 15,
    },
  });
};
