import * as util from 'util';
import * as fs from 'fs';

export const readdir = util.promisify(fs.readdir);
export const writeFile = util.promisify(fs.writeFile);
export const readFile = util.promisify(fs.readFile);
export const stat = util.promisify(fs.stat);
export const mkdir = util.promisify(fs.mkdir);

export const canRead = (path: string): boolean => {
    try {
        fs.accessSync(path, fs.constants.R_OK);
        return true;
    } catch (_) {
        return false;
    }
};

export const canWrite = (path: string): boolean => {
    try {
        fs.accessSync(path, fs.constants.W_OK);
        return true;
    } catch (_) {
        return false;
    }
};


