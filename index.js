'use strict'

// SETUP

class Player {
    constructor(color) {
        this.color = color;
        this.redMarbles = 0;
    }
    addRed() {
        // adds a red marble to player's collected marbles
        this.redMarbles++;
    }
}

function toArray() {
    // converts the current board state to a 2D array
    let board = [[], [], [], [], [], [], []]
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            board[i][j] = document.querySelector(`.r${i}.c${j}`).firstElementChild.classList[1];
        }
    }
    return board;
}

class Game {
    constructor() {
        this.winner = null;
        this.currentState = toArray();
        this.previousState = null;
        this.moving = false;
        this.selected = null;
        this.currentTurn = new Player('black');
        this.currentOpp = new Player('white');
    }
}

const game = new Game();


// GAME LOGIC


function getMarbles(currentBoard, player) {
    // Returns a count of the remaining marbles the given player has remaining
    let playerMarbles = 0;
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (currentBoard[i][j] === player.color) {
                playerMarbles++;

            }
        }
    }
    return playerMarbles;
}

function updateWinner(game) {
    // Checks if player has captured 7 marbles or knocked of all opponent marbles, 
    // or if the current turn has no remaining moves
    if (game.currentTurn.redMarbles === 7) {
        game.winner = { name: game.currentTurn.color, reason: `${game.currentTurn.color.charAt(0).toUpperCase() + game.currentTurn.color.slice(1)} collected 7 red marbles!` };
    } else if (getMarbles(game.currentState, game.currentOpp) === 0) {
        game.winner = { name: game.currentTurn.color, reason: `No more ${game.currentOpp.color} marbles!` };
    } else if (checkRemainingMoves(game) === false) {
        game.winner = { name: game.currentOpp.color, reason: `${game.currentTurn.color.charAt(0).toUpperCase() + game.currentTurn.color.slice(1)} has no more moves` };
    }
}


function checkIfWinner(availableMoves, opponentMarbles, player) {
    // Returns true if the given player has won the game, else returns false
    if (availableMoves.length === 0) {
        return true;
    } else if (player.redMarbles === 7) {
        return true;
    } else if (opponentMarbles === 0) {
        return true;
    }
    return false;
}


function checkRemainingMoves(game) {
    // Returns true if the current player has any moves remaining. Otherwise returns false
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (document.querySelector(`.r${i}.c${j}`).firstElementChild.classList[1] === game.currentTurn.color) {
                let directions = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                for (let direction of directions) {
                    if (fakeMove(game.currentState, game.previousState, game.currentTurn, game.currentOpp, i, j, direction).valid) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}


function getAllMoves(currentBoard, previousBoard, player, opponent) {
    // Returns an array of all remaining moves the given player has left.
    // Moves are represented as an object with properties: row, column, direction, results
    // Results object has the following properties: valid, capturedRed, KnockedOffOpp, newBoard
    const moves = [];
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (currentBoard[i][j] === player.color) {
                let directions = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                for (let direction of directions) {
                    let results = fakeMove(currentBoard, previousBoard, player, opponent, i, j, direction);
                    if (results.valid) {
                        moves.push({ row: i, column: j, direction: direction, results: results })
                    }
                }
            }
        }
    }
    return moves;
}

function updateStats(game) {
    // Updates the current turn and captured marbles on the UI. If a winner has been declared,
    // winner popup will appear
    if (game.winner) {
        document.querySelector('.winnermarble').className = 'minimarble winnermarble ' + game.winner.name;
        document.querySelector('.winnertext').innerHTML = game.winner.reason;
        document.querySelector('.gameover').classList.toggle('hidden');
    }
    if (game.currentTurn.color == 'black') {
        document.querySelector('.turntext').firstChild.nodeValue = 'Your Turn ';
    } else {
        document.querySelector('.turntext').firstChild.nodeValue = 'CPU\'s Turn ';
    }
    document.querySelector('.turnmarble').className = 'minimarble turnmarble ' + game.currentTurn.color;
    document.querySelector(`.${game.currentTurn.color}captured`).innerHTML = game.currentTurn.redMarbles;
    document.querySelector(`.${game.currentOpp.color}captured`).innerHTML = game.currentOpp.redMarbles;
}



