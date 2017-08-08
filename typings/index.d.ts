declare module 'patron.js' {
  import { GuildMember, Message, User } from 'discord.js';

  export class Argument {
    private static validateArgument(argument: Argument, name: string): void;
    public name: string;
    public key: string;
    public type: string;
    public typeReader: TypeReader;
    public example: string;
    public defaultValue: any;
    public infinite: boolean;
    public preconditions: ArgumentPrecondition[];
    public remainder: boolean;
    public optional: boolean;
    constructor(options: ArgumentOptions);
  }

  export enum ArgumentDefault {
    Author,
    Member,
    Channel,
    Guild,
    HighestRole
  }

  export class ArgumentPrecondition {
    public run(command: Command, message: Message, argument: Argument, value: any): Promise<Result>;
  }

  export class Command {
    private static validateCommand(command: Command, name: string): void;
    public names: string[];
    public group: Group;
    public groupName: string;
    public description: string;
    public guildOnly: boolean;
    public memberPermissions: string[];
    public botPermissions: string[];
    public preconditions: Precondition[];
    public args: Argument[];
    public coooldown: number;
    public hasCooldown: boolean;
    private cooldowns: Map<string, number>;
    constructor(options: CommandOptions);
    public run(message: Message, args: object): Promise<any>;
    public getUsage(): string;
    public getExample(): string;
  }

  export enum CommandError {
    Precondition,
    MemberPermission,
    BotPermission,
    TypeReader,
    GuildOnly,
    CommandNotFound,
    Cooldown,
    InvalidArgCount,
    Exception
  }

  export class CooldownResult extends Result {
    public static fromError(command: Command, cooldown: number, remaining: number): CooldownResult;
    private constructor(options: CooldownResultOptions);
  }

  export class ExceptionResult extends Result {
    public static fromError(command: Command, error: Error): ExceptionResult;
    private constructor(options: ExceptionResultOptions);
  }

  export class Group {
    private static validateGroup(group: Group, name: string): void;
    public name: string;
    public description: string;
    public preconditions: Precondition[];
    public commands: Command[];
    constructor(options: GroupOptions);
  }

  export class Handler {
    public registry: Registry;
    constructor(registry: Registry);
    public run(message: Message, prefix: string): Promise<Result | CooldownResult | ExceptionResult | PreconditionResult | TypeReaderResult>;
  }

  export class Precondition {
    public run(command: Command, message: Message): Promise<PreconditionResult>;
  }

  export class PreconditionResult extends Result {
    public static fromSuccess(): PreconditionResult;
    public static fromError(command: Command, reason: string): PreconditionResult;
    private constructor(options: ResultOptions);
  }

  export class Registry {
    public commands: Command[];
    public groups: Group[];
    public typeReaders: TypeReader[];
    public registerDefaultTypeReaders(): Registry;
    public registerTypeReadersIn(path: string): Registry;
    public registerTypeReaders(typeReaders: TypeReader[]): Registry;
    public registerGroupsIn(path: string): Registry;
    public registerGroups(groups: Group[]): Registry;
    public registerCommandsIn(path: string): Registry;
    public registerCommands(commands: Command[]): Registry;
  }

  export class Result {
    public success: boolean;
    public command: Command;
    public commandError: CommandError;
    public errorReason: string;
    constructor(options: ResultOptions);
  }

  export class TypeReader {
    private static validateTypeReader(typeReader: TypeReader, name: string): void;
    public type: string;
    constructor(options: TypeReaderOptions);
    public read(command: Command, message: Message, argument: Argument, input: string): Promise<TypeReaderResult>;
  }

  export class TypeReaderResult extends Result {
    public static fromSuccess(value: any): TypeReaderResult;
    public static fromError(command: Command, reason: string): TypeReaderResult;
    private constructor(options: TypeReaderResultOptions);
  }

  interface ArgumentOptions {
    name: string;
    key: string;
    type: string;
    example: string;
    argumentDefault: any;
    infinite: boolean;
    remainder: boolean;
    preconditions: ArgumentPrecondition[];
  }

  interface CommandOptions {
    names: string[];
    groupName: string;
    description: string;
    guildOnly: boolean;
    userPermissions: string[];
    botPermissions: string[];
    preconditions: Precondition[];
    args: Argument[];
    coooldown: number;
  }

  interface CooldownResultOptions extends ResultOptions {
    cooldown: number;
    remaining: number;
  }

  interface ExceptionResultOptions extends ResultOptions {
    error: Error;
  }

  interface GroupOptions {
    name: string;
    description: string;
    preconditions: Precondition[];
  }

  interface ResultOptions {
    success: boolean;
    command: Command;
    commandError: CommandError;
    errorReason: string;
  }

  interface TypeReaderOptions {
    type: string;
  }

  interface TypeReaderResultOptions extends ResultOptions {
    value: any;
  }
}
