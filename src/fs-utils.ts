import * as util from "util";
import * as fs from "fs";
import { statSync } from "fs";
import * as path from "path";
import * as r from "request";
import { Logger } from "plop-logger";

export const readdir = util.promisify(fs.readdir);
export const writeFile = util.promisify(fs.writeFile);
export const readFile = util.promisify(fs.readFile);
export const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);

export const canRead = (path: string): boolean => {
  try {
    fs.accessSync(path, fs.constants.R_OK);
    return true;
  } catch (_) {
    return false;
  }
};

export const isFileEmpty = (path: string): boolean => {
  try {
    const fileStats = statSync(path);
    return fileStats.size == 0;
  } catch (_) {
    return false;
  }
};

export async function createParentDir(file: string): Promise<void> {
  const parent = path.dirname(file);
  await mkdir(parent, { recursive: true });
}

export async function downloadToFile(
  uri: string,
  filename: string
): Promise<string> {
  const logger = Logger.getLogger("download");
  return createParentDir(filename).then(
    () =>
      new Promise<string>((resolve, reject) => {
        logger.debug("Download file", uri);
        r.head(uri, function(err, res) {
          let extension = "";
          switch (res.headers["content-type"]) {
            case "image/png":
              extension = ".png";
              break;
            case "image/jpeg":
              extension = ".jpg";
              break;
          }
          const dest = filename + extension;
          logger.debug("To file", dest);
          r.get({ uri }).pipe(
            fs
              .createWriteStream(dest)
              .on("close", (err: any) =>
                err ? reject(err) : resolve(path.basename(dest))
              )
          );
        });
      })
  );
}
