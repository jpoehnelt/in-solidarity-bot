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

import fs from "fs";
import { parse } from "./parse";

test("should parse diff", () => {
  const files = parse(fs.readFileSync("./fixtures/pull.normal.diff", "utf8"));
  expect(files).toEqual([
    {
      hunks: [
        {
          content: '@@ -23,7 +23,7 @@ import fs from "fs";',
          oldStart: 23,
          newStart: 23,
          oldLines: 7,
          newLines: 7,
          changes: [
            {
              content: "",
              type: "normal",
              isNormal: true,
              oldLineNumber: 23,
              newLineNumber: 23,
            },
            {
              content:
                "const PATTERN = /((?:(?:white|black)[_-]*list)|slave|master)/gi;",
              type: "normal",
              isNormal: true,
              oldLineNumber: 24,
              newLineNumber: 24,
            },
            {
              content:
                'const SUMMARY = fs.readFileSync("./static/HELP.md", "utf8");',
              type: "normal",
              isNormal: true,
              oldLineNumber: 25,
              newLineNumber: 25,
            },
            {
              content: 'const CHECK_NAME = "Inclusive Language Check";',
              type: "delete",
              isDelete: true,
              lineNumber: 26,
            },
            {
              content: 'const CHECK_NAME = "Inclusive Language";',
              type: "insert",
              isInsert: true,
              lineNumber: 26,
            },
            {
              content: "",
              type: "normal",
              isNormal: true,
              oldLineNumber: 27,
              newLineNumber: 27,
            },
            {
              content: "export enum Conclusion {",
              type: "normal",
              isNormal: true,
              oldLineNumber: 28,
              newLineNumber: 28,
            },
            {
              content: '  SUCCESS = "success",',
              type: "normal",
              isNormal: true,
              oldLineNumber: 29,
              newLineNumber: 29,
            },
          ],
        },
      ],
      oldEndingNewLine: true,
      newEndingNewLine: true,
      oldRevision: "c5284c3",
      newRevision: "abb3a30",
      newMode: "100644",
      oldMode: "100644",
      oldPath: "src/solidarity.ts",
      newPath: "src/solidarity.ts",
      type: "modify",
    },
  ]);
});
