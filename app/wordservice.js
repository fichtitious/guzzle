exports.word = word;

var pg = require('pg'),
    dburl = 'pg://guzzle@localhost:5432/guzzle';

function word (len, callback) {

    pg.connect(dburl, function (error, client) {
        client.query('SELECT word FROM words.word WHERE len = $1 ORDER BY random() LIMIT 1', [len], function (error, result) {
            if (error) {
                return callback(error);
            }
            try {
                return callback(result.rows[0].word);
            } catch (e) {
                return callback(e);
            }
        });
    });

}
