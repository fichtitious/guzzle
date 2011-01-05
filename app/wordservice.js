exports.matchWord = matchWord;
exports.matchWords = matchWords;

var pg = require('pg'),
    dburl = 'pg://guzzle@localhost:5432/guzzle';

function matchWord (pattern, callback) {

    pg.connect(dburl, function (error, client) {
        client.query('SELECT word FROM words.word WHERE word.len = $1 AND word LIKE $2 ORDER BY random()', [pattern.length, pattern], function (error, result) {
            if (error) {
                return callback(error);
            }
            try {
                return callback(result.rows.map(function (row) {return row.word}));
            } catch (e) {
                return callback(e);
            }
        });
    });

}

function matchWords (patternA, patternB, intersectIdxA, intersectIdxB, randomize, callback) {

    console.log('matchWords() for ' + patternA + ' and ' + patternB + ' (' + intersectIdxA + ', ' + intersectIdxB + ')');

    pg.connect(dburl, function (error, client) {
        client.query('WITH wordA AS (SELECT word FROM words.word WHERE word.len = $1 AND word LIKE $2),' +
                     '     wordB AS (SELECT word FROM words.word WHERE word.len = $3 AND word LIKE $4) ' +
                     'SELECT wordA.word AS wa, wordB.word AS wb ' +
                     'FROM wordA JOIN wordB on SUBSTRING (wordA.word FROM $5 FOR 1) = SUBSTRING (wordB.word FROM $6 FOR 1) ' +
                     (randomize ? 'ORDER BY random() ' : '') +
                     'LIMIT 1',
                [patternA.length, patternA, patternB.length, patternB, intersectIdxA+1, intersectIdxB+1], function (error, result) {
            if (error) {
                console.log(error);
                return callback('', '');
            }
            try {
                return callback(result.rows[0].wa, result.rows[0].wb);
            } catch (e) {
                console.log(e);
                return callback('', '');
            }
        });
    });

}
