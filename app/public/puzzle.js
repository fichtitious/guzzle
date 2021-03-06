if (typeof module !== 'undefined') {

    exports.Puzzle = Puzzle;
    exports.Slot = Slot;
    exports.Cell = Cell;
    var _ = require('./lib/underscore-min');

}

function Puzzle (json) {

    this.id;
    this.size;
    this.grid;
    this.slots;

    if (json !== undefined) {

        this.id = json.id;
        this.size = json.size;

        this.grid = new Array(this.size);
        for (rowIdx = 0; rowIdx < this.size; rowIdx++) {
            this.grid[rowIdx] = new Array(this.size);
            for (colIdx = 0; colIdx < this.size; colIdx++) {
                var cellJSON = json.grid[rowIdx][colIdx];
                this.grid[rowIdx][colIdx] = new Cell(cellJSON.rowIdx, cellJSON.colIdx, cellJSON.isBlack, cellJSON.letter);
            }
        }

        this.slots = json.slots.map(function (slotJSON) {
            return new Slot(slotJSON.startCoord, slotJSON.size, slotJSON.isAcross, slotJSON.number, slotJSON.clue, slotJSON.coords);
        });

    }

    this.slotContaining = function (cell, isAcross) {
        return this.slots.filter(function (slot) {
            return slot.indexOfCell(cell) != -1 && slot.isAcross == isAcross;
        })[0];
    }

    this.getQueryPattern = function (slot) {
        var self = this;
        return slot.coords.map(function (coord) {
            var cell = self.grid[coord[0]][coord[1]];
            return cell.letter === null ? '_' : cell.letter;
        }).join('');
    };

}

function Slot (startCoord, size, isAcross, number, clue, coords) {

    this.startCoord = startCoord;
    this.size = size;
    this.isAcross = isAcross;
    this.number = number;
    this.clue = clue;
    this.coords = coords;

    if (coords === null) {
        this.coords = [];
        for (i = 0; i < this.size; i++) {
            this.coords.push([this.startCoord[0] + (this.isAcross ? 0 : i),
                              this.startCoord[1] + (this.isAcross ? i : 0)]);
        }
    }

    this.indexOfCell = function (cell) {
        for (i = 0; i < this.size; i++) {
            if (_.isEqual([cell.rowIdx, cell.colIdx], this.coords[i])) {
                return i;
            }
        }
        return -1;
    };

}

function Cell (rowIdx, colIdx, isBlack, letter) {

    this.rowIdx = rowIdx;
    this.colIdx = colIdx;
    this.isBlack = isBlack;
    this.letter = letter;

}
