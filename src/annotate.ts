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
import { Level, MessageContext } from "./rules";

import { Configuration } from "./config";
import { File } from "gitdiff-parser";
import handlebars from "handlebars";
import minimatch from "minimatch";
import pino from "pino";

export type ChecksUpdateParamsOutputAnnotations = {
  path: string;
  start_line: number;
  end_line: number;
  start_column?: number;
  end_column?: number;
  annotation_level: "notice" | "warning" | "failure";
  message: string;
  title?: string;
  raw_details?: string;
};

export const annotate = (
  config: Configuration,
  files: File[],
  logger: pino.Logger
): ChecksUpdateParamsOutputAnnotations[] => {
  const annotations: ChecksUpdateParamsOutputAnnotations[] = [];

  for (const f of files) {
    if (
      f.type === "delete" ||
      f.isBinary ||
      f.newPath === undefined ||
      config.ignore.some((pattern) => minimatch(f.newPath, pattern))
    ) {
      continue;
    }

    for (const h of f.hunks) {
      for (const change of h.changes) {
        if (change.isInsert) {
          for (const k in config.rules) {
            for (const pattern of config.rules[k].regex) {
              if (config.rules[k].level == "off") {
                continue;
              }

              // @ts-ignore matchAll may not be available
              for (const match of change.content.matchAll(pattern)) {
                const context: MessageContext = {
                  name: k,
                  match: match[0],
                  regex: config.rules[k].regex.map((r) => r.toString()),
                  content: change.content,
                  alternatives: config.rules[k].alternatives || [],
                };

                const annotation = {
                  annotation_level: config.rules[k].level as
                    | "notice"
                    | "warning"
                    | "failure",
                  end_column: match.index! + match[0].length - 1,
                  end_line: (change.lineNumber ||
                    change.newLineNumber) as number,
                  message: handlebars.compile(
                    config.rules[k].message || config.defaultMessage
                  )(context),
                  path: f.newPath,
                  raw_details: pattern.toString(),
                  start_column: match.index,
                  start_line: (change.lineNumber ||
                    change.newLineNumber) as number,
                  title: "Match Found",
                };

                logger.info(
                  {
                    path: annotation.path,
                    line: annotation.start_line,
                    column: annotation.start_column,
                    content: change.content,
                    regex: pattern.toString(),
                    level: annotation.annotation_level,
                  },
                  "match"
                );

                annotations.push(annotation);
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
  annotations: ChecksUpdateParamsOutputAnnotations[]
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
