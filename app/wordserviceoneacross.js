exports.matchWord = matchWord;
exports.matchWords = matchWords;

var pg = require('pg'),
    restler = require('./lib/restler/restler'),
    _ = require('./public/lib/underscore-min'),
    dburl = 'pg://guzzle@localhost:5432/guzzle';

function matchWords (patternA, patternB, intersectIdxA, intersectIdxB, randomize, callback) {

    matchWord(patternA, function (patternAMatches) {
        matchWord(patternB, function (patternBMatches) {
            var matches = []
            patternAMatches.forEach(function (patternAMatch) {
                patternBMatches.forEach(function (patternBMatch) {
                    if (patternAMatch[intersectIdxA] == patternBMatch[intersectIdxB]) {
                        matches.push([patternAMatch, patternBMatch]);
                    }
                });
            });
            if (matches.length > 0) {
                var m = matches[Math.floor(Math.random()*matches.length)];
                return callback(m[0], m[1]);
            } else {
                return callback('', '');
            }
        });
    });

}

function matchWord (pattern, callback) {

    pattern = pattern.toUpperCase();

    pg.connect(dburl, function (error, client) {
        client.query('SELECT match FROM words.oneacrosscache WHERE pattern = $1 ORDER BY random()', [pattern], function (error, result) {
            if (error) {
                return callback(error);
            }
            if (result.rows.length !== 0) {
                console.log('<cache> HIT for ' + pattern);
                return callback(result.rows.map(function (row) {return row.match}));
            } else {
                console.log('<cache> MISS for ' + pattern);
                matchWordLive(pattern, callback);
            }
        });
    });

}

function matchWordLive (pattern, callback) {

    var url = 'http://www.oneacross.com/cgi-bin/search_banner.cgi?p0=' + pattern.replace(/_/g, '?');
    restler.get(url).addListener('complete', function (body) {
        var matches = body.match(/\?w=.*?&/g) || [];
        matches = matches.map(function (candidate) {
            return candidate.substring(3, candidate.length-1);
        }).filter(function (candidate) {return matchesPattern (candidate, pattern)});
        cacheMatches(pattern, matches);
        callback(matches);
    });

}

function cacheMatches (pattern, matches) {

    console.log('caching matches for ' + pattern + ': ' + matches);

    matches.forEach(function (m) {
        pg.connect(dburl, function (error, client) {
            client.query('INSERT INTO words.oneacrosscache (pattern, match) VALUES ($1, $2)', [pattern, m], function () {});
        });
    });

}

function matchesPattern (candidate, pattern) {
    return _.map(candidate.split(''), function (letter, i) {
        return (pattern[i] == '_') ? '_' : letter;
    }).join('') == pattern;
}
