# How to become a contributor and submit your own code

> **Note**: Additional rules are welcome and can be added in [src/rules.ts](https://github.com/jpoehnelt/in-solidarity-bot/blob/main/src/rules.ts).

1.  Submit an issue describing your proposed change to the repo in question.
1.  Fork the desired repo, develop and test your code changes.
1.  Ensure that your code adheres to the existing style in the code to which
    you are contributing.
1.  Ensure that your code has an appropriate set of tests which all pass.
1.  Title your pull request following [Conventional Commits](https://www.conventionalcommits.org/) styling.
1.  Submit a pull request.

## Running the tests

1.  [Prepare your environment for Node.js setup][setup].

1.  Install dependencies:

        npm install

1.  Run the tests:

        # Run unit tests.
        npm test

[setup]: https://cloud.google.com/nodejs/docs/setup
