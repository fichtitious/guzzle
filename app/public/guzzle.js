$(function() {
    $('#newPuzzleButton').click(function() {
        $.post('newPuzzle', {'newPuzzleSize' : $('#newPuzzleSize').val()},
            function (puzzle) {
                $('#puzzleGenerationAttempts').text('It took ' + puzzle.numAttemptsToGenerate + ' attempts to generate this valid puzzle.');
                redrawGrid(puzzle);
            }
        );
    });
});

function redrawGrid(puzzle) {

    $('#gridContainer').remove();

    var gridContainer = $('<div />',
        { width : 40 * puzzle.size,
          height : 40 * puzzle.size,
          class : 'gridContainer',
          id : 'gridContainer'
        }).appendTo('body');

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

    gridContainer.data('puzzle', puzzle);

}
