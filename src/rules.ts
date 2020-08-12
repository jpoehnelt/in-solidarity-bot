export interface Rule {
  regex: (string | RegExp)[];
  level: Level;
}

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
  },
  slave: {
    regex: [/slave/gi],
    level: Level.WARNING,
  },
  whitelist: {
    regex: [/white[_-]*list/gi],
    level: Level.WARNING,
  },
  blacklist: {
    regex: [/black[_-]*list/gi],
    level: Level.WARNING,
  },
};
