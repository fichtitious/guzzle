var express = require('express'),
    puzzle = require('./puzzle'),
    app = express.createServer(),
    port = process.argv[2];

app.configure(function (){
    app.use(express.staticProvider(__dirname + '/public'));
    app.use(express.bodyDecoder());
}); 

app.get('/', function (req, res){
    res.render('index.html', {});
});

app.post('/newPuzzle', function (req, res){
    res.send(new puzzle.Puzzle(req.body.newPuzzleSize));
});

app.listen(port);
