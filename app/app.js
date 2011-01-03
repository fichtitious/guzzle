var express = require('express'),
    puzzle = require('./puzzle'),
    wordservice = require('./wordservice'),
    app = express.createServer(),
    port = process.argv[2];

app.configure(function () {
    app.use(express.staticProvider(__dirname + '/public'));
    app.use(express.bodyDecoder());
}); 

app.get('/', function (req, res) {
    res.render('index.html', {});
});

app.post('/randomWord', function (req, res) {
    wordservice.randomWord(req.body.len, function (word) {
        res.send({'word' : word});
    });
});

app.post('/matchWords', function (req, res) {
    wordservice.matchWords(req.body.patternA, req.body.patternB,
            parseInt(req.body.intersectIdxA), parseInt(req.body.intersectIdxB), true, function (wordA, wordB) {
        res.send({'wordA' : wordA, 'wordB' : wordB});
    });
});

app.post('/newEmptyPuzzle', function (req, res) {
    res.send({'puzzle' : new puzzle.Puzzle(req.body.newPuzzleSize)});
});

app.post('/newFullPuzzle', function (req, res) {
    var p = new puzzle.Puzzle(req.body.newPuzzleSize);
    if (req.body.newPuzzleSize == 8) {
        puzzle.withWords(p, function (puzzleWithWords) {
            res.send({'puzzle' : puzzleWithWords});
        });
    } else {
        res.send({'puzzle' : p});
    }
});

app.listen(port);
