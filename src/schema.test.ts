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

import { ajv, schema } from "./schema";

const validate = ajv.compile(schema);

test("should validate", () => {
  validate({
    rules: {
      master: { level: "off" },
      foo: { level: "failure", regex: ["/foo/gi"] },
    },
  });
  expect(validate.errors).toBeFalsy();
});

// mosts tests are in config.test.ts
