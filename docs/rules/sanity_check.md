# Rule: `sanity_check`

This rule uses the following patterns: 
* `/sanity[_-]*check/gi`

It has a default check level of: `off`

## Alternatives
* `smoke test`
* `confidence check`

## Configuration

This check level of this rule can be modified with the following:

```yml
rules:
  sanity_check:
    level: failure
```

Available levels: 

* `off`
* `notice`
* `warning`
* `failure`

Additional rules and configuration options are at [docs/README.md](../README.md).

_This document is generated from a template using [rules.ts](https://github.com/jpoehnelt/in-solidarity-bot/blob/main/src/rules.ts) and [docs/index.ts](https://github.com/jpoehnelt/in-solidarity-bot/blob/main/docs/index.ts)._
