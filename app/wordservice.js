exports.matchWord = matchWord;
exports.matchWords = matchWords;
exports.crossWords = crossWords;
exports.areTheseWords = areTheseWords;

var pg = require('pg'),
    dburl = 'pg://guzzle@localhost:5432/guzzle';

function matchWord (pattern, callback) {

    pg.connect(dburl, function (error, client) {
        client.query("SELECT word FROM words.word WHERE " + lenEqualsAndPatternLike(pattern) + " ORDER BY random()", function (error, result) {
            if (error) {
                return callback(error);
            }
            return callback(result.rows.map(function (row) {return row.word}));
        });
    });

}

function matchWords (patterns, callback) {

    var query = patterns.map(function (pattern) {
        return "SELECT word, '" + pattern + "' AS pattern FROM words.word WHERE " + lenEqualsAndPatternLike(pattern);
    }).join("\nUNION ");
    console.log(query);

    pg.connect(dburl, function (error, client) {
        client.query(query, function (error, result) {
            var patternsToMatches = {};
            patterns.forEach(function (pattern) { patternsToMatches[pattern] = [] });
            result.rows.forEach(function (row) { patternsToMatches[row.pattern].push(row.word) });
            callback(patternsToMatches);
        });
    });

}

function areTheseWords (patterns, callback) {

    var query = patterns.map(function (pattern) {
        return "SELECT 1 FROM words.word WHERE word = '" + pattern + "'";
    }).join("\nUNION ALL ");

    pg.connect(dburl, function (error, client) {
        client.query(query, function (error, result) {
            callback(result.rows.length == patterns.length);
        });
    });

}

function crossWords (patternA, patternB, intersectIdxA, intersectIdxB, randomize, callback) {

    console.log('crossWords() for ' + patternA + ' and ' + patternB + ' (' + intersectIdxA + ', ' + intersectIdxB + ')');

    pg.connect(dburl, function (error, client) {
        client.query("WITH wordA AS (SELECT word FROM words.word WHERE " + lenEqualsAndPatternLike(patternA) + ")," +
                     "     wordB AS (SELECT word FROM words.word WHERE " + lenEqualsAndPatternLike(patternB) + ") " +
                     "SELECT wordA.word AS wa, wordB.word AS wb " +
                     "FROM wordA JOIN wordB on SUBSTRING (wordA.word FROM " + intersectIdxA+1 + " FOR 1) = SUBSTRING (wordB.word FROM " + intersectIdxB+1 + " FOR 1) " +
                     (randomize ? "ORDER BY random() " : "") +
                     "LIMIT 1", function (error, result) {
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

function lenEqualsAndPatternLike (pattern) {
    var len = " word.len = " + pattern.length;
    var like = pattern.split('').every(function (l) {return l == '_'}) ? " " : " AND word like '" + pattern + "'";
    return len + like;
}