function fakeMove(currentBoard, previousBoard, player, opponent, row, column, direction, notify = false) {
    // Attempts to move the piece at the given row and column in the given direction.
    // Move is made on a copy of the current board so as not to affect the actual game board.
    // Returns a result object with properties: valid, capturedRed, knockedOffOpp, newBoard

    // set up variables based on direction
    const copyBoard = JSON.parse(JSON.stringify(currentBoard));
    const copyPrevious = JSON.parse(JSON.stringify(previousBoard));
    const result = { valid: true, capturedRed: false, knockedOffOpp: false, newBoard: null };
    let rowModifier = null;
    let columnModifier = null;
    let edgeRow = row;
    let edgeColumn = column;
    let containsEmpty = false;
    if (direction === 'ArrowLeft') {
        rowModifier = 0;
        columnModifier = -1;
        edgeColumn = 0;
        if (column !== 6 && copyBoard[row][column + 1] !== 'empty') {
            if (notify === true) alert('There is no space behind the marble');
            result.valid = false;
            return result;
        }
        for (let i = 0; i < column; i++) {
            if (copyBoard[row][i] === 'empty') {
                containsEmpty = true;
            }
        }
    } else if (direction === 'ArrowRight') {
        rowModifier = 0;
        columnModifier = 1;
        edgeColumn = 6;
        if (column !== 0 && copyBoard[row][column - 1] !== 'empty') {
            if (notify === true) alert('There is no space behind the marble');
            result.valid = false;
            return result;
        }
        for (let i = column + 1; i < 7; i++) {
            if (copyBoard[row][i] === 'empty') {
                containsEmpty = true;
            }
        }
    } else if (direction === 'ArrowUp') {
        rowModifier = -1;
        columnModifier = 0;
        edgeRow = 0;
        if (row !== 6 && copyBoard[row + 1][column] !== 'empty') {
            if (notify === true) alert('There is no space behind the marble');
            result.valid = false;
            return result;
        }
        for (let i = 0; i < row; i++) {
            if (copyBoard[i][column] === 'empty') {
                containsEmpty = true;
            }
        }
    } else if (direction === 'ArrowDown') {
        rowModifier = 1;
        columnModifier = 0;
        edgeRow = 6;
        if (row !== 0 && copyBoard[row - 1][column] !== 'empty') {
            if (notify === true) alert('There is no space behind the marble');
            result.valid = false;
            return result;
        }
        for (let i = row + 1; i < 7; i++) {
            if (copyBoard[i][column] === 'empty') {
                containsEmpty = true;
            }
        }
    }

    // if there are no empty spots in the path, removes the marble at the edge
    if (containsEmpty === false) {
        if (copyBoard[edgeRow][edgeColumn] === player.color) {
            if (notify === true) alert('You cannot knock of your own marble');
            result.valid = false;
            return result;
        } else if (copyBoard[edgeRow][edgeColumn] === 'red') {
            result.capturedRed = true;
        } else if (copyBoard[edgeRow][edgeColumn] === opponent.color) {
            result.knockedOffOpp = true;
        }
        copyBoard[edgeRow][edgeColumn] = 'empty';
    }

    // moves all marbles until an empty space is reached
    let prev = 'empty';
    do {
        let current = copyBoard[row][column];
        copyBoard[row][column] = prev;
        prev = current;
        column += columnModifier;
        row += rowModifier
    } while (prev !== 'empty');

    // checks if move will return board to previous position
    if (JSON.stringify(copyBoard) === JSON.stringify(copyPrevious)) {
        if (notify === true) alert('You cannot return to the previous board position');
        result.valid = false;
        return result;
    }

    result.newBoard = copyBoard;
    return result;
}

