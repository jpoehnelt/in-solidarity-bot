# Rule: `grandfathered`

This rule uses the following patterns: 
* `/grandfathered/gi`

It has a default check level of: `off`

## Alternatives
* `legacied`
* `exempted`

## Configuration

This check level of this rule can be modified with the following:

```yml
rules:
  grandfathered:
    level: failure
```

Available levels: 

* `off`
* `notice`
* `warning`
* `failure`

Additional rules and configuration options are at [docs/README.md](../README.md).

_This document is generated from a template using [rules.ts](https://github.com/jpoehnelt/in-solidarity-bot/blob/main/src/rules.ts) and [docs/index.ts](https://github.com/jpoehnelt/in-solidarity-bot/blob/main/docs/index.ts)._
