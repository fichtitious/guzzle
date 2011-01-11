if (typeof module !== 'undefined') {

    exports.Puzzle = Puzzle;
    exports.Slot = Slot;
    exports.Cell = Cell;
    var _ = require('./lib/underscore-min');

}

function Puzzle (json) {

    this.size;
    this.grid;
    this.slots;

    if (json !== undefined) {

        this.size = json.size;

        this.grid = new Array(this.size);
        for (rowIdx = 0; rowIdx < this.size; rowIdx++) {
            this.grid[rowIdx] = new Array(this.size);
            for (colIdx = 0; colIdx < this.size; colIdx++) {
                var cellJSON = json.grid[rowIdx][colIdx];
                this.grid[rowIdx][colIdx] = new Cell(cellJSON.rowIdx, cellJSON.colIdx, cellJSON.isBlack, cellJSON.letter, cellJSON.number);
            }
        }

        this.slots = json.slots.map(function (slotJSON) {
            return new Slot(slotJSON.startCoord, slotJSON.size, slotJSON.isAcross);
        });

    }

}

function Slot (startCoord, size, isAcross) {

    this.startCoord = startCoord;
    this.size = size;
    this.isAcross = isAcross;

    this.coords = [];
    for (i = 0; i < this.size; i++) {
        this.coords.push([this.startCoord[0] + (this.isAcross ? 0 : i),
                          this.startCoord[1] + (this.isAcross ? i : 0)]);
    }

    this.indexOfCell = function (cell) {
        for (i = 0; i < this.size; i++) {
            if (_.isEqual([cell.rowIdx, cell.colIdx], this.coords[i])) {
                return i;
            }
        }
        return -1;
    };

    this.getQueryPattern = function (grid) {
        return this.coords.map(function (coord) {
            var cell = grid[coord[0]][coord[1]];
            return cell.letter === null ? '_' : cell.letter;
        }).join('');
    };

    this.fillIn = function (word, grid) {
        var letters = word.split('');
        for (i = 0; i < this.size; i++) {
            var coord = this.coords[i];
            var cell = grid[coord[0]][coord[1]];
            if (cell.letter === null) {
                cell.letter = letters[i];
            }
        }
    };

}

function Cell (rowIdx, colIdx, isBlack, letter, number) {

    this.rowIdx = rowIdx;
    this.colIdx = colIdx;
    this.isBlack = isBlack;
    this.letter = letter;
    this.number = number;

}
