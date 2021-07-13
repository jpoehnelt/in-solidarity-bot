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

export interface Rule {
  regex: (string | RegExp)[];
  level: Level;
  alternatives?: string[];
  message?: string;
}
export interface MessageContext {
  name: string;
  regex: string[];
  match: string;
  content: string;
  alternatives?: string[];
}

export const DEFAULT_MESSAGE = `
Please consider an alternative to \`{{match}}\`. 
{{#if alternatives~}}

Possibilities include: {{#each alternatives}}{{#if @index}}, {{/if}}\`{{this}}\`{{/each}}
{{~/if}}
`;

export enum Level {
  OFF = "off",
  NOTICE = "notice",
  WARNING = "warning",
  FAILURE = "failure",
}

export const DEFAULT_RULES: { [key: string]: Rule } = {
  master: {
    regex: [/master/gi],
    level: Level.WARNING,
    alternatives: ["primary", "main", "leader", "active", "writer"],
  },
  slave: {
    regex: [/slave/gi],
    level: Level.WARNING,
    alternatives: ["secondary", "node", "worker", "replica", "passive"],
  },
  whitelist: {
    regex: [/white[_-]*list/gi],
    level: Level.WARNING,
    alternatives: ["include list", "allow list"],
  },
  blacklist: {
    regex: [/black[_-]*list/gi],
    level: Level.WARNING,
    alternatives: ["exclude list", "deny list"],
  },
  grandfathered: {
    regex: [/grandfathered/gi],
    level: Level.OFF,
    alternatives: ["legacied", "exempted"],
  },
  sanity_check: {
    regex: [/sanity[_-]*check/gi],
    level: Level.OFF,
    alternatives: ["smoke test", "confidence check"],
  },
  man_hours: {
    regex: [/man[_-]*hours/gi],
    level: Level.OFF,
    alternatives: ["person-hours", "human-hours"],
  },
};
