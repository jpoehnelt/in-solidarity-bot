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

import { annotate, getLevelFromAnnotations } from "./annotate";

import { DEFAULT_CONFIGURATION } from "./config";
import { Level } from "./rules";
import { Octokit } from "@octokit/rest/";
import fs from "fs";
import { parse } from "./parse";

test("should ignore existing lines", () => {
  const files = parse(fs.readFileSync("./fixtures/pull.normal.diff", "utf8"));
  const annotations = annotate(DEFAULT_CONFIGURATION, files);
  expect(annotations).toEqual([]);
});

test("should annotate correctly", () => {
  const files = parse(fs.readFileSync("./fixtures/pull.failing.diff", "utf8"));
  const annotations = annotate(DEFAULT_CONFIGURATION, files);
  expect(annotations).toEqual([
    {
      annotation_level: "warning",
      end_column: 8,
      end_line: 2,
      message: "Please consider an alternative to `whitelist`.",
      path: "README.md",
      raw_details: "/white[_-]*list/gi",
      start_column: 0,
      start_line: 2,
      title: "Match Found",
    },
    {
      annotation_level: "warning",
      end_column: 5,
      end_line: 3,
      message: "Please consider an alternative to `Master`.",
      path: "README.md",
      raw_details: "/master/gi",
      start_column: 0,
      start_line: 3,
      title: "Match Found",
    },
  ]);
});

test("should get correct level from annotations", () => {
  expect(getLevelFromAnnotations([])).toBe(Level.OFF);
  expect(
    getLevelFromAnnotations([
      { annotation_level: "off" },
      { annotation_level: "notice" },
      { annotation_level: "warning" },
      { annotation_level: "failure" },
    ] as Octokit.ChecksUpdateParamsOutputAnnotations[])
  ).toBe(Level.FAILURE);
});
