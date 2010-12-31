$(function() {

    $('#newPuzzleButton').click(function() {
        $.post('newPuzzle', {'newPuzzleSize' : $('#newPuzzleSize').val()},
            function (puzzle) {
                $('#puzzleGenerationAttempts').text('It took ' + puzzle.numAttemptsToGenerate + ' attempts to generate this valid puzzle.');
                redrawPuzzle(puzzle);
            }
        );
    });

    $('.clueNumber').live('hover', function(event) {
        $('#'+$(event.target).data('gridCellId')).toggleClass('blue');
    });

});

function redrawPuzzle(puzzle) {

    var puzzleContainer = redrawPuzzleContainer('body');
    var gridContainer = redrawGridContainer(puzzleContainer);
    redrawGridCells(gridContainer);
    var cluesContainer = redrawCluesContainer(puzzleContainer);
    redrawClues(cluesContainer);

    function redrawPuzzleContainer(topContainer) {
        $('#puzzleContainer').remove();
        var puzzleContainer = $('<div />', {id : 'puzzleContainer'}).appendTo(topContainer);
        puzzleContainer.data('puzzle', puzzle);
        return puzzleContainer;
    }

    function redrawGridContainer(puzzleContainer) {
        var gridContainer = $('<div />',
            { width : 40 * puzzle.size,
              height : 40 * puzzle.size,
              class : 'gridContainer',
              id : 'gridContainer'
            }).appendTo(puzzleContainer);
        return gridContainer;
    }

    function redrawGridCells(gridContainer) {
        for (var rowIdx = 0; rowIdx < puzzle.size; rowIdx++) {
            for (var colIdx = 0; colIdx < puzzle.size; colIdx++) {
                var gridCell = $('<div />',
                    { width : 39,
                      height : 39,
                      class : 'gridCell',
                      id : 'cell' + rowIdx + '-' + colIdx
                    }).appendTo(gridContainer);

                var cell = puzzle.grid[rowIdx][colIdx];
                if (cell.isBlack) {
                    gridCell.addClass('black');
                } else if (cell.number !== null) {
                    gridCell.text(cell.number);
                }
            }
        }
    }

    function redrawCluesContainer(puzzleContainer) {
        var cluesContainer = $('<div />',
          { id : 'cluesContainer',
            class : 'cluesContainer'
          }).appendTo(puzzleContainer);
        return cluesContainer;
    }

    function redrawClues(cluesContainer) {

        puzzle.slots.sort(function (slotA, slotB) {
            return cellAt(puzzle, slotA).number > cellAt(puzzle, slotB).number ? 1 : -1;
        });

        [{'containerId' : 'acrossCluesContainer', 'containerTitle' : 'Across', 'isAcross' : true},
         {'containerId' : 'downCluesContainer',   'containerTitle' : 'Down',   'isAcross' : false}].forEach(function (container) {
            var subCluesContainer = $('<div />',
              { id : container.containerId,
                class : container.containerId,
                text : container.containerTitle
              }).appendTo(cluesContainer);
            puzzle.slots.forEach(function (slot) {
                if (slot.isAcross == container.isAcross) {
                    var clue = $('<div />').appendTo(subCluesContainer);
                    $('<span />',
                      { text : cellAt(puzzle, slot).number,
                        class : 'clueNumber'
                      }).appendTo(clue)
                        .data('gridCellId', 'cell' + slot.startCoord[0] + '-' + slot.startCoord[1]);
                }
            });
        });

        function cellAt(puzzle, slot) {
            return puzzle.grid[slot.startCoord[0]][slot.startCoord[1]];
        }
    }

}
