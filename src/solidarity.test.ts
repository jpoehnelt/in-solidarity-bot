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

import { Conclusion, OutputTitle, Solidarity } from "./solidarity";

import { DEFAULT_CONFIGURATION } from "./config";
import { Logger } from "probot";
import fs from "fs";
import { parse } from "./parse";
import { version } from "../package.json";

const payload = JSON.parse(fs.readFileSync("./fixtures/payload.json", "utf8"));
const failingDIff = parse(
  fs.readFileSync("./fixtures/pull.failing.diff", "utf8")
);

test("solidarity should run check on failing diff", async () => {
  const s = new Solidarity(
    { name: "foo", id: "bar", payload: payload } as any,
    ({ info: jest.fn() } as unknown) as Logger
  );

  s.diff = jest.fn().mockReturnValue(failingDIff);
  s.config = DEFAULT_CONFIGURATION;

  const { conclusion, output } = await s.check();
  expect(conclusion).toBe(Conclusion.NEUTRAL);
  expect(output.title).toEqual(OutputTitle.WARNING);
  expect(output.annotations?.length).toEqual(2);
  expect(output.summary).toMatch(/^For more information/);
});

test("solidarity should have correct properties from payload", async () => {
  const s = new Solidarity(
    { name: "foo", id: "bar", payload: payload } as any,
    ({ info: jest.fn() } as unknown) as Logger
  );
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
  const s = new Solidarity(
    { name: "foo", id: "bar", payload: payload } as any,
    ({ info: jest.fn() } as unknown) as Logger
  );
  s.config = DEFAULT_CONFIGURATION;

  expect(s.summary("")).toMatch(
    `App version: [v${version}|sha:${process.env.SHA || "unknown"}]`
  );
  expect(s.summary("foo")).toMatch(/^foo/);
});