async function makeMove(row, column, direction, game) {
    // Executes a move on screen by modifying the DOM

    // set up variables based on direction
    let rowModifier = null;
    let columnModifier = null;
    let edgeIndex = null;
    let axis = null;
    let movingClass = null;
    let capturedRed = false;
    let knockedOffOpp = false;
    let containsEmpty = false;
    if (direction === 'ArrowLeft') {
        edgeIndex = 0;
        rowModifier = 0;
        columnModifier = -1;
        movingClass = 'moving-left';
        axis = document.querySelectorAll(`.r${row}`);
        for (let i = 0; i < column; i++) {
            if (axis[i].firstElementChild.classList[1] === 'empty') containsEmpty = true;
        }
    } else if (direction === 'ArrowRight') {
        edgeIndex = 6;
        rowModifier = 0;
        columnModifier = 1;
        movingClass = 'moving-right';
        axis = document.querySelectorAll(`.r${row}`);
        for (let i = column + 1; i < 7; i++) {
            if (axis[i].firstElementChild.classList[1] === 'empty') containsEmpty = true;
        }
    } else if (direction === 'ArrowUp') {
        edgeIndex = 0;
        rowModifier = -1;
        columnModifier = 0;
        movingClass = 'moving-up';
        axis = document.querySelectorAll(`.c${column}`);
        for (let i = 0; i < row; i++) {
            if (axis[i].firstElementChild.classList[1] === 'empty') containsEmpty = true;
        }
    } else if (direction === 'ArrowDown') {
        edgeIndex = 6;
        rowModifier = 1;
        columnModifier = 0;
        movingClass = 'moving-back';
        axis = document.querySelectorAll(`.c${column}`);
        for (let i = row + 1; i < 7; i++) {
            if (axis[i].firstElementChild.classList[1] === 'empty') containsEmpty = true;
        }
    }

    // if no space exists between marble and edge, removes marble from edge of board
    if (containsEmpty === false) {
        let edgeColor = axis[edgeIndex].firstElementChild.classList[1]
        if (edgeColor === 'red') {
            capturedRed = true;
        } else if (edgeColor === game.currentOpp.color) {
            knockedOffOpp = true;
        }
        axis[edgeIndex].firstElementChild.classList.remove(edgeColor);
        axis[edgeIndex].firstElementChild.classList.add('empty');
    }

    // adds transition class for sliding marbles
    let current = 'empty';
    let tempRow = row;
    let tempCol = column;
    do {
        current = document.querySelector(`.r${tempRow}.c${tempCol}`).firstElementChild.classList[1];
        if (current !== 'empty') {
            document.querySelector(`.r${tempRow}.c${tempCol}`).firstElementChild.classList.add(movingClass);

        }
        tempCol += columnModifier;
        tempRow += rowModifier;
    }
    while (current !== 'empty');

    // waits for transition to finish
    await new Promise(resolve => setTimeout(resolve, 500));

    // makes modifications to DOM for new board state
    let prev = 'empty';
    do {
        let current = document.querySelector(`.r${row}.c${column}`).firstElementChild.classList[1];
        document.querySelector(`.r${row}.c${column}`).firstElementChild.classList.remove(current);
        document.querySelector(`.r${row}.c${column}`).firstElementChild.classList.add(prev);
        if (current != 'empty') {
            document.querySelector(`.r${row}.c${column}`).firstElementChild.classList.remove(movingClass);
        }
        prev = current;
        column += columnModifier;
        row += rowModifier
    } while (prev !== 'empty');

    // determine if turn needs to change
    if (capturedRed === true) {
        game.currentTurn.addRed();
    } else if (knockedOffOpp === false) {
        [game.currentTurn, game.currentOpp] = [game.currentOpp, game.currentTurn];
    }
    
    // modify new and previous game states
    game.previousState = game.currentState;
    game.currentState = toArray();
}


async function checkMove(direction, square, game) {
    // checks move validity and makes move if valid. then makes cpu move
    let row = parseInt(square.classList[0][1]);
    let column = parseInt(square.classList[1][1]);
    let validMove = fakeMove(game.currentState, game.previousState, game.currentTurn, game.currentOpp, row, column, direction, true);
    if (validMove.valid === false) {
        game.moving = false;
        return;
    }
    await makeMove(row, column, direction, game);
    updateWinner(game);
    updateStats(game);
    while (!game.winner && game.currentTurn.color === 'white') {
        await new Promise(resolve => setTimeout(resolve, 20));
        await cpuMove(game);
    }
    game.moving = false;
}

async function cpuMove(game) {
    // finds the best move available to the cpu and executes it
    let bestMove = aiMove(game.currentState, game.previousState, game.currentTurn, game.currentOpp);
    await makeMove(bestMove.row, bestMove.column, bestMove.direction, game);
    updateWinner(game);
    updateStats(game);
}

function aiMove(currentState, previousState, currentTurn, currentOpp) {
    // sets up variables for recurisve minimax function and runs it, returning the best move
    let aiMarbles = getMarbles(currentState, currentTurn);
    let humanMarbles = getMarbles(currentState, currentOpp)
    let startingAiScore = getScore(currentTurn, currentOpp, aiMarbles, humanMarbles);
    let startingHumanScore = getScore(currentOpp, currentTurn, humanMarbles, aiMarbles);
    return minimax(currentState, previousState, currentTurn, currentOpp, startingAiScore, startingHumanScore, 3);
}

