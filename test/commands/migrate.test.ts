import { expect, test } from "@oclif/test";

describe("Migrate", () => {
  test
    .stdout()
    .command(["migrate"])
    .it("runs migrate cmd", (ctx) => {
      expect(ctx.stdout).to.contain("GITHUB");
    });
});
