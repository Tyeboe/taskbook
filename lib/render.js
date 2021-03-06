'use strict';
const chalk = require('chalk');
const signale = require('signale');
const config = require('./config');
const util = require('util');

var error, log, note, pending, success, sig, options;

var starredItemSymbol;

const { blue, green, grey, magenta, red, underline, yellow } = chalk;

const priorities = { 2: 'yellow', 3: 'red' };

class Render {
  constructor() {
    let config = this._configuration;
    priorities[2] = config.priorities["2"];
    priorities[3] = config.priorities["3"];
    options = Object.assign({}, config.signaleOptions);

    sig = new signale.Signale(options)
    sig.config({ displayLabel: false });
    error = sig.error;
    note = sig.note;
    log = sig.log;
    pending = sig.pending;
    success = sig.success;
    starredItemSymbol = config.starredItemSymbol;
  }

  get _configuration() {
    return config.get();
  }

  _colorBoards(boards) {
    return boards.map(x => grey(x)).join(' ');
  }

  _isBoardComplete(items) {
    const { tasks, complete, notes } = this._getItemStats(items);
    return tasks === complete && notes === 0;
  }

  _getAge(birthday) {
    const daytime = 24 * 60 * 60 * 1000;
    const age = Math.round(Math.abs((birthday - Date.now()) / daytime));
    return (age === 0) ? '' : grey(`${age}d`);
  }

  _getCorrelation(items) {
    const { tasks, complete } = this._getItemStats(items);
    return grey(`[${complete}/${tasks}]`);
  }

  _getItemStats(items) {
    let [tasks, complete, notes] = [0, 0, 0];

    items.forEach(item => {
      if (item._isTask) {
        tasks++;
        if (item.isComplete) {
          return complete++;
        }
      }
      return notes++;
    });

    return { tasks, complete, notes };
  }

  _getStar(item) {
    return item.isStarred ? yellow(starredItemSymbol) : '';
  }

  _buildTitle(key, items) {
    const title = (key === new Date().toDateString()) ? `${underline(key)} ${grey('[Today]')}` : underline(key);
    const correlation = this._getCorrelation(items);
    return { title, correlation };
  }

  _buildPrefix(item) {
    const prefix = [];

    const { _id } = item;
    prefix.push(' '.repeat(4 - String(_id).length));
    prefix.push(grey(`${_id}.`));

    return prefix.join(' ');
  }

  _buildMessage(item) {
    const message = [];

    const { isComplete, description, dueDate } = item;
    const priority = parseInt(item.priority, 10);

    if (!isComplete && priority > 1) {
      message.push(underline[priorities[priority]](description));
    } else {
      message.push(isComplete ? grey(description) : description);
    }

    if (!isComplete && priority > 1) {
      message.push(priority === 2 ? chalk[priorities[priority]]('(!)') : chalk[priorities[priority]]('(!!)'));
    }

    if (dueDate) {
      let date = new Date(dueDate);
      let dateString = util.format("Due:(%s/%s/%s)", date.getMonth(), date.getDate(), date.getFullYear());
      message.push(date > Date.now() ? green(dateString) : red(dateString));
    }

    return message.join(' ');
  }

  _displayNote(msgObj, item){
    const badge = sig._types.note.badge;
    if(new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$").test(item.category[1])){
      sig._types.note.badge = chalk.hex(item.category[1])(sig._types.note.badge);
    }
    
    note(msgObj);
    sig._types.note.badge = badge;
  }

  _displayTitle(board, items) {
    const { title: message, correlation: suffix } = this._buildTitle(board, items);
    const titleObj = { prefix: '\n ', message, suffix };
    return log(titleObj);
  }

  _displayItemByBoard(item) {
    const { _isTask, isComplete } = item;
    const age = this._getAge(item._timestamp);
    const star = this._getStar(item);

    const prefix = this._buildPrefix(item);
    const message = this._buildMessage(item);
    const suffix = (age.length === 0) ? star : `${age} ${star}`;

    const msgObj = { prefix, message, suffix };

    if (_isTask) {
      return isComplete ? success(msgObj) : pending(msgObj);
    }
    return this._displayNote(msgObj,item);
  }

