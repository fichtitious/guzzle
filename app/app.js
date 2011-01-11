var express = require('express'),
    puzzleservice = require('./puzzleservice'),
    gridservice = require('./gridservice'),
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

app.post('/matchWord', function (req, res) {
    wordservice.matchWord(req.body.pattern, function (word) {
        res.send({'word' : word});
    });
});

app.post('/crossWords', function (req, res) {
    wordservice.crossWords(req.body.patternA, req.body.patternB,
            parseInt(req.body.intersectIdxA), parseInt(req.body.intersectIdxB), true /*randomize*/, function (wordA, wordB) {
        res.send({'wordA' : wordA, 'wordB' : wordB});
    });
});

app.post('/newEmptyPuzzle', function (req, res) {
    res.send({'puzzle' : gridservice.newPuzzle(req.body.newPuzzleSize)});
});

app.post('/savePuzzle', function (req, res) {
    puzzleservice.save(req.body.id, req.body.puzzle, function (id, success) {
        res.send({'id' : id, 'success' : success});
    });
});

app.post('/getPuzzle', function (req, res) {
    puzzleservice.get(parseInt(req.body.id), function (puzzle) {
        res.send({'puzzle' : puzzle});
    });
});

app.listen(port);