function minimax(currentBoard, previousBoard, player, opponent, startingPlayerScore, startingOpponentScore, depth) {
    // recursively checks all moves up to given depth and returns the move that will lead to the best score.

    // finds all available moves
    const availableMoves = getAllMoves(currentBoard, previousBoard, player, opponent);
    const opponentMarbles = getMarbles(currentBoard, opponent);

    // checks if game has been won or depth has been reached. if so, returns a score
    if (checkIfWinner(availableMoves, opponentMarbles, player)) {
        // sets winning score to an arbitrarily high number 
        if (player.color === 'black') {
            return { score: -100 };
        } else {
            return { score: 100 };
        }
    } else if (depth === 0) {
        // if depth has been reached, create a score based on gains made my player minus gains
        // made by opponent
        const playerMarbles = getMarbles(currentBoard, player);
        let playerScore = getScore(player, opponent, playerMarbles, opponentMarbles);
        let opponentScore = getScore(opponent, player, opponentMarbles, playerMarbles);
        if (player.color === 'black') {
            return { score: -((playerScore - startingPlayerScore) - (opponentScore - startingOpponentScore)) };
        } else {
            return { score: (playerScore - startingPlayerScore) - (opponentScore - startingOpponentScore) };
        }
    }

    // make recursive calls for all available moves and add score to an array
    const testMoves = [];
    const oldBoard = JSON.parse(JSON.stringify(currentBoard));
    for (let i = 0; i < availableMoves.length; i++) {
        let moveInfo = {};
        moveInfo.row = availableMoves[i].row;
        moveInfo.column = availableMoves[i].column;
        moveInfo.direction = availableMoves[i].direction;
        let fakeResults = availableMoves[i].results;
        let newPlayer = new Player(player.color);
        let newOpp = new Player(opponent.color);
        newPlayer.redMarbles = player.redMarbles;
        newOpp.redMarbles = opponent.redMarbles;

        if (fakeResults.capturedRed) {
            newPlayer.addRed();
        }
        if (fakeResults.knockedOffOpp || fakeResults.capturedRed) {
            const result = minimax(fakeResults.newBoard, oldBoard, newPlayer, newOpp, startingPlayerScore, startingOpponentScore, depth - 1);
            moveInfo.score = result.score;
        } else {
            const result = minimax(fakeResults.newBoard, oldBoard, newOpp, newPlayer, startingOpponentScore, startingPlayerScore, depth - 1);
            moveInfo.score = result.score;
        }
        testMoves.push(moveInfo);
    }

    let bestMove = null;

    // if all moves have the same score, picks one at random
    if (testMoves.every((val, i, arr) => val.score === arr[0].score)) {
        let rand = Math.floor(Math.random() * testMoves.length);
        return testMoves[rand];
    }

    // otherwise, picks the best move based on current player's color
    if (player.color === 'white') {
        let bestScore = -Infinity;
        for (let i = 0; i < testMoves.length; i++) {
            if (testMoves[i].score > bestScore) {
                bestScore = testMoves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < testMoves.length; i++) {
            if (testMoves[i].score < bestScore) {
                bestScore = testMoves[i].score;
                bestMove = i;
            }
        }

    }
    return testMoves[bestMove];
}

function getScore(player, opponent, playerMarbles, opponentMarbles) {
    // returns a score based on number of marbles player has knocked off 
    // minus number of marbles opponent has knocked off
    let playerKnockoffs = 8 - opponentMarbles + player.redMarbles;
    let opponentKnockoffs = 8 - playerMarbles + opponent.redMarbles;
    return playerKnockoffs - opponentKnockoffs;
}


// EVENT LISTENERS

const cells = document.querySelectorAll('td');

for (const cell of cells) {
    cell.addEventListener('click', function (e) {
        // adds click event to each td for selecting a marble
        e.stopPropagation();
        
        // if a move is being made, do nothing
        if (game.moving === true) {
            return;
        // if clicked cell is not black, deselect any selected marble
        } else if (this.firstElementChild.classList[1] !== 'black') {
            if (game.selected !== null) {
                game.selected.classList.remove('selected');
                game.selected = null;
            }
        // if no marble has been selected, select this one
        } else if (game.selected === null) {
            this.classList.add('selected')
            game.selected = this;
        // if current marble was already selected, deselect it
        } else if (game.selected === this) {
            this.classList.remove('selected');
            game.selected = null;
        // if a marble other than this has been selected, change selected to this marble
        } else if (game.selected !== null) {
            game.selected.classList.remove('selected');
            game.selected = this;
            this.classList.add('selected');
        }
    })
}

document.addEventListener('click', function () {
    // adds click event to whole document to deselect a marble
    if (game.selected !== null) {
        game.selected.classList.remove('selected');
        game.selected = null;
    }
})

document.addEventListener('keydown', function (e) {
    // adds key event for moving marble

    // if no marble is selected or a move is in process, do nothing
    if (game.selected === null || game.moving === true) {
        return;
    // else, set moving to true and attempt move
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        game.moving = true;
        game.selected.classList.remove('selected');
        let square = game.selected;
        game.selected = null;
        checkMove(e.key, square, game);
    }
})

const restartButtons = document.querySelectorAll('.restart')

for (const restartButton of restartButtons) {
    restartButton.addEventListener('click', function () {
        // restarts game on click of restart button
        location.reload();
    })
}

const rulesToggles = document.querySelectorAll('.rulestoggle')

for (const rulesToggle of rulesToggles) {
    rulesToggle.addEventListener('click', function () {
        // shows rules on click
        document.querySelector('.rules').classList.toggle('hidden');
    })
}

