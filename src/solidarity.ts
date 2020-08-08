/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Context } from "probot";
import { LoggerWithTarget } from "probot/lib/wrap-logger";
import { Octokit } from "@octokit/rest/";
import { annotate } from "./annotate";
import fs from "fs";
import { parse } from "./parse";

export const PATTERN = /((?:(?:white|black)[_-]*list)|slave|master)/gi;
const SUMMARY = fs.readFileSync("./static/HELP.md", "utf8");
const CHECK_NAME = "Inclusive Language";

export enum Conclusion {
  SUCCESS = "success",
  FAILURE = "failure",
  NEUTRAL = "neutral",
  CANCELLED = "cancelled",
  TIMED_OUT = "timed_out",
  ACTION_REQUIRED = "action_required",
}

export enum OutputTitle {
  SUCCESS = "Check was successful",
  ERROR = "Check failed due to error",
  PERMISSION_NEEDED = "Check lacks permissions for private repository",
  SUGGEST_ACTION = "Action Suggested",
}

export class Solidarity {
  private context: Context;
  private logger: LoggerWithTarget;
  private checkId?: number;

  constructor(context: Context, logger: LoggerWithTarget) {
    this.context = context;
    this.logger = logger;
  }

  get headSha(): string {
    return this.context.payload.pull_request.head.sha;
  }

  get owner(): string {
    return this.context.payload.repository.owner.login;
  }

  get repo(): string {
    return this.context.payload.repository.name;
  }

  get pullNumber(): number {
    return this.context.payload.number;
  }

  get checkOptions(): Octokit.ChecksCreateParams {
    return {
      owner: this.owner,
      repo: this.repo,
      head_sha: this.headSha,
      name: CHECK_NAME,
    };
  }

  async run(): Promise<void> {
    let conclusion: Conclusion = Conclusion.NEUTRAL;
    let output: Octokit.ChecksUpdateParamsOutput;

    await this.start();
    await this.update("in_progress");

    try {
      const check = await this.check();
      conclusion = check.conclusion;
      output = check.output;
    } catch (e) {
      if (e.status === 403) {
        output = {
          title: OutputTitle.PERMISSION_NEEDED,
          summary:
            "Check only runs on public repositories to limit required permissions. See https://github.com/jpoehnelt/in-solidarity-bot/issues/16.",
        };

        this.logger.info(
          { labels: { ...this.checkOptions }, err: e },
          "Failed to check private repository"
        );
      } else {
        output = {
          title: OutputTitle.ERROR,
          summary: "Check failed to complete.",
        };

        this.logger.error(
          { labels: { ...this.checkOptions }, err: e },
          "Failed to complete check"
        );
      }
    }

    await this.update("completed", conclusion, output);
  }

  async start(): Promise<void> {
    try {
      const response = await this.context.github.checks.create({
        ...this.checkOptions,
        status: "queued",
      });
      this.checkId = response.data.id;
    } catch (e) {
      this.logger.error({ err: e }, "Failed to create check");
    }
  }

  async update(
    status: "queued" | "in_progress" | "completed",
    conclusion?: Conclusion,
    output?: Octokit.ChecksUpdateParamsOutput,
    details_url?: string
  ): Promise<void> {
    try {
      await this.context.github.checks.update({
        ...this.checkOptions,
        check_run_id: this.checkId as number,
        status,
        conclusion,
        ...(status === "completed" && {
          completed_at: new Date().toISOString(),
        }),
        ...(output && { output }),
        details_url,
      });
    } catch (e) {
      this.logger.error({ err: e }, "Failed to update check");
    }
  }

  async check(): Promise<{
    conclusion: Conclusion;
    output: Octokit.ChecksUpdateParamsOutput;
  }> {
    let conclusion: Conclusion;
    const output: Octokit.ChecksUpdateParamsOutput = {
      title: CHECK_NAME,
      summary: SUMMARY,
    };

    const { owner, repo } = this.checkOptions;
    const response = await this.context.github.pulls.get({
      owner,
      repo,
      pull_number: this.pullNumber,
      headers: { accept: "application/vnd.github.v3.diff" },
    });

    const diff = (response.data as unknown) as string;

    const parsedDiff = parse(diff);

    output.annotations = annotate(PATTERN, parsedDiff);

    if (output.annotations.length) {
      conclusion = Conclusion.NEUTRAL;
      output.title = OutputTitle.SUGGEST_ACTION;
    } else {
      output.title = OutputTitle.SUCCESS;
      conclusion = Conclusion.SUCCESS;
    }

    this.logger.info({
      conclusion,
      repo,
      owner,
      pull_number: this.pullNumber,
      sha: this.headSha,
    });

    return { conclusion, output };
  }
}
