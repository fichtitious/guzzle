var pg = require('pg'),
    terms = require('./terms'),
    reader = require('./reader'),
    fs = require('fs');

function createdb (csvpath) {

    pg.connect('pg://guzzle@localhost:5432/guzzle', function (error, client) {

        if (error) {
            throw error;
        }

        client.on('drain', client.end.bind(client));

        client.query("CREATE TABLE words.word ( word VARCHAR UNIQUE, len SMALLINT )", function (error) {
            if (error && error.message != 'relation "word" already exists') {
                throw error;
            }
            client.query("BEGIN; CREATE TEMP TABLE temp_word as SELECT * from words.word WHERE 1 = 0;" +
                         "COPY temp_word FROM '" + csvpath + "' CSV;" +
                         "INSERT INTO words.word (SELECT DISTINCT word, len FROM temp_word); COMMIT;" +
                         "CREATE INDEX len_idx ON words.word (len);", function (error) {
                if (error) {
                    console.log(error);
                    throw error;
                }
            });

        });

    });

}

function createOneAcrossCacheTable () {

    pg.connect('pg://guzzle@localhost:5432/guzzle', function (error, client) {

        if (error) {
            throw error;
        }

        client.on('drain', client.end.bind(client));

        client.query("CREATE TABLE words.oneacrosscache ( pattern VARCHAR, match VARCHAR )", function (error) {
            if (error && error.message != 'relation "word" already exists') {
                throw error;
            }
            client.query("CREATE INDEX pattern_idx ON words.oneacrosscache (pattern);", function (error) {
                if (error) {
                    console.log(error);
                    throw error;
                }
            });

        });

    });

}

function writecsv (srcname, csvname) {

    var csv = fs.openSync(csvname, 'w');
    var src = reader.FileReader(srcname);
    var position = 0;
    while (src.hasNext()) {
        terms.extractTerms(src.readLine()).forEach( function (term) {
            var csvline = term + ',' + term.length + '\n';
            fs.writeSync(csv, csvline, position);
            position += csvline.length;
        });
    }
    fs.close(csv);

}

if (module.parent === undefined) {
    //writecsv('src.raw', 'src.csv');
    //createdb('/home/dan/dev/guzzle/src.csv');
    createOneAcrossCacheTable();
}
