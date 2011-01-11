exports.save = save;
exports.get = get;

var pg = require('pg'),
    dburl = 'pg://guzzle@localhost:5432/guzzle';

function save (id, puzzleJSON, callback) {

    pg.connect(dburl, function (error, client) {

        console.log('saving puzzle with id ' + id);

        if (id === undefined) {
            client.query("INSERT INTO puzzles.puzzle (json) VALUES ($1) RETURNING id;", [puzzleJSON], function (error, result) {
                if (error) {
                    console.log(error);
                    return callback(null, false);
                } else {
                    return callback(result.rows[0].id, true);
                }
            });
        } else {
            client.query("UPDATE puzzles.puzzle SET json = $1 WHERE id = $2", [puzzleJSON, id], function (error, result) {
                return callback(id, error == null);
            });
        }

    });

}

function get (id, callback) {

    pg.connect(dburl, function (error, client) {

        console.log('getting puzzle ' + id);

        client.query("SELECT json FROM puzzles.puzzle WHERE id = $1;", [id], function (error, result) {
            if (error) {
                console.log(error);
                return callback('');
            } else if (result.rows[0]) {
                return callback(result.rows[0].json);
            } else {
                return callback('');
            }
        });

    });

}
