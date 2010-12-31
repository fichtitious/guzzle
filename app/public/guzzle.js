$(function() {
    $('#newPuzzleButton').click(function() {
        $.post('newPuzzle', {'newPuzzleSize' : $('#newPuzzleSize').val()},
            function (puzzle) {
                $('#puzzleGenerationAttempts').text('It took ' + puzzle.numAttemptsToGenerate + ' attempts to generate this valid puzzle.');
                redraw(puzzle);
            }
        );
    });
});

function redraw(puzzle) {

    $('#puzzleContainer').remove();
    var puzzleContainer = $('<div />', {id : 'puzzleContainer'}).appendTo('body');
    puzzleContainer.data('puzzle', puzzle);

    var gridContainer = $('<div />',
        { width : 40 * puzzle.size,
          height : 40 * puzzle.size,
          class : 'gridContainer',
          id : 'gridContainer'
        }).appendTo(puzzleContainer);

    for (var rowIdx = 0; rowIdx < puzzle.size; rowIdx++) {
        for (var colIdx = 0; colIdx < puzzle.size; colIdx++) {

            var gridCell = $('<div />',
                { width : 39,
                  height : 39,
                  class : 'gridCell',
                  id : rowIdx + ',' + colIdx
                }).appendTo(gridContainer);

            var cell = puzzle.grid[rowIdx][colIdx];
            if (cell.isBlack) {
                gridCell.addClass('black');
            } else if (cell.number !== null) {
                gridCell.text(cell.number);
            }

        }
    }

    var cluesContainer = $('<div />',
      { id : 'cluesContainer',
        class : 'cluesContainer'
      }).appendTo(puzzleContainer);

    [['acrossCluesContainer', 'Across', true],
     ['downCluesContainer', 'Down', false]].forEach(function () {
        var containerId = arguments[0][0];
        var containerTitle = arguments[0][1];
        var isAcross = arguments[0][2];
        var container = $('<div />',
          { id : containerId,
            class : containerId,
            text : containerTitle
          }).appendTo(cluesContainer);
        puzzle.slots.sort(function (slotA, slotB) {
            return cellAt(puzzle, slotA).number > cellAt(puzzle, slotB).number ? 1 : -1;
        }).forEach(function (slot) {
            if (slot.isAcross == isAcross) {
                var wordNumber = cellAt(puzzle, slot).number;
                $('<div />', {text : wordNumber}).appendTo(container);
            }
        });
    });

    function cellAt(puzzle, slot) {
        return puzzle.grid[slot.startCoord[0]][slot.startCoord[1]];
    }

}
