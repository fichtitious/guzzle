$(function() {

    $('#newFullPuzzleButton').click(function () {
        $('#puzzleContainer').remove();
        $('<div />', {id : 'puzzleContainer', text : 'one sec...'}).appendTo('body');
        $.post('newFullPuzzle', {'newPuzzleSize' : $('#newPuzzleSize').val()},
            function (res) {
                redrawPuzzle(res.puzzle);
            }
        );
    });

    $('#newEmptyPuzzleButton').click(function () {
        $.post('newEmptyPuzzle', {'newPuzzleSize' : $('#newPuzzleSize').val()},
            function (res) {
                redrawPuzzle(res.puzzle);
            }
        );
    });

    $('.clueNumber').live('hover', function (event) {
        $('#'+$(event.target).data('gridCellId')).toggleClass('blue');
    });

    $('#matchWordButton').click(function () {
        $.post('/matchWord', {'pattern' : $('#matchWordPattern').val()}, function (res) {
            $('#matchWord').text(res.word);
        });
    });

    $('#crossWordsButton').click(function () {
        $.post('/crossWords', { 'patternA' : $('#patternA').val(),
                                'patternB' : $('#patternB').val(),
                                'intersectIdxA' : $('#intersectIdxA').val(),
                                'intersectIdxB' : $('#intersectIdxB').val()
                              }, function (res) {
            $('#wordA').text(res.wordA);
            $('#wordB').text(res.wordB);
        });
    });

    $('#gridContainer').live('mouseenter', function () {
        $('#gridContainer').addClass('focused');
        $('.suspendedFocusedGridCell').addClass('focusedGridCell');
        $('.suspendedFocusedGridCell').removeClass('suspendedFocusedGridCell');
    }).live('mouseleave', function () {
        $('#gridContainer').removeClass('focused');
        $('.focusedGridCell').addClass('suspendedFocusedGridCell');
        $('.focusedGridCell').removeClass('focusedGridCell');
    });

    $('.gridCell').live('click', function (event) {
        $('.focusedGridCell').removeClass('focusedGridCell');
        $(event.currentTarget).addClass('focusedGridCell');
    });

    $(document).keydown(function (event) {
        var focused = $($('.focusedGridCell')[0]);
        if (focused.length > 0 && $('#gridContainer').hasClass('focused')) {
            event.preventDefault();
            if (event.which == 37) {
                moveCellFocus(focused, 0, -1);
            } else if (event.which == 39) {
                moveCellFocus(focused, 0, 1);
            } else if (event.which == 38) {
                moveCellFocus(focused, -1, 0);
            } else if (event.which == 40) {
                moveCellFocus(focused, 1, 0);
            } else if (event.which == 8 || event.which == 46) {
                focused.find('span.gridLetter').text('');
                focused.data('cell').letter = null;
            } else {
                var letter = String.fromCharCode(event.which);
                if (letter >= 'A' && letter <= 'Z') {
                    focused.find('span.gridLetter').text(letter);
                    focused.data('cell').letter = letter;
                }
            }
        }
    });

});

function moveCellFocus (currentFocus, moveDown, moveRight) {
    var currentRowIdx = parseInt(currentFocus.attr('value').split('-')[0]);
    var currentColIdx = parseInt(currentFocus.attr('value').split('-')[1]);
    var newFocus = $('#cell' + (currentRowIdx+moveDown) + '-' + (currentColIdx+moveRight));
    if (newFocus.length > 0) {
        $('.focusedGridCell').removeClass('focusedGridCell');
        newFocus.addClass('focusedGridCell');
    }
}

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
                      id : 'cell' + rowIdx + '-' + colIdx,
                      value : rowIdx + '-' + colIdx
                    }).appendTo(gridContainer);

                var cell = puzzle.grid[rowIdx][colIdx];
                gridCell.data('cell', cell);
                if (cell.isBlack) {
                    gridCell.addClass('black');
                } else {
                    $('<span />',
                      { text : cell.number === null ? '' : cell.number,
                        class : 'gridNumber'
                      }).appendTo(gridCell);
                    $('<span />',
                      { text : cell.letter === null ? '' : cell.letter,
                        class : 'gridLetter'
                      }).appendTo(gridCell);
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
