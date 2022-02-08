import { expect, test } from "@oclif/test";
import { freshdeskAccountList, gitUser } from "../helpers/mockData";

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
