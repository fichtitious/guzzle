exports.newPuzzle = newPuzzle;

var _ = require('./public/lib/underscore-min'),
    Puzzle = require('./public/puzzle').Puzzle,
    Slot = require('./public/puzzle').Slot,
    Cell = require('./public/puzzle').Cell;

function newPuzzle (size) {

    numAttemptsToGenerate = 0;

    while (true) {
        numAttemptsToGenerate++;
        var grid = createGrid(size);
        var slots = findSlots(grid, size);
        if (isValid(grid, slots, size)) {
            addWordNumbering(grid, slots, size);
            break;
        } else if (numAttemptsToGenerate > 200) {
            break;
        }
    }

    var puzzle = new Puzzle();
    puzzle.size = size;
    puzzle.grid = grid;
    puzzle.slots = slots;
    return puzzle;

}

function createGrid (size) {

    var grid = new Array(size);
    for (rowIdx = 0; rowIdx < size; rowIdx++) {
        grid[rowIdx] = new Array(size);
        for (colIdx = 0; colIdx < size; colIdx++) {
            grid[rowIdx][colIdx] = new Cell(rowIdx, colIdx, false, null, null);
        }
    }

    var numRemainingBlackCellsToAdd = size * size / 6;
    var numRemainingRetries = 500;
    while (numRemainingBlackCellsToAdd > 1) {
        var rowIdx = Math.floor(Math.random() * size);
        var colIdx = Math.floor(Math.random() * size);
        if (!grid[rowIdx][colIdx].isBlack) { // make this random cell black, if it's not already, and do the same to its rotational
            grid[rowIdx][colIdx].isBlack = grid[size-rowIdx-1][size-colIdx-1].isBlack = true; // inverse so that we get a symmetrical grid
            if (numRemainingRetries > 0 && (containsShortSlots(findSlots(grid, size)) || blackAndWhiteNotIntermixedEnough(grid, size))) {
                grid[rowIdx][colIdx].isBlack = grid[size-rowIdx-1][size-colIdx-1].isBlack = false;
                numRemainingRetries--; // optimization: allow an immediate do-over if this last change would result in an invalid puzzle
            } else {
                numRemainingBlackCellsToAdd -= 2;
            }
        }
    }

    return grid;

}

function findSlots (grid, size) {

    var slots = [];

    [true, false].forEach(function (isAcross) {
        for (staticIdx = 0; staticIdx < size; staticIdx++) {
            var currentSlotStartCoord = [0, 0];
            var lastCellWasNonBlack = false;
            for (movingIdx = 0; movingIdx < size; movingIdx++) {
                var rowIdx = isAcross ? staticIdx : movingIdx;
                var colIdx = isAcross ? movingIdx : staticIdx;
                var movingCoordinate = isAcross ? 1 : 0;
                var thisCellIsNonBlack = !grid[rowIdx][colIdx].isBlack;
                var thisCellIsTerminal = movingIdx + 1 == size;
                if (lastCellWasNonBlack) {
                    if (thisCellIsNonBlack) {
                        if (thisCellIsTerminal) { // push a slot ending here
                            slots.push(new Slot(currentSlotStartCoord, movingIdx - currentSlotStartCoord[movingCoordinate] + 1, isAcross));
                        }
                    } else { // push a slot ending in the previous cell
                        slots.push(new Slot(currentSlotStartCoord, movingIdx - currentSlotStartCoord[movingCoordinate], isAcross));
                    }
                } else if (thisCellIsNonBlack) {
                    currentSlotStartCoord = [rowIdx, colIdx];
                    if (thisCellIsTerminal) { // this is a one-cell slot at the end of its strip
                        slots.push(new Slot(currentSlotStartCoord, 1, isAcross));
                    }
                }
                lastCellWasNonBlack = thisCellIsNonBlack;
            }
        }
    });

    return slots;

}

function isValid (grid, slots, size) {

    // puzzle shouldn't contain any too-short slots
    if (containsShortSlots(slots)) {
        console.log('rejecting puzzle because it contains too-short slots');
        return false;
    }

    // black and white should be well mixed
    if (blackAndWhiteNotIntermixedEnough(grid, size)) {
        console.log('rejecting puzzle because black and white are not intermixed enough');
        return false;
    }

    // puzzle shouldn't have too many long slots
    var longSlotLength = Math.floor(size * .9);
    var longSlots = slots.filter(function(slot) {return slot.size >= longSlotLength});
    var ratioLongSlots = longSlots.length / slots.length;
    if (ratioLongSlots > .11) {
        console.log('rejecting puzzle because long-slots ratio is too high: ' + ratioLongSlots);
        return false;
    }

    // first cell shouldn't be black
    if (grid[0][0].isBlack) {
        console.log('rejecting puzzle because first cell is black');
        return false;
    }

    // everything fine
    return true;

}

function containsShortSlots(slots) {
    return slots.some(function(slot) {
        return slot.size <= 2
    });
}

function blackAndWhiteNotIntermixedEnough (grid, size) {

    for (rowIdx = 0; rowIdx < size; rowIdx++) {
        for (colIdx = 0; colIdx < size; colIdx++) {
            var neighbors = getNeighbors(grid[rowIdx][colIdx]);
            var numBlackNeighbors =_.reduce(neighbors, function (sum, neighbor) {return sum + neighbor}, 0);
            if (numBlackNeighbors >= 4 ||
                neighbors[1] + neighbors[5] == 2 ||
                neighbors[3] + neighbors[7] == 2 ||
                neighbors[3] + neighbors[4] + neighbors[5] == 3) {
                return true;
            }
        }
    }
    return false;

    function getNeighbors (cell) {
        var neighbors = [];
        [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]].forEach(function (incr) {
            var row = grid[cell.rowIdx+incr[0]];
            if (row !== undefined) {
                var neighbor = row[cell.colIdx+incr[1]];
                if (neighbor !== undefined && neighbor.isBlack) {
                    neighbors.push(1);
                } else {
                    neighbors.push(0);
                }
            } else {
                neighbors.push(0);
            }
        });
        return neighbors;
    }

}

function addWordNumbering (grid, slots, size) {

    var wordNumber = 1;
    for (rowIdx = 0; rowIdx < size; rowIdx++) {
        for (colIdx = 0; colIdx < size; colIdx++) {
            var cell = grid[rowIdx][colIdx];
            if (cell.number === null && aWordStartsAt(rowIdx, colIdx)) {
                cell.number = wordNumber++;
            }
        }
    }

    function aWordStartsAt(rowIdx, colIdx) {
        return slots.some(function(slot) {
            return _.isEqual(slot.startCoord, [rowIdx,colIdx]);
        });
    }

}
