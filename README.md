guzzle
======

A not-yet-functional webapp for authoring crossword puzzles.  You optionally seed some words, the webapp fills in the rest, you edit the puzzle however you like and write the clues, and the webapp stores your puzzle and offers various kinds of export.

Run
---

    node app/app.js 8000

Dependencies
------------

  * [node.js](http://nodejs.org/#download)
  * [express.js](http://expressjs.com/install.sh)
  * [node-postgres](https://github.com/brianc/node-postgres)

Todo
----

  * let you seed some words (for a themed puzzle)
  * let you change letters
  * let you del/add/move black cells
  * let you add words to the dictionary
  * let you declare difficulty of puzzle on saving it
  * autosave your work to local storage
