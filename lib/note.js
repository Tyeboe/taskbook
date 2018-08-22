'use strict';
const Item = require('./item');

class Note extends Item {
  constructor(options = {}) {
    super(options);
    this._isTask = false;
    this.category = options.category;
    if(this.category.length == 0){
      this.category = ["notes", "#0000ff"];
    }
  }
}

module.exports = Note;
