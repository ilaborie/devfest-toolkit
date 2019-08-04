import { Command, flags } from "@oclif/command";
import * as Parser from "@oclif/parser";
export default class DevfestToolkit extends Command {
  static description: string;
  static flags: flags.Input<any>;
  static args: Parser.args.IArg[];
  run(): Promise<void>;
}
