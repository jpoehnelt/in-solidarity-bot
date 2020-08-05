import { Application, Context } from "probot";

import { Solidarity } from "./solidarity";

module.exports = async (app: Application) => {
  app.on(
    [
      "pull_request.opened",
      "pull_request.reopened",
      "pull_request.synchronize",
    ],
    async (context: Context) => {
      await run(context, app);
    }
  );

  async function run(context: Context, app: Application) {
    const solidarity = new Solidarity(context, app.log);
    await solidarity.run();
  }
};
