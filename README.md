# In Solidarity

[![Install](https://img.shields.io/badge/-Install%20App-blue)](https://github.com/apps/in-solidarity)
![Build](https://github.com/jpoehnelt/in-solidarity-bot/workflows/Build/badge.svg)
![Release](https://github.com/jpoehnelt/in-solidarity-bot/workflows/Release/badge.svg)
[![codecov](https://codecov.io/gh/jpoehnelt/in-solidarity-bot/branch/master/graph/badge.svg)](https://codecov.io/gh/jpoehnelt/in-solidarity-bot)
![GitHub contributors](https://img.shields.io/github/contributors/jpoehnelt/in-solidarity-bot?color=green)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm](https://img.shields.io/npm/v/in-solidarity-bot)](https://www.npmjs.com/package/in-solidarity-bot)
[![](./static//badge-flat.png)](https://github.com/apps/in-solidarity)

> A GitHub Bot built with [Probot](https://github.com/probot/probot) that checks for inclusive language. See [help](./static/HELP.md) for more information.

![](./static/screenshot.png)

## Install

The app can be installed at https://github.com/apps/in-solidarity.

> Note: The checks currently run on public repositories. This helps limit permissions for organizations with many repositories.

Share this app with one of the following badges.

```md
[![](https://github.com/jpoehnelt/in-solidarity-bot/raw/main/static//badge-flat.png)](https://github.com/apps/in-solidarity)

[![](https://github.com/jpoehnelt/in-solidarity-bot/raw/main/static//badge-flat-square.png)](https://github.com/apps/in-solidarity)

[![](https://github.com/jpoehnelt/in-solidarity-bot/raw/main/static//badge-for-the-badge.png)](https://github.com/apps/in-solidarity)
```

[![](https://github.com/jpoehnelt/in-solidarity-bot/raw/main/static//badge-flat.png)](https://github.com/apps/in-solidarity)

[![](https://github.com/jpoehnelt/in-solidarity-bot/raw/main/static//badge-flat-square.png)](https://github.com/apps/in-solidarity)

[![](https://github.com/jpoehnelt/in-solidarity-bot/raw/main/static//badge-for-the-badge.png)](https://github.com/apps/in-solidarity)

### Configuration

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

The rule names and the associated regex patterns are in [rules.ts](https://github.com/jpoehnelt/in-solidarity-bot/blob/main/src/rules.ts). Contributions are welcome!

> **Note**: The bot uses the configuration from the default branch. Therefore any changes to the configuration in a pull request will not be used until merged.


## Production

A [hosted version of this app](https://github.com/apps/in-solidarity) is available and a basic status page can be found at https://stats.uptimerobot.com/rX0A4iA75m.

## Development

```sh
# Install dependencies
npm install

# Run typescript
npm run build

# Set appropriate .env values and run the bot
npm start
```

## Contributing

If you have suggestions for how the bot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

This is not an official Google product.
