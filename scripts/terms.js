exports.extractTerms = extractTerms;

var _ = require('../app/public/lib/underscore-min'),
    assert = require('assert'),
    MIN_TERM_LENGTH = 3;

function extractTerms (phrase) {

    var terms = phrase.toUpperCase()
                        .replace(/[0-9]/g, ' ')
                        .replace(/\|/g, ' ')
                        .replace(/\-/g, ' ')
                        .replace(/\_/g, ' ')
                        .replace(/\$/g, ' ')
                        .replace(/\!/g, ' ')
                        .replace(/\./g, ' ')
                        .replace(/\,/g, ' ')
                        .replace(/\(/g, ' ')
                        .replace(/\)/g, ' ')
                        .replace(/\'/g, ' ')
                        .replace(/\"/g, ' ')
                        .trim()
                        .split(' ')
                        .filter(function (term) {
                            return term.split('').every(function (letter) {
                                return letter >= 'A' && letter <= 'Z';
                            });
                        });

    if (terms.length > 1) {
        terms = [terms.join('')].concat(terms);
    }

    return _.uniq(terms).filter(function (term) {return term.length >= MIN_TERM_LENGTH});

}

(function () {

    [['Jack', ['JACK']],
     ['Jack_Abramoff_Indian_lobbying_scandal', ['JACKABRAMOFFINDIANLOBBYINGSCANDAL', 'JACK', 'ABRAMOFF', 'INDIAN', 'LOBBYING', 'SCANDAL']],
     ['Tom Tom', ['TOMTOM', 'TOM']],
     ['Tom-Tom', ['TOMTOM', 'TOM']],
     ['Star69', ['STAR']],
     ['(1047)_Geisha', ['GEISHA']],
     ["'Abd_Allah_Ibn_Mas'ud", ['ABDALLAHIBNMASUD', 'ABD', 'ALLAH', 'IBN', 'MAS']],
     ['Dojo_kun', ['DOJOKUN', 'DOJO', 'KUN']],
     ['Doktor-Julius-Leber-Straße', ['DOKTORJULIUSLEBERSTRASSE', 'DOKTOR', 'JULIUS', 'LEBER', 'STRASSE']],
     ['Doktor_Schiwago_(1965)', ['DOKTORSCHIWAGO', 'DOKTOR', 'SCHIWAGO']],
     ['!Xóõ', []],
     ['Dokić', []]
    ].forEach(function () {

        var phrase = arguments[0][0];
        var expectedTerms = arguments[0][1];
        var actualTerms = extractTerms(phrase);

        if (module.parent === undefined) {
            console.log(phrase + ' -> ' + actualTerms);
        }

        assert.deepEqual(actualTerms, expectedTerms);

    });

})();
