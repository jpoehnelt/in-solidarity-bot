#!/usr/bin/env node
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

import {
  DEFAULT_MESSAGE,
  DEFAULT_RULES,
  Level,
  MessageContext,
} from "../rules";

import fs from "fs";
import handlebars from "handlebars";
import path from "path";
import { schema } from "../schema";

/// Write individual rule pages
const RULE_TEMPLATE = handlebars.compile(
  fs.readFileSync(path.join(__dirname, "../templates/RULE.hbs"), "utf8")
);

fs.mkdirSync(path.join(__dirname, `../../../docs/rules`), { recursive: true });

for (const k in DEFAULT_RULES) {
  fs.writeFileSync(
    path.join(__dirname, `../../../docs/rules/${k}.md`),
    RULE_TEMPLATE({
      ...DEFAULT_RULES[k],
      levels: Object.values(Level),
      rule: k,
    }),
    "utf8"
  );
}

/// Write rule index page

type KeysEnum<T> = { [P in keyof Required<T>]: true };
const MessageContextKeys: KeysEnum<MessageContext> = {
  name: true,
  match: true,
  alternatives: true,
  content: true,
  regex: true,
};

const README_TEMPLATE = handlebars.compile(
  fs.readFileSync(path.join(__dirname, "../templates/README.hbs"), "utf8")
);

fs.writeFileSync(
  path.join(__dirname, `../../../docs/README.md`),
  README_TEMPLATE({
    messageContextKeys: Object.keys(MessageContextKeys),
    DEFAULT_MESSAGE,
    rules: Object.keys(DEFAULT_RULES).map((k) => {
      return {
        rule: k,
        level: DEFAULT_RULES[k].level,
      };
    }),
  }),
  "utf8"
);

/// Write schema
fs.writeFileSync(
  path.join(__dirname, `../../../docs/schema.json`),
  JSON.stringify(schema, null, 2),
  "utf8"
);
