exports.fill = fill;

var _ = require('./public/lib/underscore-min'),
    wordservice = require('./wordservice'),
    puz = require('./puzzle');

function randomMember (array) {
    return array[Math.floor(Math.random()*array.length)];
}

function fill (puzzle, callback) {

    var firstSlot = randomMember(puzzle.slots);
    wordservice.matchWord(firstSlot.getQueryPattern(puzzle.grid), function (matches) {
        firstSlot.fillIn(randomMember(matches), puzzle.grid);
        fillRecursive(puzzle, function (completedPuzzle) {
            wordservice.areTheseWords(puzzle.slots.map(function (slot) {return slot.getQueryPattern(puzzle.grid)}), function (theyAre) {
                if (theyAre) {
                    callback(completedPuzzle);
                } else {
                    fill(new puz.Puzzle(puzzle.size), callback);
                }
            });
        });
    });

}

function fillRecursive (puzzle, callback) {

    var slotsToFill = puzzle.slots.filter(function (slot) {
        var letters = slot.getQueryPattern(puzzle.grid).split('');
        return letters.some(function (l) {return l == '_'}) && letters.some(function (l) {return l != '_'});
    });
    if (slotsToFill.length == 0) {
        callback(puzzle);
    } else {
        wordservice.matchWords(_.uniq(slotsToFill.map(function (slot) {return slot.getQueryPattern(puzzle.grid)})), function (patternsToMatches) {
            slotsToFill.sort(function (slotA, slotB) {
                var matchesA = patternsToMatches[slotA.getQueryPattern(puzzle.grid)];
                var matchesB = patternsToMatches[slotB.getQueryPattern(puzzle.grid)];
                return matchesA.length > matchesB.length ? 1 : -1;
            });
            var mostConstrainedSlot = slotsToFill[0];
            var matchOptions = patternsToMatches[mostConstrainedSlot.getQueryPattern(puzzle.grid)];
            if (matchOptions.length > 0) {
                mostConstrainedSlot.fillIn(mostCompatible(matchOptions), puzzle.grid);
                fillRecursive(puzzle, callback);
            } else {
                callback(puzzle);
            }
        });
    }

}

function mostCompatible (words) {

    return words.sort(function (wordA, wordB) {
        return compatibility(wordA) < compatibility(wordB) ? 1 : -1;
    })[0];

    function compatibility (word) {
        return word.split('').filter(function (l) {return _.contains(['a', 'e', 'i', 'o', 'u'], l)}).length / word.length;
    }

}
