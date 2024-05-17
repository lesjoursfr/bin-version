import { execa } from "execa";
import findVersions from "find-versions";

const oneMegabyte = 1000 * 1000;

const knownBinaryArguments = new Map<string, Array<string>>([
  ["ffmpeg", ["-version"]],
  ["ffprobe", ["-version"]],
  ["ffplay", ["-version"]],
  ["openssl", ["version"]],
]);

const defaultPossibleArguments = [["--version"], ["version"]];

export type BinaryVersionOptions = {
  args?: readonly string[];
};

export default async function binaryVersion(binary: string, options: BinaryVersionOptions = {}): Promise<string> {
  let possibleArguments;

  if (options.args === undefined) {
    const customArgs = knownBinaryArguments.get(binary);
    possibleArguments = customArgs === undefined ? defaultPossibleArguments : [customArgs];
  } else {
    possibleArguments = [options.args];
  }

  for (const args of possibleArguments) {
    try {
      const { all } = await execa(binary, args, {
        all: true,
        encoding: "utf8",
        maxBuffer: oneMegabyte,
      });

      const [version] = findVersions(all!, { loose: true });
      if (version !== undefined) {
        return version;
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
        throw new Error(`Couldn't find the \`${binary}\` binary. Make sure it's installed and in your $PATH.`, {
          cause: error,
        });
      }

      if ((error as NodeJS.ErrnoException)?.code === "EACCES") {
        throw error;
      }
    }
  }

  throw new Error(`Couldn't find version of \`${binary}\``);
}
