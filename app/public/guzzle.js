$(function() {

    $('#newEmptyPuzzleButton').click(function () {
        $.post('newEmptyPuzzle', {'newPuzzleSize' : $('#newPuzzleSize').val()},
            function (res) {
                redrawPuzzle(res.puzzle);
            }
        );
    });

    $('#helpAcrossButton').live('click', function () {
        helpWithWord(true);
    });

    $('#helpDownButton').live('click', function () {
        helpWithWord(false);
    });

    $('#helpBothButton').live('click', function () {
        helpWithWord();
    });

    $('#commitHelpButton').live('click', function () {
        $('.tentative').each(function () {
            $(this).removeClass('tentative');
            $(this).data('cell').letter = $(this).find('span.gridLetter').text();
        });
    });

    $('#rollbackHelpButton').live('click', function () {
        $('.tentative').each(function () {
            $(this).removeClass('tentative');
            $(this).find('span.gridLetter').text('');
        });
    });

    $('.clueNumber').live('hover', function (event) {
        $('#'+$(event.target).data('gridCellId')).toggleClass('blue');
    });

    setUpKeyHandler();

});

function helpWithWord (isAcross) {

    var focusedGridCell = getFocusedGridCell();
    if (focusedGridCell !== null && !focusedGridCell.hasClass('black')) {
        var cell = focusedGridCell.data('cell');
        var puzzle = $('#puzzleContainer').data('puzzle');
        if (isAcross === undefined) {
            var slotAcross = findSlot(cell, true);
            var slotDown = findSlot(cell, false);
            var patternAcross = getQueryPattern(slotAcross, puzzle.grid);
            var patternDown = getQueryPattern(slotDown, puzzle.grid);
            var intersectIdxAcross = indexOfCell(slotAcross, cell);
            var intersectIdxDown = indexOfCell(slotDown, cell);
            $.post('/crossWords', { 'patternA' : patternAcross,
                                    'patternB' : patternDown,
                                    'intersectIdxA' : intersectIdxAcross,
                                    'intersectIdxB' : intersectIdxDown
                                  }, function (res) {
                fillWord(res.wordA, slotAcross, true);
                fillWord(res.wordB, slotDown, false);
            });
        } else {
            var slot = findSlot(cell, isAcross);
            var pattern = getQueryPattern(slot, puzzle.grid);
            $.post('/matchWord', {'pattern' : pattern}, function (res) {
                fillWord(res.word, slot, isAcross);
            });
        }
    }

    function fillWord (word, slot, isAcross) {
        if (word === undefined) {
            return;
        }
        for (i = 0; i < word.length; i++) {
            var letter = word[i];
            var gridCell = $('#cell' + (slot.startCoord[0] + (isAcross ? 0 : i)) + '-' + (slot.startCoord[1] + (isAcross ? i : 0)));
            var cell = gridCell.data('cell');
            if (cell.letter === null) {
                gridCell.find('span.gridLetter').text(letter);
                gridCell.addClass('tentative');
            }
        }
    }

    function findSlot (cell, isAcross) {
        return puzzle.slots.filter(function (slot) {
            return indexOfCell(slot, cell) != -1 && slot.isAcross == isAcross;
        })[0];
    }

    function indexOfCell (slot, cell) {
        for (i = 0; i < slot.size; i++) {
            if (_.isEqual([cell.rowIdx, cell.colIdx], slot.coords[i])) {
                return i;
            }
        }
        return -1;
    };

    function getQueryPattern (slot, grid) {
        return slot.coords.map(function (coord) {
            var cell = grid[coord[0]][coord[1]];
            return cell.letter === null ? '_' : cell.letter;
        }).join('');
    };

}

