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
    res.send({'puzzle' : new puzzle.Puzzle(req.body.newPuzzleSize)});
});

app.listen(port);
