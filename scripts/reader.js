exports.FileReader = FileReader;

var fs = require('fs'),
    EOF = -1,
    BUFFER_SIZE = 512;

function FileReader (filename) {

    var buffer = '';
    var position = 0;
    var file = fs.openSync(filename, 'r');
    position = fillBuffer(0);

    function fillBuffer () {
        var newString = fs.readSync(file, BUFFER_SIZE, position, 'utf-8');
        buffer += newString[0];
        return (newString[1] == 0) ? EOF : position + newString[1];
    };

    function hasNext () {
        while (buffer.indexOf('\n') == -1) {
            position = fillBuffer(position);
            if (position == EOF) {
                return false;
            }
        }
        return buffer.indexOf('\n') > -1;
    };

    function readLine () {
        var lineEndIdx = buffer.indexOf('\n');
        var line = buffer.substring(0, lineEndIdx);
        buffer = buffer.substring(line.length+1, buffer.length);
        return line;
    };

    return {hasNext : hasNext,
            readLine : readLine};

};
