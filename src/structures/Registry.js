const path = require('path');
const requireAll = require('require-all');
const Command = require('./Command.js');
const Group = require('./Group.js');
const TypeReader = require('./TypeReader.js');

/**
 * A registry containing all commands, groups and type readers.
 * @prop {Command[]} commands All registered commands.
 * @prop {Group[]} groups All registered groups.
 * @prop {TypeReader[]} typeReaders All registered type readers.
 */
class Registry {
  constructor() {
    this.commands = [];
    this.groups = [];
    this.typeReaders = [];
  }

  /**
   * Registers all default type readers.
   * @returns {Registry} The registry being used.
   */
  registerDefaultTypeReaders() {
    return this.registerTypeReadersIn(path.join(__dirname, '/../readers'));
  }

  /**
   * Registers all type readers in a specific directory.
   * @param {string} path The path containing the type readers to be registered.
   * @returns {Registry} The registry being used.
   */
  registerTypeReadersIn(path) {
    const obj = requireAll(path);
    const typeReaders = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key) === true) {
        typeReaders.push(obj[key]);
      }
    }

    return this.registerTypeReaders(typeReaders);
  }

  /**
   * Registers an array of type readers.
   * @param {TypeReader[]} typeReaders An array of type readers to register.
   * @returns {Registry} The registry being used.
   */
  registerTypeReaders(typeReaders) {
    if (Array.isArray(typeReaders) === false) {
      throw new TypeError('TypeReaders must be an array.');
    }

    for (let i = 0; i < typeReaders.length; i++) {
      if (typeof typeReaders[i] !== 'object') {
        throw new TypeError('All type reader exports must be an instance of the type reader.');
      } else if ((typeReaders[i] instanceof TypeReader) === false) {
        throw new Error('All type readers must be inherit the TypeReader class.');
      } else if (this.typeReaders.some((v) => v.type === typeReaders[i].type)) {
        throw new Error('The ' + typeReaders[i].type + ' type reader already exists.');
      }

      this.typeReaders.push(typeReaders[i]);
    }

    return this;
  }

  /**
   * Registers all groups in a specific directory.
   * @param {string} path The path containing the groups to be registered.
   * @returns {Registry} The registry being used.
   */
  registerGroupsIn(path) {
    const obj = requireAll(path);
    const groups = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key) === true) {
        groups.push(obj[key]);
      }
    }

    return this.registerGroups(groups);
  }

  /**
   * Registers an array of groups.
   * @param {Group[]} groups An array of groups to be registered.
   * @returns {Registry} The registry being used.
   */
  registerGroups(groups) {
    if (Array.isArray(groups) === false) {
      throw new TypeError('Groups must be an array.');
    }

    for (let i = 0; i < groups.length; i ++) {
      if (typeof groups[i] !== 'object') {
        throw new TypeError('All group exports must be an instance of the group.');
      } else if ((groups[i] instanceof Group) === false) {
        throw new Error('All groups must inherit the Group class.');
      } else if (this.groups.some((v) => v.name === groups[i].name) === true) {
        throw new Error('The ' + groups[i].name + ' group already exists.');
      }

      this.groups.push(groups[i]);
    }

    return this;
  }

  /**
   * Registers all commands in a specific directory.
   * @param {string} path The path containing the commands to be registered.
   * @returns {Registry} The registry being used.
   */
  registerCommandsIn(path) {
    const obj = requireAll(path);
    const commands = [];

    for (const groupKey in obj) {
      if (obj.hasOwnProperty(groupKey) === true) {
        for (const commandKey in obj[groupKey]) {
          if (obj[groupKey].hasOwnProperty(commandKey) === true) {
            commands.push(obj[groupKey][commandKey]);
          }
        }
      }
    }

    return this.registerCommands(commands);
  }

  /**
   * Registers an array of commands.
   * @param {Command[]} commands An array of commands to register.
   * @returns {Registry} The registry being used.
   */
  registerCommands(commands) {
    if (Array.isArray(commands) === false) {
      throw new TypeError('Commands must be an array.');
    }

    for (let i = 0; i < commands.length; i ++) {
      if (typeof commands[i] === 'string') {
        throw new Error('All commands must be placed inside a respective folder of their group inside the main commands folder.');
      } else if (typeof commands[i] !== 'object') {
        throw new TypeError('All command exports must be an instance of the command.');
      } else if ((commands[i] instanceof Command) === false) {
        throw new Error('All commands must inherit the Command class.');
      }

      for (let j = 0; j < commands[i].names.length; j++) {
        if (this.commands.some((x) => x.names.some((y) => y === commands[i].names[j])) === true) {
          throw new Error('A command with the name ' + commands[i].names[j] + ' is already registered.');
        }
      }

      for (let j = 0; j < commands[i].args.length; j++) {
        const typeReader = this.typeReaders.find((x) => x.type === commands[i].args[j].type);

        if (typeReader === undefined) {
          throw new Error('The ' + commands[i].args[j].type + ' type does not exist.');
        }

        commands[i].args[j].typeReader = typeReader;
      }

      const groupIndex = this.groups.findIndex((v) => v.name === commands[i].groupName);

      if (groupIndex === -1) {
        throw new Error('The ' + commands[i].groupName + ' group is not registered.');
      }

      commands[i].group = this.groups[groupIndex];
      this.groups[groupIndex].commands.push(commands[i]);
      this.commands.push(commands[i]);
    }

    return this;
  }
}

module.exports = Registry;
