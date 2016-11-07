$(document).ready(function () {
  var gameBoard = [
                    ['', '', '', '', '', ''],
                    ['', '', '', '', '', ''],
                    ['', '', '', '', '', ''],
                    ['', '', '', '', '', ''],
                    ['', '', '', '', '', ''],
                    ['', '', '', '', '', '']
  ]

  var player = 'X'
  var movePart = 'A'

  var $allGameSquare = $('.game-square')
  var scoreBoard = {
    'X': 0,
    'O': 0,
    'ties': 0,
    'Xset': false,
    'Oset': false,
    'roundEnd': true,
    'initiator': 'X',
    'winner': ''
  }

  gameBoardInit()

  $('.reset-btn').on('click', fullReset)

  $('.next-game-btn').on('click', gameBoardInit)

  $('.instructions-btn').on('click', function () {
    $('.instructions-container').toggle()
  })

  $('.close-instructions').on('click', function () {
    $('.instructions-container').hide()
  })

  function toggleNextGameBtn () {
    if (scoreBoard.roundEnd) {
      $('.next-game-btn').show()
    } else {
      $('.next-game-btn').hide()
    }
  }

  function gameBoardInit () {
    $allGameSquare.removeClass('X')
    $allGameSquare.removeClass('O')
    gameBoard = [
                      ['', '', '', '', '', ''],
                      ['', '', '', '', '', ''],
                      ['', '', '', '', '', ''],
                      ['', '', '', '', '', ''],
                      ['', '', '', '', '', ''],
                      ['', '', '', '', '', '']
    ]
    scoreBoard.roundEnd = false
    prepMoveA()
    toggleNextGameBtn()
    scoreBoard.Xset = false
    scoreBoard.Oset = false
  }

  function updateTurnMessage (input) {
    if (player === 'X') {
      if (movePart === 'A') {
        $('.alert-message').text('Player 1: Place a token')
      } else if (movePart === 'B') {
        $('.alert-message').text('Player 1: Rotate a tile')
      }
    } else if (player === 'O') {
      if (movePart === 'A') {
        $('.alert-message').text('Player 2: Place a token')
      } else if (movePart === 'B') {
        $('.alert-message').text('Player 2: Rotate a tile')
      }
    }
  }

  // Prep for Move A. Removes rotate buttons, updates turn message, and adds event listeners for empty game-tiles
  function prepMoveA () {
    $('.rotate-btn').hide()
    movePart = 'A'
    updateTurnMessage()
    for (var i = 0; i < $allGameSquare.length; i++) {
      var $gameSquare = $('.game-square').eq(i)
      if (!$gameSquare.hasClass('X') && !$gameSquare.hasClass('O')) {
        $gameSquare.on('click', playerMove)
        $gameSquare.hover(
          function () {
            $(this).addClass('hover' + player)
          },
          function () {
            $(this).removeClass('hoverX hoverO')
          }
        )
      }
    }
  }

  // Prep for Move B. Turns off event listeners, and shows rotate buttons
  function prepMoveB () {
    $allGameSquare.off()
    $allGameSquare.removeClass('hoverX hoverO')
    $('.rotate-btn').show()
    movePart = 'B'
    updateTurnMessage()
  }

  // Disables ALL event listeners after win to allow board analysis
  function freezeFrame () {
    $allGameSquare.off()
    $('.rotate-btn').hide()
    $('.alert-message h1').text(scoreBoard.winner)
  }

  // Checks win condition for a particular tile with direction and coordinates specified
  function checkWin (rowIndex, colIndex, direction) {
    var adjustFirstArr = 0
    var adjustSecondArr = 0

    switch (direction) {
      case 'vertical':
        adjustFirstArr = 1
        adjustSecondArr = 0
        break
      case 'horizontal':
        adjustFirstArr = 0
        adjustSecondArr = 1
        break
      case 'upDiagonal':
        adjustFirstArr = -1
        adjustSecondArr = 1
        break
      case 'downDiagonal':
        adjustFirstArr = -1
        adjustSecondArr = -1
        break
      default:
        adjustFirstArr = 0
        adjustSecondArr = 0
    }

    var playerMove = gameBoard[rowIndex][colIndex]

    var checkRowFront = rowIndex + adjustFirstArr
    var checkColFront = colIndex + adjustSecondArr

    var checkRowBack = rowIndex - adjustFirstArr
    var checkColBack = colIndex - adjustSecondArr

    var totalMatches = 0

    for (var i = 0; i < 6; i++) {
      if (checkRowFront >= 0 && checkRowFront <= 5 && checkColFront >= 0 && checkColFront <= 5) {
        if (gameBoard[checkRowFront][checkColFront] === playerMove && playerMove) {
          checkRowFront += adjustFirstArr
          checkColFront += adjustSecondArr
          totalMatches += 1
          // Maybe can add winning tile change here
        } else {
          break
        }
      } else {
        break
      }
    }

    for (var i = 0; i < 6; i++) {
      if (checkRowBack >= 0 && checkRowBack <= 5 && checkColBack >= 0 && checkColBack <= 5) {
        if (gameBoard[checkRowBack][checkColBack] === playerMove && playerMove) {
          checkRowBack -= adjustFirstArr
          checkColBack -= adjustSecondArr
          totalMatches += 1
        } else {
          break
        }
      } else {
        break
      }
    }

    // If win, end game. If not, proceed to move part 2
    if (totalMatches >= 4) {
      scoreBoard[playerMove + 'set'] = true
    } else {
      prepMoveB()
    }
  }

  // Checks tie condition when all ties filled
  function checkTie () {
    var gameSquareFilled = 0
    for (var i = 0; i < $allGameSquare.length; i++) {
      if ($('.game-square').eq(i).hasClass('X') || $('.game-square').eq(i).hasClass('O')) {
        gameSquareFilled += 1
      }
    }
    if (gameSquareFilled === 36 && !scoreBoard.roundEnd) {
      scoreBoard.ties += 1
      scoreBoard.winner = 'Tie'
      $('.alert-message').text("It's a tie!")
      updateScoreBoard()
      freezeFrame()
      togglePlayerIfTie()
      toggleNextGameBtn()
    }
  }

  // Consolidates win conditions in one function
  function checkAllWin (thisRow, thisCol) {
    checkWin(thisRow, thisCol, 'vertical')
    checkWin(thisRow, thisCol, 'horizontal')
    checkWin(thisRow, thisCol, 'upDiagonal')
    checkWin(thisRow, thisCol, 'downDiagonal')
    checkTie()
  }

  // On player click, if populated, populates gameBoard and game-tiles with values. After that, check win condition for that particular entry.
  function playerMove () {
    // If cell is populated
    $this = $(this)
    if (!$this.hasClass('X') && !$this.hasClass('O')) {
      // Gets rows and col index from HTML divs
      var thisRow = Number($(this).data('row'))
      var thisCol = Number($(this).data('col'))

      // Assigns player value to gameBoard array and HTML
      gameBoard[thisRow][thisCol] = player
      $(this).addClass(player)

      // Checks win condition for clicked cell
      checkAllWin(thisRow, thisCol)

      if (scoreBoard[player + 'set'] === true) {
        scoreBoard[player] += 1
        if (player === 'X') {
          $('.alert-message').text('Player 1 wins!')
          scoreBoard.roundEnd = true
        } else if (player === 'O') {
          $('.alert-message').text('Player 2 wins!')
          scoreBoard.roundEnd = true
        }
        togglePlayer()
        scoreBoard.initiator = player
        scoreBoard.winner = player
        updateScoreBoard()
        freezeFrame()
        toggleNextGameBtn()
      }
    }
  }

  // Assigns rotate tile function to each button, calling the closure with the appropriate board
  for (var i = 0; i < 4; i++) {
    // Define closure for each board, and assign click event for rotate
    var rotateTileIndex = rotateBoard('board' + i, 'right')
    var $rotateRightBtn = $('#rotate-right' + i)
    $rotateRightBtn.on('click', rotateTileIndex)

    var rotateTileIndex = rotateBoard('board' + i, 'left')
    var $rotateLeftBtn = $('#rotate-left' + i)
    $rotateLeftBtn.on('click', rotateTileIndex)
  }

  // For specified board and rotate direction, creates a closure function for rotation behaviour
  function rotateBoard (boardIndex, rotateDirection) {
    var x = 0
    var y = 0
    var gameTileID

    switch (boardIndex) {
      case 'board0':
        x = 0
        y = 0
        gameTileID = '#game-tile-0'
        break
      case 'board1':
        x = 0
        y = 3
        gameTileID = '#game-tile-1'
        break
      case 'board2':
        x = 3
        y = 0
        gameTileID = '#game-tile-2'
        break
      case 'board3':
        x = 3
        y = 3
        gameTileID = '#game-tile-3'
        break
      default:
    }

    // Var declared here due to hoisting issues
    var $gameSquareTile = $(gameTileID + ' .game-square')

    function updateTileValues () {
      // Storing values to rotate in variables

      var rightRotateTiles = {
        '0': gameBoard[x + 2][y],
        '1': gameBoard[x + 1][y],
        '2': gameBoard[x][y],
        '3': gameBoard[x + 2][y + 1],
        '4': gameBoard[x + 1][y + 1],
        '5': gameBoard[x][y + 1],
        '6': gameBoard[x + 2][y + 2],
        '7': gameBoard[x + 1][y + 2],
        '8': gameBoard[x][y + 2]
      }

      var leftRotateTiles = {
        '0': gameBoard[x][y + 2],
        '1': gameBoard[x + 1][y + 2],
        '2': gameBoard[x + 2][y + 2],
        '3': gameBoard[x][y + 1],
        '4': gameBoard[x + 1][y + 1],
        '5': gameBoard[x + 2][y + 1],
        '6': gameBoard[x][y],
        '7': gameBoard[x + 1][y],
        '8': gameBoard[x + 2][y]
      }

      if (rotateDirection === 'right') {
        $(gameTileID).addClass('rotate-tile-right')
      } else {
        $(gameTileID).addClass('rotate-tile-left')
      }

      // Added to smoothen out transition animation
      $('.rotate-btn').hide()

      // Function to execute after visual rotation
      window.setTimeout(unRotate, 800)

      function unRotate () {
        // Removes rotated class
        $(gameTileID).removeClass('rotate-tile-right')
        $(gameTileID).removeClass('rotate-tile-left')

        $gameSquareTile.removeClass('X')
        $gameSquareTile.removeClass('O')

        var counter = 0
        // For each item on a game-tile, get new rotated value and assign new classes accordingly
        for (var i = x; i < x + 3; i++) {
          for (var j = y; j < y + 3; j++) {
            // Assigning the values to new positions on gameBoard
            if (rotateDirection === 'right') {
              gameBoard[i][j] = rightRotateTiles[counter]
            } else if (rotateDirection === 'left') {
              gameBoard[i][j] = leftRotateTiles[counter]
            }

            // Changing class to reflect gameBoard changes
            if (gameBoard[i][j] === 'X') {
              $gameSquareTile.eq(counter).addClass('X')
            } else if (gameBoard[i][j] === 'O') {
              $gameSquareTile.eq(counter).addClass('O')
            }
            // counter to loop through the gameSquareTile array
            counter += 1
            checkAllWin(i, j)
          }
        }

      // Verifying win and tie condition after win condition has been checked for entire tile
      // Toggles player for each situation
        if (scoreBoard.Xset && scoreBoard.Oset) {
          scoreBoard.ties += 1
          scoreBoard.roundEnd = true
          scoreBoard.winner = 'Tie'
          $('.alert-message').text("It's a tie!")
          togglePlayerIfTie()
        } else if (scoreBoard.Xset && !scoreBoard.Oset) {
          scoreBoard.X += 1
          scoreBoard.roundEnd = true
          scoreBoard.winner = 'X'
          $('.alert-message').text('Player 1 wins!')
          player = 'O'
          scoreBoard.initiator = player
        } else if (!scoreBoard.Xset && scoreBoard.Oset) {
          scoreBoard.O += 1
          scoreBoard.roundEnd = true
          scoreBoard.winner = 'O'
          $('.alert-message').text('Player 2 wins!')
          player = 'X'
          scoreBoard.initiator = player
        } else {
          togglePlayer()
          prepMoveA()
        }

        if (scoreBoard.roundEnd) {
          freezeFrame()
          updateScoreBoard()
        }

        toggleNextGameBtn()
      }
    }
    return updateTileValues
  }

  function updateScoreBoard () {
    $('.player-x-score').text(scoreBoard.X)
    $('.player-o-score').text(scoreBoard.O)
    $('.tie-score').text(scoreBoard.ties)
  }

  function fullReset () {
    gameBoardInit()
    for (var x in scoreBoard) {
      scoreBoard[x] = 0
    }
    player = 'X'
    updateTurnMessage()
    updateScoreBoard()
  }

  function togglePlayer () {
    if (player === 'X') {
      player = 'O'
    } else {
      player = 'X'
    }
  }

  function togglePlayerIfTie () {
    if (scoreBoard.initiator === 'X') {
      player = 'O'
      scoreBoard.initiator = player
    } else {
      player = 'X'
      scoreBoard.initiator = player
    }
  }
})
