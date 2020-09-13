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
  expect(files).toMatchInlineSnapshot(`
    Array [
      Object {
        "hunks": Array [
          Object {
            "changes": Array [
              Object {
                "content": "",
                "isNormal": true,
                "newLineNumber": 23,
                "oldLineNumber": 23,
                "type": "normal",
              },
              Object {
                "content": "const PATTERN = /((?:(?:white|black)[_-]*list)|slave|master)/gi;",
                "isNormal": true,
                "newLineNumber": 24,
                "oldLineNumber": 24,
                "type": "normal",
              },
              Object {
                "content": "const SUMMARY = fs.readFileSync(\\"./static/HELP.md\\", \\"utf8\\");",
                "isNormal": true,
                "newLineNumber": 25,
                "oldLineNumber": 25,
                "type": "normal",
              },
              Object {
                "content": "const CHECK_NAME = \\"Inclusive Language Check\\";",
                "isDelete": true,
                "lineNumber": 26,
                "type": "delete",
              },
              Object {
                "content": "const CHECK_NAME = \\"Inclusive Language\\";",
                "isInsert": true,
                "lineNumber": 26,
                "type": "insert",
              },
              Object {
                "content": "",
                "isNormal": true,
                "newLineNumber": 27,
                "oldLineNumber": 27,
                "type": "normal",
              },
              Object {
                "content": "export enum Conclusion {",
                "isNormal": true,
                "newLineNumber": 28,
                "oldLineNumber": 28,
                "type": "normal",
              },
              Object {
                "content": "  SUCCESS = \\"success\\",",
                "isNormal": true,
                "newLineNumber": 29,
                "oldLineNumber": 29,
                "type": "normal",
              },
            ],
            "content": "@@ -23,7 +23,7 @@ import fs from \\"fs\\";",
            "newLines": 7,
            "newStart": 23,
            "oldLines": 7,
            "oldStart": 23,
          },
        ],
        "newEndingNewLine": true,
        "newMode": "100644",
        "newPath": "src/solidarity.ts",
        "newRevision": "abb3a30",
        "oldEndingNewLine": true,
        "oldMode": "100644",
        "oldPath": "src/solidarity.ts",
        "oldRevision": "c5284c3",
        "type": "modify",
      },
      Object {
        "hunks": Array [
          Object {
            "changes": Array [
              Object {
                "content": "master",
                "isDelete": true,
                "lineNumber": 1,
                "type": "delete",
              },
            ],
            "content": "@@ -1 +0,0 @@",
            "newLines": 1,
            "newStart": 0,
            "oldLines": 1,
            "oldStart": 1,
          },
        ],
        "newEndingNewLine": true,
        "newMode": "100644",
        "newPath": "/dev/null",
        "newRevision": "abb3a30",
        "oldEndingNewLine": true,
        "oldMode": "100644",
        "oldPath": "test.txt",
        "oldRevision": "c5284c3",
        "type": "delete",
      },
    ]
  `);
});
