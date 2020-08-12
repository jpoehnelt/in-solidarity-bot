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
  config: () =>
    yaml.safeLoad(fs.readFileSync("./fixtures/in-solidarity.yml", "utf8")),
} as unknown) as Context;

test("should override default rules", async () => {
  const config = await getConfig(fakeContext);
  expect(config.rules.master).toEqual({
    level: "off",
    regex: [/master/gi],
  });
});

test("should throw for invalid config", async () => {
  const context = ({
    config: () => {
      return {
        rules: {
          master: {
            regex: "MaStEr",
          },
        },
      };
    },
  } as unknown) as Context;
  await expect(getConfig(context)).rejects.toBeInstanceOf(InvalidConfigError);
});

test("should handle case wehre no repo config", async () => {
  const context = ({
    config: () => {
      return;
    },
  } as unknown) as Context;
  await expect(getConfig(context)).resolves.toBe(DEFAULT_CONFIGURATION);
});
