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

import { DEFAULT_MESSAGE, DEFAULT_RULES, Level, Rule } from "./rules";
import { ajv, schema } from "./schema";

import { Context } from "probot";
import deepmerge from "deepmerge";
import regexParser from "regex-parser";

export interface Configuration {
  rules: { [key: string]: Rule };
  ignore: string[];
  defaultMessage: string;
  ignoreDefaults?: boolean;
}

export interface RepoRule {
  regex?: (string | RegExp)[];
  level?: Level;
  alternatives?: string[];
  message?: string;
}

export interface RepoConfiguration {
  rules?: { [key: string]: RepoRule };
  ignore?: string[];
  ignoreDefaults?: boolean;
  defaultMessage?: string;
}

export class InvalidConfigError extends Error {}

export const DEFAULT_CONFIGURATION: Configuration = {
  rules: DEFAULT_RULES,
  ignore: [".github/in-solidarity.yml"],
  defaultMessage: DEFAULT_MESSAGE,
};

const CONFIG_FILE = "in-solidarity.yml";

export const getConfig = async (
  context: Context<"pull_request">
): Promise<Configuration> => {
  const validate = ajv.compile(schema);

  const repoConfig = (await context.config(CONFIG_FILE)) as RepoConfiguration;

  if (repoConfig) {
    if (!validate(repoConfig)) {
      throw new InvalidConfigError(
        "configuration is invalid: " + JSON.stringify(validate.errors, null, 2)
      );
    }

    // parse all strings into regexp
    for (const k in repoConfig.rules) {
      if (repoConfig.rules[k].regex) {
        repoConfig.rules[k].regex = repoConfig.rules[k].regex!.map(
          (pattern) => {
            try {
              return regexParser(pattern as string);
            } catch (e) {
              throw new InvalidConfigError(
                `configuration is invalid: unable to parse ${pattern} as regex`
              );
            }
          }
        );
      }
    }
    if (repoConfig.ignoreDefaults) {
      return {
        defaultMessage: DEFAULT_MESSAGE,
        rules: {} as any,
        ignore: [],
        ...repoConfig,
      };
    }
    return deepmerge(DEFAULT_CONFIGURATION, repoConfig as Configuration, {
      // overwrite from repo config
      arrayMerge: (_, b) => b,
    });
  }

  return DEFAULT_CONFIGURATION;
};
