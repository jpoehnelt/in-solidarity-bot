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

import { DEFAULT_RULES, Rule } from "./rules";

import Ajv from "ajv";
import { Context } from "probot";
import { Level } from "./rules";
import deepmerge from "deepmerge";

export interface Configuration {
  rules: { [key: string]: Rule };
  ignore: string[];
}
export class InvalidConfigError extends Error {}

export const DEFAULT_CONFIGURATION: Configuration = {
  rules: DEFAULT_RULES,
  ignore: [".github/in-solidarity.yml"],
};

const CONFIG_FILE = "in-solidarity.yml";

const ajv = new Ajv({ allErrors: true });

const rulesPropertiesSchema = Object.keys(DEFAULT_RULES).reduce((obj, k) => {
  obj[k] = {
    type: "object",
    additionalProperties: false,
    properties: {
      level: { type: "string", enum: Object.values(Level) },
    },
  };
  return obj;
}, {});

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    rules: {
      type: "object",
      additionalProperties: false,
      properties: rulesPropertiesSchema,
    },
    ignore: {
      type: "array",
      items: { type: "string" },
    },
  },
};

export const getConfig = async (context: Context): Promise<Configuration> => {
  const validate = ajv.compile(schema);

  const repoConfig = await context.config(CONFIG_FILE);
  if (repoConfig) {
    if (!validate(repoConfig)) {
      throw new InvalidConfigError(
        "configuration is invalid: " + JSON.stringify(validate.errors)
      );
    }

    return deepmerge(DEFAULT_CONFIGURATION, repoConfig as Configuration, {
      arrayMerge: (_, b) => b,
    });
  }
  return DEFAULT_CONFIGURATION;
};