function setUpKeyHandler () {

    $('#puzzleContainer').live('mouseenter', function () {
        $('#puzzleContainer').addClass('focused');
        $('.suspendedFocusedGridCell').addClass('focusedGridCell');
        $('.suspendedFocusedGridCell').removeClass('suspendedFocusedGridCell');
    }).live('mouseleave', function () {
        $('#puzzleContainer').removeClass('focused');
        $('.focusedGridCell').addClass('suspendedFocusedGridCell');
        $('.focusedGridCell').removeClass('focusedGridCell');
    });

    $('.gridCell').live('click', function (event) {
        $('.focusedGridCell').removeClass('focusedGridCell');
        $(event.currentTarget).addClass('focusedGridCell');
    });

    var lastMoveDown, lastMoveRight = null;

    $(document).keydown(handle);

    function handle (event) {

        var focused = getFocusedGridCell();
        if (focused !== null && $('#puzzleContainer').hasClass('focused')) {

            event.preventDefault();

            if (event.which == 37) {
                refocus(focused, 0, -1);
            } else if (event.which == 39) {
                refocus(focused, 0, 1);
            } else if (event.which == 38) {
                refocus(focused, -1, 0);
            } else if (event.which == 40) {
                refocus(focused, 1, 0);
            } else if (event.which == 8 || event.which == 46) {
                focused.find('span.gridLetter').text('');
                focused.data('cell').letter = null;
            } else {
                var letter = String.fromCharCode(event.which);
                if (letter >= 'A' && letter <= 'Z') {
                    focused.find('span.gridLetter').text(letter);
                    focused.removeClass('tentative');
                    focused.data('cell').letter = letter;
                    if (lastMoveDown !== null && lastMoveDown + lastMoveRight == 1) {
                        refocus(focused, lastMoveDown, lastMoveRight, true);
                    }
                }
            }

        }
    }

    function refocus (current, moveDown, moveRight, avoidBlack) {
        var rowIdx = parseInt(current.attr('value').split('-')[0]);
        var colIdx = parseInt(current.attr('value').split('-')[1]);
        var newFocus = $('#cell' + (rowIdx+moveDown) + '-' + (colIdx+moveRight));
        if (newFocus.length > 0 && (avoidBlack === undefined || !newFocus.hasClass('black'))) {
            $('.focusedGridCell').removeClass('focusedGridCell');
            newFocus.addClass('focusedGridCell');
            lastMoveDown = moveDown;
            lastMoveRight = moveRight;
        }
    }

}

function getFocusedGridCell () {
    var focused = $($('.focusedGridCell')[0]);
    return focused.length > 0 ? focused : null;
}

function redrawPuzzle (puzzle) {

    var puzzleContainer = redrawPuzzleContainer('body');
    redrawHelpButtons(puzzleContainer);
    var gridContainer = redrawGridContainer(puzzleContainer);
    redrawGridCells(gridContainer);
    var cluesContainer = redrawCluesContainer();
    redrawClues(cluesContainer);

    function redrawPuzzleContainer(topContainer) {
        $('#puzzleContainer').remove();
        var puzzleContainer = $('<div />', {id : 'puzzleContainer'}).appendTo(topContainer);
        puzzleContainer.data('puzzle', puzzle);
        return puzzleContainer;
    }

    function redrawHelpButtons(puzzleContainer) {
        $('<button />', {text : 'help across', id : 'helpAcrossButton'}).appendTo(puzzleContainer);
        $('<button />', {text : 'help down', id : 'helpDownButton'}).appendTo(puzzleContainer);
        $('<button />', {text : 'help both', id : 'helpBothButton'}).appendTo(puzzleContainer);
        $('<button />', {text : 'ok', id : 'commitHelpButton'}).appendTo(puzzleContainer);
        $('<button />', {text : 'no', id : 'rollbackHelpButton'}).appendTo(puzzleContainer);
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

    function redrawCluesContainer() {
        $('#cluesContainer').remove();
        var cluesContainer = $('<div />',
          { id : 'cluesContainer',
            class : 'cluesContainer'
          }).appendTo('body');
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
