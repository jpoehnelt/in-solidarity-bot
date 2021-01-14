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

import * as nock from "nock";

import { Conclusion, OutputTitle, Solidarity, logger } from "./solidarity";

import { DEFAULT_CONFIGURATION } from "./config";
import fs from "fs";
import { parse } from "./parse";
import { version } from "../package.json";

nock.disableNetConnect();

const payload = JSON.parse(fs.readFileSync("./fixtures/payload.json", "utf8"));
const failingDIff = parse(
  fs.readFileSync("./fixtures/pull.failing.diff", "utf8")
);

beforeAll(() => {
  jest.mock("../package.json", () => {
    return {
      version: "1.1.0",
    };
  });
});

test("solidarity should instantiate child logger", () => {
  const child = jest.spyOn(logger, "child");

  const s = new Solidarity({ name: "foo", id: "bar", payload: payload } as any);
  expect(child).toHaveBeenCalledWith({
    owner: "jpoehnelt",
    pull_number: 24,
    repo: "in-solidarity-bot",
    sha: "d405f6ab463fcc7dc6717bd706d0529d5a71ba53",
    version,
  });
});

test("solidarity should run check on failing diff", async () => {
  const s = new Solidarity({ name: "foo", id: "bar", payload: payload } as any);

  s.diff = jest.fn().mockReturnValue(failingDIff);
  s.config = DEFAULT_CONFIGURATION;

  const info = jest.spyOn(s["logger"], "info").mockImplementation((msg) => msg);
  const { conclusion, output } = await s.check();
  expect(conclusion).toBe(Conclusion.NEUTRAL);
  expect(output.title).toEqual(OutputTitle.WARNING);
  expect(output.annotations?.length).toEqual(2);
  expect(info.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        Object {
          "column": 0,
          "content": "whitelist",
          "level": "warning",
          "line": 2,
          "path": "README.md",
          "regex": "/white[_-]*list/gi",
        },
        "match",
      ],
      Array [
        Object {
          "column": 0,
          "content": "Master",
          "level": "warning",
          "line": 3,
          "path": "README.md",
          "regex": "/master/gi",
        },
        "match",
      ],
      Array [
        Object {
          "conclusion": "neutral",
        },
      ],
    ]
  `);
});

test("solidarity should have correct properties from payload", async () => {
  const s = new Solidarity({ name: "foo", id: "bar", payload: payload } as any);
  expect(s.owner).toEqual("jpoehnelt");
  expect(s.repo).toEqual("in-solidarity-bot");
  expect(s.headSha).toEqual("d405f6ab463fcc7dc6717bd706d0529d5a71ba53");
  expect(s.checkOptions).toEqual({
    owner: "jpoehnelt",
    repo: "in-solidarity-bot",
    head_sha: "d405f6ab463fcc7dc6717bd706d0529d5a71ba53",
    name: "Inclusive Language",
  });
  expect(s.pullNumber).toEqual(24);
});

test("solidarity should generate correct summary", async () => {
  const s = new Solidarity({ name: "foo", id: "bar", payload: payload } as any);
  s.config = DEFAULT_CONFIGURATION;
  expect(s.summary("foo", "1.0.0")).toMatchSnapshot();
});

test("update should chunk annotations", async () => {
  const s = new Solidarity({ name: "foo", id: "bar", payload: payload } as any);
  s.config = DEFAULT_CONFIGURATION;
  const status = "completed";
  const conclusion = Conclusion.FAILURE;

  const update = jest.fn();
  s["context"].octokit = {
    checks: {
      update: update as any,
    } as any,
  } as any;

  const output = {
    title: "title",
    summary: "summary",
    annotations: Array.from({ length: 101 }, () => {
      return {
        annotation_level: "warning" as const,
        path: "path",
        start_line: 0,
        end_line: 1,
        message: "message",
      };
    }),
  };

  await s.update(status, conclusion, output);

  expect(update).toBeCalledTimes(3);
  expect(update.mock.calls[0][0].output.annotations.length).toBe(50);
  expect(update.mock.calls[1][0].output.annotations.length).toBe(50);
  expect(update.mock.calls[2][0].output.annotations.length).toBe(1);
});

test("solidarity blocks some orgs", async () => {
  const env = process.env;
  const s = new Solidarity({ name: "foo", id: "bar", payload: payload } as any);
  s.config = DEFAULT_CONFIGURATION;
  expect(s.isBlockedOwner()).toBeFalsy();
  process.env.BLOCKED_ORGS = "jpoehnelt,baz";
  expect(s.isBlockedOwner()).toBeTruthy();
  process.env = env;
});
