import gitDiffParser, { File } from "gitdiff-parser";

import { Context } from "probot";
import { LoggerWithTarget } from "probot/lib/wrap-logger";
import { Octokit } from "@octokit/rest/";
import fs from "fs";

const PATTERN = /((?:(?:white|black)[_-]*list)|slave|master)/gi;
const SUMMARY = fs.readFileSync("./static/HELP.md", "utf8");

export enum Conclusion {
  SUCCESS = "success",
  FAILURE = "failure",
  NEUTRAL = "neutral",
  CANCELLED = "cancelled",
  TIMED_OUT = "timed_out",
  ACTION_REQUIRED = "action_required",
}

export class Solidarity {
  private name = "Inclusive Language Check";
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

  get checkOptions() {
    return {
      owner: this.context.payload.repository.owner.login,
      repo: this.context.payload.repository.name,
      head_sha: this.headSha,
      name: this.name,
    };
  }

  async run() {
    await this.start();
    await this.update("in_progress");
    const { conclusion, output } = await this.check();
    await this.update("completed", conclusion, output);
  }

  async start() {
    try {
      const response = await this.context.github.checks.create({
        ...this.checkOptions,
        status: "queued",
      });
      this.checkId = response.data.id;
    } catch (e) {
      this.logger.warn(e);
    }
  }

  async update(
    status: "queued" | "in_progress" | "completed",
    conclusion?: Conclusion,
    output?: Octokit.ChecksUpdateParamsOutput,
    details_url?: string
  ) {
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
      this.logger.warn(e);
    }
  }

  async check(): Promise<{
    conclusion: Conclusion;
    output: Octokit.ChecksUpdateParamsOutput;
  }> {
    let conclusion: Conclusion;
    const output: Octokit.ChecksUpdateParamsOutput = {
      title: "Inclusive Language Check",
      summary: SUMMARY,
    };

    const { owner, repo } = this.checkOptions;
    const response = await this.context.github.pulls.get({
      owner,
      repo,
      pull_number: this.context.payload.number,
      headers: { accept: "application/vnd.github.v3.diff" },
    });

    const diff = (response.data as unknown) as string;

    const parsedDiff = gitDiffParser.parse(diff);

    output.annotations = this.annotate(parsedDiff);

    if (output.annotations.length) {
      conclusion = Conclusion.NEUTRAL;
      output.title = "Action Suggested";
    } else {
      output.title = "Success";
      conclusion = Conclusion.SUCCESS;
    }

    return { conclusion, output };
  }

  annotate(files: File[]): Octokit.ChecksUpdateParamsOutputAnnotations[] {
    const annotations: Octokit.ChecksUpdateParamsOutputAnnotations[] = [];

    for (const f of files) {
      for (const h of f.hunks) {
        for (const change of h.changes) {
          if (change.isInsert || change.isNormal) {
            // @ts-ignore
            for (const match of change.content.matchAll(PATTERN)) {
              annotations.push({
                annotation_level: "warning",
                end_column: match.index + match[0].length - 1,
                end_line: change.lineNumber as number,
                message: `Please consider an alternative to \`${match[0]}\`.`,
                path: f.newPath,
                raw_details: change.content,
                start_column: match.index,
                start_line: change.lineNumber as number,
                title: "Match Found",
              });
            }
          }
        }
      }
    }
    return annotations;
  }
}
