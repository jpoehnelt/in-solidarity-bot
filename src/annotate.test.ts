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
import fs from "fs";
import { parse } from "./parse";

test("should ignore existing lines", () => {
  const files = parse(fs.readFileSync("./fixtures/pull.normal.diff", "utf8"));
  const annotations = annotate(DEFAULT_CONFIGURATION, files, {
    info: jest.fn(),
  } as any);
  expect(annotations).toEqual([]);
});

test("should annotate correctly", () => {
  const files = parse(fs.readFileSync("./fixtures/pull.failing.diff", "utf8"));
  const annotations = annotate(DEFAULT_CONFIGURATION, files, {
    info: jest.fn(),
  } as any);
  expect(annotations).toMatchInlineSnapshot(`
    Array [
      Object {
        "annotation_level": "warning",
        "end_column": 8,
        "end_line": 2,
        "message": "
    Please consider an alternative to \`whitelist\`. 
    Possibilities include: \`include list\`, \`allow list\`",
        "path": "README.md",
        "raw_details": "/white[_-]*list/gi",
        "start_column": 0,
        "start_line": 2,
        "title": "Match Found",
      },
      Object {
        "annotation_level": "warning",
        "end_column": 5,
        "end_line": 3,
        "message": "
    Please consider an alternative to \`Master\`. 
    Possibilities include: \`primary\`, \`main\`, \`leader\`, \`active\`, \`writer\`",
        "path": "README.md",
        "raw_details": "/master/gi",
        "start_column": 0,
        "start_line": 3,
        "title": "Match Found",
      },
    ]
  `);
});

test("should annotate case without newPath", () => {
  // sourced from https://patch-diff.githubusercontent.com/raw/bwvalle/learnopencv/pull/7.diff
  const files = [
    {
      hunks: [],
      newEndingNewLine: true,
      newMode: "100644",
      newRevision: "00c87967",
      oldEndingNewLine: true,
      oldRevision: "00000000",
      type: "modify",
    },
  ];

  const annotations = annotate(
    DEFAULT_CONFIGURATION,
    files as any,
    { info: jest.fn() } as any
  );
  expect(annotations).toEqual([]);
});

test("should get correct level from annotations", () => {
  expect(getLevelFromAnnotations([])).toBe(Level.OFF);
  expect(
    getLevelFromAnnotations([
      { annotation_level: "off" },
      { annotation_level: "notice" },
      { annotation_level: "warning" },
      { annotation_level: "failure" },
    ] as any)
  ).toBe(Level.FAILURE);
});

test("should annotate with correct level", () => {
  const files = parse(fs.readFileSync("./fixtures/pull.failing.diff", "utf8"));
  const annotations = annotate(
    {
      ...DEFAULT_CONFIGURATION,
      rules: {
        whitelist: {
          regex: DEFAULT_CONFIGURATION.rules.whitelist.regex,
          level: Level.FAILURE,
        },
        master: {
          regex: DEFAULT_CONFIGURATION.rules.master.regex,
          level: Level.OFF,
        },
      },
    },
    files,
    { info: jest.fn() } as any
  );
  expect(annotations).toMatchInlineSnapshot(`
    Array [
      Object {
        "annotation_level": "failure",
        "end_column": 8,
        "end_line": 2,
        "message": "
    Please consider an alternative to \`whitelist\`. 
    ",
        "path": "README.md",
        "raw_details": "/white[_-]*list/gi",
        "start_column": 0,
        "start_line": 2,
        "title": "Match Found",
      },
    ]
  `);
});
