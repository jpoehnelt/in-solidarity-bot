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

import { Configuration } from "./config";
import { File } from "gitdiff-parser";
import { Level } from "./rules";
import { Octokit } from "@octokit/rest/";
import minimatch from "minimatch";

export const annotate = (
  config: Configuration,
  files: File[]
): Octokit.ChecksUpdateParamsOutputAnnotations[] => {
  const annotations: Octokit.ChecksUpdateParamsOutputAnnotations[] = [];

  for (const f of files) {
    if (config.ignore.some((pattern) => minimatch(f.newPath, pattern))) {
      continue;
    }

    for (const h of f.hunks) {
      for (const change of h.changes) {
        if (change.isInsert) {
          for (const k in config.rules) {
            for (const pattern of config.rules[k].regex) {
              // @ts-ignore matchAll may not be available
              for (const match of change.content.matchAll(pattern)) {
                annotations.push({
                  annotation_level: "warning",
                  end_column: match.index + match[0].length - 1,
                  end_line: (change.lineNumber ||
                    change.newLineNumber) as number,
                  message: `Please consider an alternative to \`${match[0]}\`.`,
                  path: f.newPath,
                  raw_details: pattern.toString(),
                  start_column: match.index,
                  start_line: (change.lineNumber ||
                    change.newLineNumber) as number,
                  title: "Match Found",
                });
              }
            }
          }
        }
      }
    }
  }
  return annotations;
};

const levels = [Level.OFF, Level.NOTICE, Level.WARNING, Level.FAILURE];

export const getLevelFromAnnotations = (
  annotations: Octokit.ChecksUpdateParamsOutputAnnotations[]
): Level => {
  let level = Level.OFF;

  for (const annotation of annotations) {
    const annotationLevel = annotation.annotation_level as Level;
    if (levels.indexOf(annotationLevel) > levels.indexOf(level)) {
      level = annotationLevel;
    }
  }

  return level;
};
