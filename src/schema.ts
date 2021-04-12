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

import { DEFAULT_RULES, Level } from "./rules";

import Ajv from "ajv";

const regex = {
  type: "array",
  minItems: 1,
  items: {
    type: "string",
    pattern: "^/.+/[giu]*$",
  },
};

const level = { type: "string", enum: Object.values(Level) };
const alternatives = {
  type: "array",
  items: {
    type: "string",
    minLength: 2,
  },
};
const message = { type: "string" };

const defaultRule = {
  type: "object",
  additionalProperties: false,
  properties: {
    level: { $ref: "#/definitions/level" },
    alternatives: { $ref: "#/definitions/alternatives" },
    regex: { $ref: "#/definitions/regex" },
    message,
  },
};

const defaultRules = Object.keys(DEFAULT_RULES).reduce((obj, k) => {
  obj[k] = defaultRule;
  return obj;
}, {});

const customRules = {
  ...defaultRule,
  required: ["level", "regex"],
};

export const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  additionalProperties: false,
  definitions: { level, regex, alternatives },
  properties: {
    ignore: {
      type: "array",
      minItems: 1,
      items: { type: "string" },
    },
    ignoreDefaults: {
      type: "boolean",
    },
    rules: {
      type: "object",
      properties: defaultRules,
      additionalProperties: customRules,
    },
    defaultMessage: {
      type: "string",
    },
  },
  if: {
    required: ["ignoreDefaults"],
    properties: { ignoreDefaults: true },
  },
  then: {
    required: ["rules"],
    properties: {
      rules: {
        type: "object",
        properties: {}, // all rules must now match customRules
        additionalProperties: customRules,
      },
    },
  },
};

export const ajv = new Ajv({ allErrors: true });
