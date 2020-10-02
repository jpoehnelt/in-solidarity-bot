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

import { DEFAULT_CONFIGURATION, InvalidConfigError, getConfig } from "./config";

import { Context } from "probot";
import fs from "fs";
import yaml from "js-yaml";

const fakeContext = ({
  config: async () =>
    yaml.safeLoad(fs.readFileSync("./fixtures/in-solidarity.yml", "utf8")),
} as unknown) as Context;

test("should override default rules", async () => {
  const config = await getConfig(fakeContext);
  expect(config.rules.master).toEqual({
    level: "off",
    regex: DEFAULT_CONFIGURATION.rules.master.regex,
    alternatives: DEFAULT_CONFIGURATION.rules.master.alternatives,
  });
  expect(config.ignore).toEqual([".github/in-solidarity.yml", "**/*.yml"]);
});

test("should allow changing default regex", async () => {
  const context = ({
    config: async () => {
      return {
        rules: {
          master: {
            regex: ["/MaStEr/g"],
          },
        },
      };
    },
  } as unknown) as Context;
  const config = await getConfig(context);
  expect(config.rules.master.regex[0]).toEqual(/MaStEr/g);
});

test("should override default alternatives", async () => {
  const context = ({
    config: async () => {
      return {
        rules: {
          master: {
            alternatives: ["PRIMARY"],
          },
        },
      };
    },
  } as unknown) as Context;
  const config = await getConfig(context);
  expect(config.rules.master.alternatives).toEqual(["PRIMARY"]);
});

test("should throw for invalid regex pattern", async () => {
  const context = ({
    config: async () => {
      return {
        rules: {
          foo: {
            regex: ["foo"],
          },
        },
      };
    },
  } as unknown) as Context;
  await expect(getConfig(context)).rejects.toMatchInlineSnapshot(`
          [Error: configuration is invalid: [
            {
              "keyword": "required",
              "dataPath": ".rules['foo']",
              "schemaPath": "#/properties/rules/additionalProperties/required",
              "params": {
                "missingProperty": "level"
              },
              "message": "should have required property 'level'"
            },
            {
              "keyword": "pattern",
              "dataPath": ".rules['foo'].regex[0]",
              "schemaPath": "#/definitions/regex/items/pattern",
              "params": {
                "pattern": "^/.+/[giu]*$"
              },
              "message": "should match pattern \\"^/.+/[giu]*$\\""
            }
          ]]
        `);
});

test("should throw for empty regex array", async () => {
  const context = ({
    config: async () => {
      return {
        rules: {
          foo: {
            level: "off",
            regex: [],
          },
        },
      };
    },
  } as unknown) as Context;
  await expect(getConfig(context)).rejects.toMatchInlineSnapshot(`
          [Error: configuration is invalid: [
            {
              "keyword": "minItems",
              "dataPath": ".rules['foo'].regex",
              "schemaPath": "#/definitions/regex/minItems",
              "params": {
                "limit": 1
              },
              "message": "should NOT have fewer than 1 items"
            }
          ]]
        `);
});

test("should ignore defaults", async () => {
  const context = ({
    config: async () => {
      return {
        rules: {
          foo: {
            level: "failure",
            regex: ["/foo/gi"],
          },
        },
        ignoreDefaults: true,
      };
    },
  } as unknown) as Context;
  const config = await getConfig(context);
  expect(config).toMatchInlineSnapshot(`
    Object {
      "defaultMessage": "
    Please consider an alternative to \`{{match}}\`. 
    {{#if alternatives~}}

    Possibilities include: {{#each alternatives}}{{#if @index}}, {{/if}}\`{{this}}\`{{/each}}
    {{~/if}}
    ",
      "ignore": Array [],
      "ignoreDefaults": true,
      "rules": Object {
        "foo": Object {
          "level": "failure",
          "regex": Array [
            /foo/gi,
          ],
        },
      },
    }
  `);
});

test("should throw if ignoring defaults without rules", async () => {
  const context = ({
    config: async () => {
      return {
        ignoreDefaults: true,
      };
    },
  } as unknown) as Context;
  await expect(getConfig(context)).rejects.toMatchInlineSnapshot(`
          [Error: configuration is invalid: [
            {
              "keyword": "required",
              "dataPath": "",
              "schemaPath": "#/then/required",
              "params": {
                "missingProperty": "rules"
              },
              "message": "should have required property 'rules'"
            },
            {
              "keyword": "if",
              "dataPath": "",
              "schemaPath": "#/if",
              "params": {
                "failingKeyword": "then"
              },
              "message": "should match \\"then\\" schema"
            }
          ]]
        `);
});

test("should throw for invalid flags", async () => {
  const context = ({
    config: async () => {
      return {
        rules: {
          foo: {
            level: "failure",
            regex: ["/master/m"],
          },
        },
      };
    },
  } as unknown) as Context;
  await expect(getConfig(context)).rejects.toMatchInlineSnapshot(`
          [Error: configuration is invalid: [
            {
              "keyword": "pattern",
              "dataPath": ".rules['foo'].regex[0]",
              "schemaPath": "#/definitions/regex/items/pattern",
              "params": {
                "pattern": "^/.+/[giu]*$"
              },
              "message": "should match pattern \\"^/.+/[giu]*$\\""
            }
          ]]
        `);
});

test("should throw for invalid config having level at top", async () => {
  const context = ({
    config: async () => {
      return {
        rules: {
          master: "failure",
        },
      };
    },
  } as unknown) as Context;
  await expect(getConfig(context)).rejects.toBeInstanceOf(InvalidConfigError);
});

test("should handle case where no repo config", async () => {
  const context = ({
    config: async () => {
      return;
    },
  } as unknown) as Context;
  await expect(getConfig(context)).resolves.toBe(DEFAULT_CONFIGURATION);
});
