exports.Puzzle = Puzzle;

var BLACK = 0;

function Puzzle(size) {
    this.size = size;
    this.numAttemptsToGenerate = 0;
    while (true) {
        this.numAttemptsToGenerate++;
        var grid = createGrid(size);
        var slots = findSlots(grid, size);
        if ( isValid(grid, slots, size) ) {
            this.grid = grid;
            this.slots = slots;
            break;
        } else if (this.numAttemptsToGenerate > 200) {
            this.numAttemptsToGenerate = "too many!";
            break;
        }
    }
}

function Slot (startCoord, size, isAcross) {
    this.startCoord = startCoord;
    this.size = size;
    this.isAcross = isAcross;
    this.isDown = !isAcross;
}

function createGrid (size) {

    var grid = new Array(size);

    for (rowIdx = 0; rowIdx < size; rowIdx++) {
        grid[rowIdx] = new Array(size);
        for (colIdx = 0; colIdx < size; colIdx++) {
            grid[rowIdx][colIdx] = 1;
        }
    }

    var numRemainingBlackCellsToAdd = size * 2;
    var numRemainingRetries = 50;
    while (numRemainingBlackCellsToAdd > 1) {
        var rowIdx = Math.floor(Math.random() * size);
        var colIdx = Math.floor(Math.random() * size);
        if (grid[rowIdx][colIdx] != 0) {                                       // make this random cell black, if it's not already, and do the same
            grid[rowIdx][colIdx] = grid[size-rowIdx-1][size-colIdx-1] = BLACK; // to its rotational inverse so that we get a symmetrical grid
            if (numRemainingRetries > 0 && findSlots(grid, size).filter(function(slot) {return slot.size <= 2}).length != 0) {
                grid[rowIdx][colIdx] = grid[size-rowIdx-1][size-colIdx-1] = 1; // optimization: allow an immediate do-over if this last change
                numRemainingRetries--;                                         // would result in an invalid puzzle
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
                var thisCellIsNonBlack = grid[rowIdx][colIdx] !== BLACK;
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
    var tooShortSlots = slots.filter(function(slot) {return slot.size <= 2});
    if (tooShortSlots.length != 0) {
        console.log('rejecting puzzle because it contains too-short slots');
        return false;
    }

    // puzzle shouldn't have too many long slots
    var longSlotLength = Math.floor(size * .9);
    var longSlots = slots.filter(function(slot) {return slot.size >= longSlotLength});
    var ratioLongSlots = longSlots.length / slots.length;
    if (ratioLongSlots > .09) {
        console.log('rejecting puzzle because long-slots ratio is too high: ' + ratioLongSlots);
        return false;
    }

    // first cell shouldn't be black
    if (grid[0][0] === BLACK) {
        console.log('rejecting puzzle because first cell is black');
        return false;
    }

    // everything fine
    return true;

}
