exports.randomWord = randomWord;
exports.matchWords = matchWords;

var http = require('http'),
    pg = require('pg'),
    dburl = 'pg://guzzle@localhost:5432/guzzle';

function randomWord (len, callback) {
    var pattern = new Array(parseInt(len)+1).join('_');
    matchWord(pattern, function (matches) {
        return callback(matches[Math.floor(Math.random()*matches.length)]);
    });
}

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
                console.log('cache hit for ' + pattern);
                return callback(result.rows.map(function (row) {return row.match}));
            } else {
                console.log('cache miss for ' + pattern);
                matchWordLive(pattern, callback);
            }
        });
    });

}

function matchWordLive (pattern, callback) {

    try {
        var request = http.createClient(80, 'www.oneacross.com').request('GET',
            '/cgi-bin/search_banner.cgi?p0=' + escapeWildcards(pattern), {'host' : 'www.oneacross.com'});
        request.end();
        request.on('response', function (response) {
            response.setEncoding('utf8');
            var body = '';
            response.on('data', function (chunk) {body += chunk});
            response.on('end', function () {
                var matches = body.match(/\?w=.*?&/g) || [];
                matches = matches.map(function (candidate) {
                    return candidate.substring(3, candidate.length-1);
                }).filter(function (candidate) {return matchesPattern (candidate, pattern)});
                cacheMatches(pattern, matches);
                callback(matches);
            });
        });
    } catch (error) {
        console.log(error);
        callback([]);
    }

}

function cacheMatches (pattern, matches) {

    console.log('caching matches for ' + pattern + ': ' + matches);

    matches.forEach(function (m) {
        pg.connect(dburl, function (error, client) {
            client.query('INSERT INTO words.oneacrosscache (pattern, match) VALUES ($1, $2)', [pattern, m], function () {});
        });
    });

}

function escapeWildcards (pattern) {
    return pattern.replace(/_/g, '?');
}

function matchesPattern (candidate, pattern) {

    if (candidate.length != pattern.length) {
        return false;
    }

    var candidateLetters = candidate.split('');
    var patternLetters = pattern.split('');
    for (i = 0; i < candidateLetters.length; i++) {
        if ((patternLetters[i] != '_') && (patternLetters[i] != candidateLetters[i])) {
            return false;
        }
    }

    return true;
}