  _displayItemByDate(item) {
    const { _isTask, isComplete } = item;
    const boards = item.boards.filter(x => x !== 'My Board');
    const star = this._getStar(item);

    const prefix = this._buildPrefix(item);
    const message = this._buildMessage(item);
    const suffix = `${this._colorBoards(boards)} ${star}`;

    const msgObj = { prefix, message, suffix };

    if (_isTask) {
      return isComplete ? success(msgObj) : pending(msgObj);
    }
    return this._displayNote(msgObj,item);
  }

  displayByBoard(data) {
    Object.entries(data).forEach(([board, items]) => {
      if (this._isBoardComplete(items) && !this._configuration.displayCompleteTasks) {
        return;
      }
      this._displayTitle(board, items);
      items.forEach(item => {
        if (item._isTask && item.isComplete && !this._configuration.displayCompleteTasks) {
          return;
        }
        this._displayItemByBoard(item);
      });
    });
  }

  displayByDate(data) {
    Object.entries(data).forEach(([date, items]) => {
      if (this._isBoardComplete(items) && !this._configuration.displayCompleteTasks) {
        return;
      }
      this._displayTitle(date, items);
      items.forEach(item => {
        if (item._isTask && item.isComplete && !this._configuration.displayCompleteTasks) {
          return;
        }
        this._displayItemByDate(item);
      });
    });
  }



  displayStats({ percent, complete, pending, notes }) {
    if (!this._configuration.displayProgressOverview) {
      return;
    }

    percent = percent >= 75 ? green(`${percent}%`) : percent >= 50 ? yellow(`${percent}%`) : `${percent}%`;

    const status = [
      `${chalk[sig._types.success.color](complete)} ${grey('done')}`,
      `${chalk[sig._types.pending.color](pending)} ${grey('pending')}`
    ];

    if (complete !== 0 && pending === 0 && notes === 0) {
      log({ prefix: '\n ', message: 'All done!', suffix: yellow(starredItemSymbol) });
    }

    if (pending + complete + notes === 0) {
      log({ prefix: '\n ', message: 'Type `tb --help` to get started!', suffix: yellow(starredItemSymbol) });
    }

    log({prefix: '\n ', message: grey(`${percent} of all tasks complete.`)});

    let cats = []
    let catTotal = {};
    let catColors = {};
   if(notes.length != 0){
    notes.forEach(x => {
      let catName = x.category[0];
      let catColor = x.category[1];
      catTotal[catName]++;
      if(isNaN(catTotal[catName])){
        cats.push(catName);
        catTotal[catName] = 1;
        catColors[catName] = catColor;
      }
    });
    cats.forEach(x => {
      let catCount = catTotal[x];
      let catColor = null;
      if(new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$").test(catColors[x]) && x != "notes"){
        catColor = catColors[x];
        status.push(`${chalk.hex(catColor)(catCount)} ${grey(x)}`);
      }
      else {
        catColor = sig._types.note.color;
        status.push(`${chalk[catColor](catCount)} ${grey(x)}`);
      }
    });
   }
   else {
     status.push(`${chalk[sig._types.note.color](0)} ${grey('notes')}`)
   }

    log({prefix: ' ', message: status.join(grey(' · ')), suffix: '\n'});
  }

  invalidCustomAppDir(path) {
    const [prefix, suffix] = ['\n', red(path)];
    const message = `Custom app directory was not found on your system:`;
    error({ prefix, message, suffix });
  }

  invalidID(id) {
    const [prefix, suffix] = ['\n', grey(id)];
    const message = 'Unable to find item with id:';
    error({ prefix, message, suffix });
  }

  invalidBoardArgumentNumber(number) {
    const [prefix, suffix] = ['\n', grey(number)];
    const message = 'Incorrect number of board names were given as input';
    error({ prefix, message, suffix });
  }

  invalidIDsNumber() {
    const prefix = '\n';
    const message = 'More than one ids were given as input';
    error({ prefix, message });
  }

  noFileSpecified() {
    const prefix = '\n';
    const message = 'No path was specified';
    error({ prefix, message });
  }

  graph(graphs) {

    let colors = [blue, green, magenta, yellow, red];
    let index = 0;

    graphs.forEach((graph) => {
      let board = Object.keys(graph)[0];
      let prefix = board 
      if(prefix.length < 10)  {
        prefix += ' '.repeat(10 - board.length);
      }
      let bar = 'X'.repeat(graph[board].stats.percent / 5);
      let message = colors[(index += 1) % colors.length](bar) + ' '.repeat(20 - bar.length);
      let suffix = graph[board].stats.percent + "%";
      console.log(prefix, message, suffix);
    });
   
  }

