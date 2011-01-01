var sqlite = require('../app/lib/sqlite/sqlite'),
    terms = require('./terms'),
    reader = require('./reader');

function createdb () {

    var db = new sqlite.Database();

    db.open("words.db", function (error) {

        if (error) {
            throw error;
        }

        db.executeScript(

            "create table word(word TEXT UNIQUE, len INTEGER)", function () {

                var phrases = reader.FileReader('phrases.short');
                while (phrases.hasNext()) {
                    terms.extractTerms(phrases.readLine()).forEach(function (term) {
                        db.execute('insert into word ( "word" , "len" ) values ( ? , ? )', [term, term.length], function (error) {
                            console.log('inserting ' + term);
                            if (error) {
                                console.log(error);
                            }
                        });
                    });
                }
            }
        );
    });

}

createdb();
