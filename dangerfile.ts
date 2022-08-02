/// <reference path="types/danger-plugin-toolbox/index.d.ts" />

import { danger, fail, message, warn } from "danger";
import { committedFilesGrep, LogType } from "danger-plugin-toolbox";
import { readFileSync } from "fs";

type DangerLogger = {
  [K in LogType | "noop"]: K extends "noop"
    ? () => void
    : K extends "warn"
    ? typeof warn
    : K extends "message"
    ? typeof message
    : K extends "fail"
    ? typeof fail
    : never;
};
const DangerLogger: DangerLogger = {
  ["warn"]: warn,
  ["fail"]: fail,
  ["message"]: message,
  noop: () => {},
};

const modifiedMD = danger.git.modified_files.join("\n - ");
message("Changed Files in this PR: \n - " + modifiedMD);
console.log;

function commonAddedLinesContains(
  filesRegex: RegExp,
  lineRegex: RegExp,
  buildMessage: (filename: string, line: string) => string,
  configuration?: {
    logType?: LogType;
  }
) {
  const logger = DangerLogger[configuration?.logType ?? "noop"];
  const files = committedFilesGrep(filesRegex);
  files.forEach((file) => {
    const lines = readFileSync(file)
      .toString()
      .split("\n")
      .filter(lineRegex.test.bind(lineRegex));
    lines.forEach((line) => {
      logger(buildMessage(file, line), file);
    });
  });
}
commonAddedLinesContains(
  /\.[tj]sx?$/i,
  /console\.[a-z]+/gm,
  (f) => `The file "${f}" may contain console commands.`,
  { logType: "fail" }
);

function hasSchemaMigrations() {
  const migrationChanges = committedFilesGrep(/prisma\/migrations/);
  return migrationChanges.length !== 0;
}

function checkForSchemaChange() {
  const schemaChanges = committedFilesGrep(/schema\.prisma/);

  if (schemaChanges.length == 0) {
    return;
  }

  const [schemaFileName] = schemaChanges; // should be only one

  message(`# Schema changes detected:
- ${schemaFileName}

**Please make sure you updated your types accordingly.**
`);

  if (!hasSchemaMigrations()) {
    fail(
      "No schema migrations detected. Please add a new migration.",
      schemaFileName
    );
  } else {
  }
}

function checkProtectedFiles() {
  const protectedFiles = committedFilesGrep(/\.env|\.github|\.vscode/gm);
  protectedFiles.forEach((file) => {
    warn(
      `- [ ] This file is not normally edited. Double check you meant to do this.`,
      file
    );
  });
}

checkProtectedFiles();
// checkForSchemaChange();