  toManyFilePathsSpecified(number) {
    const prefix = '\n';
    const message = 'Too many paths specified';
    const suffix = number;
    error({ prefix, message, suffix });
  }

  importFailed(path) {
    const prefix = '\n';
    const message = 'Import Failed';
    const suffix = path;
    error({ prefix, message, suffix });
  }

  exportFailed(path) {
    const prefix = '\n';
    const message = 'Export Failed';
    const suffix = path;
    error({ prefix, message, suffix });
  }

  successImport(path) {
    const prefix = '\n';
    const message = 'Import Successful';
    const suffix = path;
    success({ prefix, message, suffix });
  }

  successExport(path) {
    const prefix = '\n';
    const message = 'Export Successful';
    const suffix = path;
    success({ prefix, message, suffix });
  }

  invalidRangeSpecification(badRange) {
    const prefix = '\n';
    const message = "Bad Range";
    const suffix = grey(badRange);
    error({ prefix, message, suffix });
  }

  invalidPriority() {
    const prefix = '\n';
    const message = 'Priority can only be 1, 2 or 3';
    error({ prefix, message });
  }

  markComplete(ids) {
    const [prefix, suffix] = ['\n', grey(ids.join(', '))];
    const message = `Checked ${ids.length > 1 ? 'tasks' : 'task'}:`;
    success({ prefix, message, suffix });
  }

  markStarred(ids) {
    const [prefix, suffix] = ['\n', grey(ids.join(', '))];
    const message = `Starred ${ids.length > 1 ? 'items' : 'item'}:`;
    success({ prefix, message, suffix });
  }

  missingBoards() {
    const prefix = '\n';
    const message = 'No boards were given as input';
    error({ prefix, message });
  }

  invalidBoardName(name) {
    const [prefix, suffix] = ['\n', grey(name)];
    const message = 'Specified board does not exist';
    error({ prefix, message, suffix });
  }

  missingDesc() {
    const prefix = '\n';
    const message = 'No description was given as input';
    error({ prefix, message });
  }

  missingID() {
    const prefix = '\n';
    const message = 'No id was given as input';
    error({ prefix, message });
  }

  successCreate({ _id, _isTask }) {
    const [prefix, suffix] = ['\n', grey(_id)];
    const message = `Created ${_isTask ? 'task:' : 'note:'}`;
    success({ prefix, message, suffix });
  }
  successCreateCat(name, color){
    let [prefix, suffix] = ['\n', ''];
    const message = `Created category: ${name}`
    if(new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$").test(color) && name != "notes"){
      suffix = chalk.hex(color)('*');
    }
    else {
      suffix = chalk[sig._types.note.color]('*');
    }
    success({prefix, message, suffix})
  }

  successEdit(id) {
    const [prefix, suffix] = ['\n', grey(id)];
    const message = 'Updated description of item:';
    success({ prefix, message, suffix });
  }
  successEditCat(name, color){
    let [prefix, suffix] = ['\n', ''];
    const message = `Modified category: ${name}`
    if(new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$").test(color) && name != "notes"){
      suffix = chalk.hex(color)('*');
    }
    else {
      suffix = chalk[sig._types.note.color]('*');
    }
    success({prefix, message, suffix})
  }

  successDelete(ids) {
    const [prefix, suffix] = ['\n', grey(ids.join(', '))];
    const message = `Deleted ${ids.length > 1 ? 'items' : 'item'}:`;
    success({ prefix, message, suffix });
  }

  successMove(id, boards) {
    const [prefix, suffix] = ['\n', grey(boards.join(', '))];
    const message = `Move item: ${grey(id)} to`;
    success({ prefix, message, suffix });
  }

  successPriority(id, level) {
    const prefix = '\n';
    const message = `Updated priority of task: ${grey(id)} to`;
    const suffix = level === '3' ? red('high') : (level === '2' ? yellow('medium') : green('normal'));
    success({ prefix, message, suffix });
  }

  successRestore(ids) {
    const [prefix, suffix] = ['\n', grey(ids.join(', '))];
    const message = `Restored ${ids.length > 1 ? 'items' : 'item'}:`;
    success({ prefix, message, suffix });
  }
}

module.exports = new Render();
