/// <reference types="node" />
import * as fs from "fs";
export declare const readdir: typeof fs.readdir.__promisify__;
export declare const writeFile: typeof fs.writeFile.__promisify__;
export declare const readFile: typeof fs.readFile.__promisify__;
export declare const stat: typeof fs.stat.__promisify__;
export declare const mkdir: typeof fs.mkdir.__promisify__;
export declare const canRead: (path: string) => boolean;
export declare const canWrite: (path: string) => boolean;
