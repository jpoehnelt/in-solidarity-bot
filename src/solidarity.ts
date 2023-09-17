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

import {
  ChecksUpdateParamsOutputAnnotations,
  annotate,
  getLevelFromAnnotations,
} from "./annotate";
import { Configuration, InvalidConfigError, getConfig } from "./config";

import { Context } from "probot";
import { File } from "gitdiff-parser";
import { Level } from "./rules";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";
import { dump } from "js-yaml";
import fs from "fs";
import handlebars from "handlebars";
import { parse } from "./parse";
import path from "path";
import pino from "pino";
import { version } from "../package.json";

type ChecksCreateParams =
  RestEndpointMethodTypes["checks"]["create"]["parameters"];

export type ChecksUpdateParamsOutput = {
  title: string;
  summary: string;
  annotations?: ChecksUpdateParamsOutputAnnotations[];
};

const SUMMARY_TEMPLATE = handlebars.compile(
  fs.readFileSync(path.join(__dirname, "templates/SUMMARY.hbs"), "utf8")
);

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
  SUCCESS = "Check completed with success",
  ERROR = "Check failed due to error",
  PERMISSION_NEEDED = "Check lacks permissions for private repository",
  FAILURE = "Check completed with failures",
  NOTICE = "Check completed with notices",
  WARNING = "Check completed with warnings",
}

export const logger = pino();

export class Solidarity {
  private context: Context<"pull_request">;
  private logger: pino.Logger;
  private checkId?: number;
  config?: Configuration;

  constructor(context: Context<"pull_request">) {
    this.context = context;
    this.logger = logger.child({
      version,
      repo: this.repo,
      owner: this.owner,
      pull_number: this.pullNumber,
      sha: this.headSha,
    });
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

  get checkOptions(): ChecksCreateParams {
    return {
      owner: this.owner,
      repo: this.repo,
      head_sha: this.headSha,
      name: CHECK_NAME,
    };
  }

  isBlockedOwner(): boolean {
    return (process.env.BLOCKED_ORGS || "")
      .toLowerCase()
      .split(",")
      .includes(this.owner.toLocaleLowerCase());
  }

  async run(): Promise<void> {
    let conclusion: Conclusion = Conclusion.NEUTRAL;
    let output: { title: string; summary: string };

    await this.start();

    if (this.isBlockedOwner()) {
      return this.update("completed", Conclusion.CANCELLED);
    }

    await this.update("in_progress");

    try {
      this.config = await getConfig(this.context);
      this.logger.info({ config: this.config }, "Loaded config");
    } catch (e) {
      if (e instanceof InvalidConfigError) {
        conclusion = Conclusion.FAILURE;
        output = {
          title: OutputTitle.ERROR,
          summary: this.summary(e.message),
        };
      } else {
        conclusion = Conclusion.CANCELLED;
        output = {
          title: OutputTitle.ERROR,
          summary: this.summary("Could not load configuration."),
        };
      }

      this.logger.error({ err: e }, output.summary);

      await this.update("completed", conclusion, output);
      return;
    }

    try {
      const check = await this.check();
      conclusion = check.conclusion;
      output = check.output;
    } catch (e) {
      if ((e as any).status === 403) {
        output = {
          title: OutputTitle.PERMISSION_NEEDED,
          summary: this.summary(
            "Check only runs on public repositories to limit required permissions. See https://github.com/jpoehnelt/in-solidarity-bot/issues/16."
          ),
        };

        this.logger.info({}, "Failed to check private repository");
      } else {
        output = {
          title: OutputTitle.ERROR,
          summary: this.summary("Check failed to complete."),
        };

        this.logger.error(
          {
            config: this.config,
            payload: this.context.payload,
            err: e,
          },
          "Failed to complete check"
        );
      }
    }

    await this.update("completed", conclusion, output);
  }

  async start(): Promise<void> {
    try {
      const response = await this.context.octokit.checks.create({
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
    output?: ChecksUpdateParamsOutput
  ): Promise<void> {
    try {
      const request = {
        ...this.checkOptions,
        check_run_id: this.checkId as number,
        status,
        conclusion,
        ...(status === "completed" && {
          completed_at: new Date().toISOString(),
          ...(output && { output }),
        }),
      };

      // There is a limit of 50 annotations per request
      if (output && output.annotations && output.annotations.length > 50) {
        await Promise.all(
          chunk(output.annotations, 50).map((annotations) => {
            return this.context.octokit.checks.update({
              ...request,
              output: { ...output, annotations },
            });
          })
        );
      } else {
        await this.context.octokit.checks.update(request);
      }
    } catch (e) {
      this.logger.error({ err: e }, "Failed to update check");
    }
  }

  async diff(): Promise<File[]> {
    const response = await this.context.octokit.pulls.get({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.pullNumber,
      headers: { accept: "application/vnd.github.v3.diff" },
    });

    const diff = response.data as unknown as string;

    return parse(diff);
  }

  async check(): Promise<{
    conclusion: Conclusion;
    output: ChecksUpdateParamsOutput;
  }> {
    let conclusion: Conclusion;
    const output: ChecksUpdateParamsOutput = {
      title: CHECK_NAME,
      summary: this.summary(""),
    };
    const diff = await this.diff();

    output.annotations = annotate(
      this.config as Configuration,
      diff,
      this.logger
    );

    const level = getLevelFromAnnotations(output.annotations);

    switch (level) {
      case Level.FAILURE:
        conclusion = Conclusion.ACTION_REQUIRED;
        output.title = OutputTitle.FAILURE;
        break;
      case Level.WARNING:
        conclusion = Conclusion.NEUTRAL;
        output.title = OutputTitle.WARNING;
        break;
      case Level.NOTICE:
        conclusion = Conclusion.NEUTRAL;
        output.title = OutputTitle.NOTICE;
        break;
      case Level.OFF:
      default:
        conclusion = Conclusion.SUCCESS;
        output.title = OutputTitle.SUCCESS;
    }

    this.logger.info({
      conclusion,
    });

    return { conclusion, output };
  }

  summary(
    message: string,
    v: string = version,
    sha: string = process.env.SHA || "unknown"
  ): string {
    let config: Configuration | undefined = undefined;

    if (this.config) {
      config = { ...this.config };
      config.rules = {};

      Object.keys(this.config.rules).forEach((k) => {
        config!.rules[k] = {
          ...this.config!.rules[k],
          regex: this.config!.rules[k].regex.map((r) => r.toString()),
        };
      });
    }

    return SUMMARY_TEMPLATE({
      message,
      sha,
      version: v,
      config: config ? dump(config) : null,
    });
  }
}

const chunk = <T>(arr: Array<T>, chunkSize: number): Array<Array<T>> => {
  return arr.reduce(
    (previous: any, _: any, index: number, array: Array<T>) =>
      !(index % chunkSize)
        ? previous.concat([array.slice(index, index + chunkSize)])
        : previous,
    []
  );
};
