import { expect, test } from "@oclif/test";
export const gitUser = {
  login: "omidiora",
  id: 12352315,
  location: "Bulgaria",
  name: "Testname",
  bio: "grwagbarehrsg",
  twitter_username: "twttr",
};

export const freshdeskAccountList = [
  {
    active: true,
    address: null,
    description:
      "I am a  web developer.\r\nProficient in Html, Css,Javascript ,bootstrap,Php, Laravel,Python/Django\r\n\r\n ",
    email: "omidiora@fakemail.com",
    other_emails: [],
    id: 101014283201,
    job_title: "Developer",
    language: "en",
    mobile: null,
    name: "Omidiora",
    phone: null,
    time_zone: "Eastern Time (US & Canada)",
    twitter_id: null,
    facebook_id: null,
    external_id: null,
    created_at: "2022-02-07T13:08:17Z",
    updated_at: "2022-02-07T13:08:17Z",
    company_id: null,
    unique_external_id: "4563269",
  },
];

const FRESHDESK_BASE_URL = "https://gargag.freshdesk.com/api/v2";

describe("Migrate", () => {
  test
    .nock("https://api.github.com", (api) =>
      api.get("/users/omidiora").reply(200, gitUser).persist()
    )
    .nock(FRESHDESK_BASE_URL, (api) =>
      api.get("/contacts").reply(200, freshdeskAccountList).persist()
    )
    .nock(FRESHDESK_BASE_URL, (api) =>
      api
        .get(`/search/contacts?query="email:'omidiora@fakemail.com'"`)
        .reply(200, { results: [] })
    )
    .nock(FRESHDESK_BASE_URL, (api) => api.post("/contacts").reply(200))
    .stdout({ print: true })
    .command(["migrate", "gargag", "omidiora"])
    .it("runs migrate cmd and CREATES", (ctx) => {
      expect(ctx.stdout).to.contain("Creation done!");
    });

  test
    .nock("https://api.github.com", (api) =>
      api
        .get("/users/omidiora")
        .reply(200, { ...gitUser, email: "omidiora@newmail.com" })
        .persist()
    )
    .nock(FRESHDESK_BASE_URL, (api) => api.get("/contacts").reply(200))
    .nock(FRESHDESK_BASE_URL, (api) =>
      api
        .get(`/search/contacts?query="email:'omidiora@newmail.com'"`)
        .reply(200, { results: freshdeskAccountList })
    )
    .nock(FRESHDESK_BASE_URL, (api) =>
      api.put("/contacts/101014283201").reply(200)
    )
    .stdout({ print: true })
    .command(["migrate", "gargag", "omidiora"])
    .it("runs migrate cmd and UPDATES", (ctx) => {
      expect(ctx.stdout).to.contain("Update done!");
    });
});
