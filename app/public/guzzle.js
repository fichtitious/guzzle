$(function() {

    [11, 15, 23].forEach(function (size) {
        $('<button />', {text : 'new '+size+' x '+size}).click(function () {
            $.post('newEmptyPuzzle', {'newPuzzleSize' : size}, function (res) {
                $('#puzzleTitle').text('Unsaved Puzzle');
                redrawPuzzle(new Puzzle(res.puzzle));
            });
        }).appendTo($('#newPuzzleControls'));
    });

    $('#savePuzzleButton').click(function () {
        var puzzle = $('#puzzleContainer').data('puzzle');
        if (puzzle !== undefined) {
            $.post('savePuzzle', {'id' : puzzle.id, 'puzzle' : JSON.stringify(puzzle)}, function (res) {
                flashMessage(res.success ? 'saved puzzle ' + res.id : 'failed to save!');
                if (res.success) {
                    $('#puzzleTitle').text('Puzzle ' + res.id);
                    $('#puzzleContainer').data('puzzle').id = res.id;
                }
            });
        }
    });

    $('#loadPuzzleButton').click(function () {
        var id = $('#requestedPuzzle').val();
        if (id) {
            $.post('getPuzzle', {'id' : id}, function (res) {
                if (res.puzzle != '') {
                    $('#puzzleTitle').text('Puzzle ' + id);
                    var puzzle = new Puzzle(JSON.parse(res.puzzle));
                    puzzle.id = id;
                    redrawPuzzle(puzzle);
                } else {
                    flashMessage('sorry, no puzzle with id ' + id);
                }
            });
        }
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
        doneWaiting();
        $('.tentative').each(function () {
            $(this).removeClass('tentative');
            $(this).data('cell').letter = $(this).find('span.gridLetter').text();
        });
    });

    $('#rollbackHelpButton').live('click', function () {
        doneWaiting();
        $('.tentative').each(function () {
            $(this).removeClass('tentative');
            $(this).find('span.gridLetter').text('');
        });
    });

    $('.clueNumber').live('hover', function (event) {
        $('#'+$(event.target).data('gridCellId')).toggleClass('blue');
    });

    $('#spinner').live('click', function () {
        doneWaiting();
    });

    setUpKeyHandler();

});

function helpWithWord (isAcross) {

    var focused = findFocusedGridCell();
    if (focused !== null && !focused.hasClass('blackCell')) {
        var cell = focused.data('cell');
        var puzzle = $('#puzzleContainer').data('puzzle');
        if (isAcross === undefined) {
            var slotAcross = puzzle.slotContaining(cell, true);
            var slotDown = puzzle.slotContaining(cell, false);
            startWaiting(true);
            $.post('/crossWords', { 'patternA' : puzzle.getQueryPattern(slotAcross),
                                    'patternB' : puzzle.getQueryPattern(slotDown),
                                    'intersectIdxA' : slotAcross.indexOfCell(cell),
                                    'intersectIdxB' : slotDown.indexOfCell(cell)
                                  }, function (res) {
                if ($('#spinner').is(':visible')) { // if the request hasn't been cancelled
                    fillSlot(slotAcross, res.wordA);
                    fillSlot(slotDown, res.wordB);
                    doneWaiting();
                }
            });
        } else {
            var slot = puzzle.slotContaining(cell, isAcross);
            startWaiting(false);
            $.post('/matchWord', {'pattern' : puzzle.getQueryPattern(slot)}, function (res) {
                fillSlot(slot, res.word);
                doneWaiting();
            });
        }
    }

    function fillSlot (slot, word) {
        if (word != '') {
            for (i = 0; i < word.length; i++) {
                var letter = word[i];
                var gridCell = $('#cell' + (slot.startCoord[0] + (slot.isAcross ? 0 : i)) + '-' + (slot.startCoord[1] + (slot.isAcross ? i : 0)));
                var cell = gridCell.data('cell');
                if (cell.letter === null) {
                    gridCell.find('span.gridLetter').text(letter);
                    gridCell.addClass('tentative');
                }
            }
        }
    }

}

function startWaiting (spin) {
    $('.helpButton').attr('disabled', 'disabled');
    if (spin) {
        $('#spinner').show();
    }
}

function doneWaiting () {
    $('.helpButton').attr('disabled', '');
    $('#spinner').hide();
}

