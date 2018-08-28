'use strict';
const Item = require('./item');

class Note extends Item {
  constructor(options = {}) {
    super(options);
    this._isTask = false;
    if(options.category.length == 0){
      this.category = ["notes", ""];
    }
    else {
      this.category = options.category;
    }
  }
}

module.exports = Note;
