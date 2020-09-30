# Configuration
The bot can be configured with a file located at `.github/in-solidarity.yml` in the target repo or at the same path in a repo named `.github` in the organization.  

```yaml
rules:
  master:
    level: off
  slave:
    level: failure
ignore:
 - ".github/in-solidarity.yml"  # default
 - "**/*.yml"
```
The possible levels are `['off', 'notice', 'warning', 'failure']`. These correspond to [annotation_level in the GitHub API](https://docs.github.com/en/rest/reference/checks#create-a-check-run).

> **Note**: The bot uses the configuration from the default branch. Therefore any changes to the configuration in a pull request will not be used until merged.

# Rules

The following are the current rules. Additional rules are welcome!

| rule  | default level |
|---|---|
|[master](rules/master)  | `warning`  |
|[slave](rules/slave)  | `warning`  |
|[whitelist](rules/whitelist)  | `warning`  |
|[blacklist](rules/blacklist)  | `warning`  |
|[grandfathered](rules/grandfathered)  | `warning`  |
|[sanity_check](rules/sanity_check)  | `warning`  |
|[man_hours](rules/man_hours)  | `warning`  |

_This document is generated from a template using [rules.ts](https://github.com/jpoehnelt/in-solidarity-bot/blob/main/src/rules.ts) and [docs/index.ts](https://github.com/jpoehnelt/in-solidarity-bot/blob/main/docs/index.ts)._
