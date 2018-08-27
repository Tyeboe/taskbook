#!/usr/bin/env node
'use strict';
const taskbook = require('./lib/taskbook');

const taskbookCLI = (input, flags) => {
  if (flags.archive) {
    return taskbook.displayArchive();
  }

  if (flags.task) {
    return taskbook.createTask(input);
  }

  if(flags.graph) {
    return taskbook.graph(input);
  }

  if (flags.restore) {
    return taskbook.restoreItems(input);
  }

  if (flags.note) {
    return taskbook.createNote(input);
  }

  if (flags.delete) {
    return taskbook.deleteItems(input);
  }

  if (flags.check) {
    return taskbook.checkTasks(input);
  }

  if (flags.star) {
    return taskbook.starItems(input);
  }

  if (flags.priority) {
    return taskbook.updatePriority(input);
  }

  if (flags.timeline) {
    taskbook.displayByDate();
    return taskbook.displayStats();
  }

  if (flags.find) {
    return taskbook.findItems(input);
  }

  if (flags.list) {
    taskbook.listByAttributes(input);
    return taskbook.displayStats();
  }

  if (flags.edit) {
    return taskbook.editDescription(input);
  }

  if (flags.move) {
    return taskbook.moveBoards(input);
  }
  if(flags.clean){
    return taskbook.cleanBoards(input);
  }

  if(flags.rename) {
    return taskbook.renameBoard(input);
  }

  if(flags.before) {
    return taskbook.displayItemsBefore(input);
  }

  if(flags.after) {
    return taskbook.displayItemsAfter(input);
  }

  if(flags.import) {
    return taskbook.import(input);
  }

  if(flags.export) {
    return taskbook.export(input);
  }

  taskbook.displayByBoard();
  return taskbook.displayStats();
};

module.exports = taskbookCLI;
