declare module "danger-plugin-toolbox" {
  import { danger } from "danger";
  import { F } from "ts-toolbelt";

  /**
   * List of all committed files (both added and modified).
   */
  export const committedFiles: string[];

  /**
   * Returns a list of all committed files that match the provided regex.
   *
   * @example
   * ```ts
   * const testFiles = committedFilesGrep(/(\.test\.js|\.spec\.js)$/);
   * ```
   */
  export function committedFilesGrep(regex: RegExp): string[];

  /**
   * Generate a link to a file in the repository (shorthand for `danger.utils.href`).
   */
  export const href: typeof danger["utils"]["href"];

  function linkToRepo(
    repoUrl: string,
    file: string,
    text?: string,
    branch?: string
  ): F.Return<typeof href>;

  /**
   * Get a link to a file in the source repository (the one where the pull request is being send from).
   */
  export function linkToSourceRepo(
    filename: string,
    text: string,
    branch: string
  ): F.Return<typeof linkToRepo>;

  /**
   * Return the diff for a specific file (shorthand for `danger.git.diffForFile`).
   */
  export const diffForFile: typeof danger["git"]["diffForFile"];

  type LogType = "warn" | "fail" | "message";

  /**
   * Check if the provided regex matches any added line in the files.
   *
   * This can be used to prevent some text being added (like debugging commands, banned words...).
   *
   * @param filesRegex The regular expression matching the files to analyse.
   * @param lineRegex The regular expression matching the line content to find.
   * @param buildMessage The function to build the message string to display. This function gets the filename as parameter.
   *
   * @example
   * ```ts
   * commonAddedLinesContains(
   *   /\.(js|jsx)$/i,
   *   /console\.[a-z]+/,
   *   (f) => `The file "${f}" may contain console commands.`
   * );
   *
   * commonAddedLinesContains(
   *   /\.md$/i,
   *   /react native+/,
   *   () => 'Please, use "React Native" instead of "react native".',
   *   { inline: true }
   * );
   *
   * commonAddedLinesContains(
   *   /\.(js|jsx)$/i,
   *   /console\.[a-z]+/,
   *   (f) => `The file "${f}" may contain console commands.`,
   *   { logType: "fail" }
   * );
   * ```
   */
  export function commonAddedLinesContains(
    filesRegex: RegExp,
    lineRegex: RegExp,
    buildMessage: (filename: string) => string,
    configuration?: {
      inline?: boolean;
      logType?: LogType;
    }
  ): Promise<void>;

  /**
   * Make sure file contents match a regex.
   *
   * `reverse` can be used to make sure file contents do not match a regex.
   * `notInCommit` can be used to run the validation even if the file has not been committed.
   *
   * @example
   * ```ts
   * commonFileContains("changelog.md", /unreleased/im);
   * commonFileContains("file.js", /^\s*var /im, { reverse: true });
   * ```
   */
  export function commonFileContains(
    file: string,
    regex: RegExp,
    configuration?: {
      reverse?: boolean;
      notInCommit?: boolean;
      logType?: LogType;
      buildMessage?: (
        filename: string,
        regex: RegExp,
        reverse: boolean
      ) => string;
    }
  ): void;

  /**
   * Check if `dependencies` and `devDependencies` in `package.json` and `package-lock.json`
   * are in sync, and reports any mismatch between the expected version (`package.json`)
   * and the installed one (`package-lock.json`).
   *
   * @example
   * ```ts
   * jsOutOfSyncDeps();
   * jsOutOfSyncDeps({ logType: "fail" });
   * jsOutOfSyncDeps({ path: "another/folder/" });
   * ```
   */
  export function jsOutOfSyncDeps(configuration?: {
    path: string;
    logType?: LogType;
  }): Promise<void>;

  /**
   * Make sure the files exist in the repo.
   *
   * @example
   * ```ts
   * commonFileExists("file.js");
   * commonFileExists(["file1.js", "folder/file2.js"]);
   * commonFileExists("file.js", { logType: "fail" });
   * ```
   */
  export function commonFileExists(
    files: string | string[],
    configuration?: {
      logType?: LogType;
      buildMessage?: (filename: string) => string;
    }
  ): void;
}
