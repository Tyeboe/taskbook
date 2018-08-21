'use strict';

module.exports = `
  Usage
    $ tb [<options> ...]

    Options
        none             Display board view
      --task, -t         Create task
      --note, -n         Create note
      --timeline, -i     Display timeline view
      --delete, -d       Delete item
      --clean, -y        Deletes checked items
      --check, -c        Check/uncheck task
      --star, -s         Star/unstar item
      --list, -l         List items by attributes
      --find, -f         Search for items
      --edit, -e         Edit item description
      --move, -m         Move item between boards
      --rename, -z       Moves all items from one board to another
      --priority, -p     Update priority of task
      --archive, -a      Display archived items
      --restore, -r      Restore items from archive
      --help, -h         Display help message
      --version, -v      Display installed version

    Examples
      $ tb
      $ tb --task Make some buttercream
      $ tb --task @coding Improve documentation
      $ tb --task @coding Improve documentation due:1/23/18
      $ tb --task @coding @reviews Review PR #42
      $ tb --task @coding Complete task 1 | Complete task 2 | Complete task 3
      $ tb --note @coding Mergesort worse-case O(nlogn)
      $ tb --check 1 2
      $ tb --delete 4
      $ tb --clean @coding @reviews
      $ tb --star 2
      $ tb --priority @3 2
      $ tb --timeline
      $ tb --edit @3 Merge PR #42
      $ tb --move @1 cooking
      $ tb --rename @coding cooking
      $ tb --find documentation
      $ tb --list pending coding
      $ tb --archive
      $ tb --restore 4
`;