function setUpKeyHandler () {

    $('#puzzleContainer').live('mouseenter', function () {
        $('#puzzleContainer').addClass('puzzleFocused');
        $('.suspendedFocus').addClass('focused');
        $('.suspendedFocus').removeClass('suspendedFocus');
    }).live('mouseleave', function () {
        $('#puzzleContainer').removeClass('puzzleFocused');
        $('.focused').addClass('suspendedFocus');
        $('.focused').removeClass('focused');
    });

    $('.gridCell').live('click', function (event) {
        if (!$(event.currentTarget).hasClass('blackCell')) {
            $('.focused').removeClass('focused');
            $(event.currentTarget).addClass('focused');
        }
    });

    var lastMoveDown, lastMoveRight = null;

    $(document).keydown(handleKey);

    function handleKey (event) {

        var focused = findFocusedGridCell();
        if (focused !== null && $('#puzzleContainer').hasClass('puzzleFocused')) {

            event.preventDefault();

            if (event.which == 37) {
                refocus(focused, 0, -1);
            } else if (event.which == 39 || event.which == 9) {
                refocus(focused, 0, 1);
            } else if (event.which == 38) {
                refocus(focused, -1, 0);
            } else if (event.which == 40) {
                refocus(focused, 1, 0);
            } else if (event.which == 8 || event.which == 46) {
                focused.find('span.gridLetter').text('');
                focused.removeClass('tentative');
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
        if (newFocus.length > 0 && (avoidBlack === undefined || !newFocus.hasClass('blackCell'))) {
            $('.focused').removeClass('focused');
            newFocus.addClass('focused');
            lastMoveDown = moveDown;
            lastMoveRight = moveRight;
        }
    }

}

function findFocusedGridCell () {

    var focused = $($('.focused')[0]);
    return focused.length > 0 ? focused : null;

}

function redrawPuzzle (puzzle) {

    var puzzleContainer = redrawPuzzleContainer('body');
    puzzleContainer.data('puzzle', puzzle);
    redrawGridCells(puzzleContainer);
    redrawHelpButtons();
    var cluesContainer = redrawCluesContainer();
    redrawClues(cluesContainer);

    function redrawPuzzleContainer(topContainer) {
        $('#puzzleContainer').remove();
        var puzzleContainer =  $('<div />',
            { width : 40 * puzzle.size,
              height : 40 * puzzle.size,
              id : 'puzzleContainer'
            }).prependTo(topContainer);
        return puzzleContainer;
    }

    function redrawGridCells(puzzleContainer) {
        for (var rowIdx = 0; rowIdx < puzzle.size; rowIdx++) {
            for (var colIdx = 0; colIdx < puzzle.size; colIdx++) {
                var gridCell = $('<div />',
                    { width : 39,
                      height : 39,
                      class : 'gridCell',
                      id : 'cell' + rowIdx + '-' + colIdx,
                      value : rowIdx + '-' + colIdx
                    }).appendTo(puzzleContainer);

                var cell = puzzle.grid[rowIdx][colIdx];
                gridCell.data('cell', cell);
                if (cell.isBlack) {
                    gridCell.addClass('blackCell');
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

    function redrawHelpButtons() {

        var buttonContainers = $('.gridCell').filter(function () {
            return $(this).hasClass('blackCell');
        }).sort(distanceSorter(puzzle.size/2)).slice(0, 6).sort(distanceSorter(0));

        [{'text' : '→',  'id' : 'helpAcrossButton', 'idx' : 0},
         {'text' : '↓',  'id' : 'helpDownButton', 'idx' : 1},
         {'text' : 'X',  'id' : 'helpBothButton', 'idx' : 2},
         {'text' : 'ok', 'id' : 'commitHelpButton', 'idx' : 3},
         {'text' : 'no', 'id' : 'rollbackHelpButton', 'idx' : 4}].forEach(function (button) {
            $('<div />', { text : button.text,
                           id : button.id,
                           class : 'helpButton'
                         }).appendTo($(buttonContainers[button.idx]));
        });
        $('<img />', { src : 'spinners/' + Math.ceil(Math.random()*5) + '.gif',
                       id : 'spinner',
                     }).appendTo($(buttonContainers[5]));

        function distanceSorter (origin) {
            return function (gridCellA, gridCellB) {
                return distance(gridCellA) > distance(gridCellB) ? 1 : -1;
                function distance (gridCell) {
                    var rowIdx = parseInt($(gridCell).attr('value').split('-')[0]);
                    var colIdx = parseInt($(gridCell).attr('value').split('-')[1]);
                    return Math.sqrt(Math.pow(origin - rowIdx, 2) + Math.pow(origin - colIdx, 2));
                }
            };
        }

    }

    function redrawCluesContainer() {
        $('#cluesContainer').remove();
        var cluesContainer = $('<div />',
          { id : 'cluesContainer',
          }).appendTo('body');
        return cluesContainer;
    }

    function redrawClues(cluesContainer) {

        puzzle.slots.sort(function (slotA, slotB) {
            return puzzle.cellAtStartOf(slotA).number > puzzle.cellAtStartOf(slotB).number ? 1 : -1;
        });

        [{'containerId' : 'acrossCluesContainer', 'containerTitle' : 'Across', 'isAcross' : true},
         {'containerId' : 'downCluesContainer',   'containerTitle' : 'Down',   'isAcross' : false}].forEach(function (container) {
            var subCluesContainer = $('<div />',
              { id : container.containerId,
                text : container.containerTitle
              }).appendTo(cluesContainer);
            puzzle.slots.forEach(function (slot) {
                if (slot.isAcross == container.isAcross) {
                    var clue = $('<div />').appendTo(subCluesContainer);
                    $('<span />',
                      { text : puzzle.cellAtStartOf(slot).number,
                        class : 'clueNumber'
                      }).appendTo(clue)
                        .data('gridCellId', 'cell' + slot.startCoord[0] + '-' + slot.startCoord[1]);
                }
            });
        });

    }

}

function flashMessage (msg) {

    $('#saveLoadSuccess').text(msg);
    setTimeout(function () {
        $('#saveLoadSuccess').text('');
    }, 2000);

}
