exports.extractTerms = extractTerms;

var _ = require('../app/public/lib/underscore-min');

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
                            })
                        });

    return terms.length > 1 ?
        [terms.join('')].concat(_.uniq(terms))
        : _.uniq(terms);

}

function testExtractTerms () {
    [['Dog', ['DOG']],
     ['Tom Tom', ['TOMTOM', 'TOM']],
     ['Tom-Tom', ['TOMTOM', 'TOM']],
     ['Star69', ['STAR']],
     ['(1047)_Geisha', ['GEISHA']],
     ['Dojo_kun', ['DOJOKUN', 'DOJO', 'KUN']],
     ["'Abd_Allah_Ibn_Mas'ud", ['ABDALLAHIBNMASUD', 'ABD', 'ALLAH', 'IBN', 'MAS', 'UD']],
     ['Doktor-Julius-Leber-Straße', ['DOKTORJULIUSLEBERSTRASSE', 'DOKTOR', 'JULIUS', 'LEBER', 'STRASSE']],
     ['Doktor_Schiwago_(1965)', ['DOKTORSCHIWAGO', 'DOKTOR', 'SCHIWAGO']],
     ['!Xóõ', []],
     ['Dokić', []]
    ].forEach(function () {
        var phrase = arguments[0][0];
        var expectedTerms = arguments[0][1];
        var actualTerms = extractTerms(phrase);
        console.log(phrase + ' -> ' + actualTerms);
        if (!_.isEqual(expectedTerms, actualTerms)) {
            throw 'expected ' + expectedTerms;
        }
    });
}

if (module.parent === undefined) {
    testExtractTerms();
}
