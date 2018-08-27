#!/usr/bin/env node
'use strict';
const meow = require('meow');
const updateNotifier = require('update-notifier');
const help = require('./lib/help');
const pkg = require('./package.json');
const taskbook = require('./index');

const cli = meow(help, {
  flags: {
    help: {
      type: 'boolean',
      alias: 'h'
    },
    version: {
      type: 'boolean',
      alias: 'v'
    },
    archive: {
      type: 'boolean',
      alias: 'a'
    },
    restore: {
      type: 'boolean',
      alias: 'r'
    },
    task: {
      type: 'boolean',
      alias: 't'
    },
    note: {
      type: 'boolean',
      alias: 'n'
    },
    delete: {
      type: 'boolean',
      alias: 'd'
    },
    check: {
      type: 'boolean',
      alias: 'c'
    },
    star: {
      type: 'boolean',
      alias: 's'
    },
    timeline: {
      type: 'boolean',
      alias: 'i'
    },
    priority: {
      type: 'boolean',
      alias: 'p'
    },
    find: {
      type: 'boolean',
      alias: 'f'
    },
    list: {
      type: 'boolean',
      alias: 'l'
    },
    edit: {
      type: 'boolean',
      alias: 'e'
    },
    rename: {
      type: 'boolean',
      alias: 'z'
    },
    move: {
      type: 'boolean',
      alias: 'm'
    },
    clean: {
      type: 'boolean',
      alias: 'y'
    },
    before: {
      type: 'boolean',
      alias: 'x'
    },
    after: {
      type: 'boolean',
      alias: 'w'
    },
    category: {
      type: 'boolean',
      alias: 'b'
    },
    export: {
      type: 'boolean',
      alias: 'q'
    },
    import: {
      type: 'boolean',
      alias: 'o'
    }

  }
});

updateNotifier({pkg}).notify();

taskbook(cli.input, cli.flags);
