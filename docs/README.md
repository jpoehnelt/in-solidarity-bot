# Configuration
The bot can be configured with a file located at `.github/in-solidarity.yml` in the target repo or at the same path in a repo named `.github` within the organization. The JSON schema is located at [docs/schema.json](https://github.com/jpoehnelt/in-solidarity-bot/blob/main/docs/schema.json).

```yaml
rules:
  master:
    level: off
  slave:
    level: failure
    message: >
      Please consider an alternative to ``. 
      
      See http://example.com/ for more information
  foo:
    regex:
      - /foo/gi
      - /foobar/gi
    level: failure
ignore:
 - ".github/in-solidarity.yml"  # default
 - "**/*.yml"
```
The possible levels are `['off', 'notice', 'warning', 'failure']`. These correspond to [annotation_level in the GitHub API](https://docs.github.com/en/rest/reference/checks#create-a-check-run).

> **Note**: The merging of defaults uses array replacement. This means any array provided by the configuration will be used and default elements ignored.

> **Note**: The bot uses the configuration from the default branch. Therefore any changes to the configuration in a pull request will not be used until merged.

> **Note**: Read more about configuration for organizations at [Probot best practices](https://github.com/probot/probot/blob/master/docs/best-practices.md#store-configuration-in-the-repository).

### Ignoring Defaults
The default rules can be ignored with `ignoreDefaults: true` such as in the following.

```yaml
rules:
  foo:
    regex:
      - /foo/gi
      - /foobar/gi
    level: failure
ignoreDefaults: true
```
This will only check the single rule specified here.

### Annotation Messages
The annotation messages generated from the checks can be customized in two ways:

1. Set the `message` property on the rule.
1. Set the `defaultMessage` property at the root of the config.

Priority is given to the `message` property on the rule. These strings use handlebars for templates with the following context.

* name
* match
* alternatives
* content
* regex

The default message is:

```

Please consider an alternative to `{{match}}`. 
{{#if alternatives~}}

Possibilities include: {{#each alternatives}}{{#if @index}}, {{/if}}`{{this}}`{{/each}}
{{~/if}}

```
# Rules

The following are the default rules.

| rule  | level |
|---|---|
|[master](rules/master.md)  | `warning`  |
|[slave](rules/slave.md)  | `warning`  |
|[whitelist](rules/whitelist.md)  | `warning`  |
|[blacklist](rules/blacklist.md)  | `warning`  |
|[grandfathered](rules/grandfathered.md)  | `off`  |
|[sanity_check](rules/sanity_check.md)  | `off`  |
|[man_hours](rules/man_hours.md)  | `off`  |

> **Note**: Additional rules are welcome and can be added in [src/rules.ts](https://github.com/jpoehnelt/in-solidarity-bot/blob/main/src/rules.ts).

_This document is generated from a template using [src/rules.ts](https://github.com/jpoehnelt/in-solidarity-bot/blob/main/src/rules.ts) and [docs/index.ts](https://github.com/jpoehnelt/in-solidarity-bot/blob/main/docs/index.ts)._
