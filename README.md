guzzle
======

A not-yet-functional webapp for authoring crossword puzzles.

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

  * sanitize inputs (ooop)
  * faster handling of inspecific crossWords requests (mainly all-wildcard requests)
  * let you write clues + save puzzle (auth?)
  * export saved puzzles in useful formats
  * finish fillservice
  * clear-all button
  * let you add words to dictionary
  * let you rate words
  * pull wikipedia entries to help with clue-writing
  * let you declare difficulty of puzzle on saving it
  * autosave your work to local storage
  * don't allow islands
  * nice wrapper for pg access + exception handling
  * share methods across backend and frontend (indexOfCell(), etc.)
  * more words
  * let you solve someone else's puzzles
