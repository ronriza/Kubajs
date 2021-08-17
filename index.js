'use strict'

// SETUP

class Player {
    constructor(color) {
        this.color = color;
        this.redMarbles = 0;
    }
    addRed() {
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

let currentTurn = new Player('black');
let currentOpp = new Player('white');
let winner = null;
let currentState = toArray();
let previousState = null;
let moving = false;
let selected = null;


// GAME LOGIC


function getMarbles(currentBoard, player) {
    let playerMarbles = 0
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (currentBoard[i][j] === player.color) {
                playerMarbles++;
                
            }
        }
    }
    return playerMarbles
}

function updateWinner(player, opponent) {
    // Checks if player has captured 7 marbles or knocked of all opponent marbles, 
    // or if the current turn has no remaining moves
    if (player.redMarbles === 7) {
        winner = { name: player.color, reason: `${player.color.charAt(0).toUpperCase() + player.color.slice(1)} collected 7 red marbles!` };
    } else if (getMarbles(currentState, opponent) === 0) {
        winner = { name: player.color, reason: `No more ${currentOpp.color} marbles!` };
    } else if (checkRemainingMoves(currentTurn, currentOpp) === false) {
        winner = { name: currentOpp.color, reason: `${player.color.charAt(0).toUpperCase() + player.color.slice(1)} has no more moves` };
    }
}

function checkIfWinner(availableMoves, opponentMarbles, player) {
    if (availableMoves.length === 0) {
        return true;
    } else if (player.redMarbles === 7){
        return true;
    } else if (opponentMarbles ===0){
        return true;
    }
    return false;
    
}


function checkRemainingMoves(player, opponent) {
    // Returns true if the player has any moves screen. Otherwise returns false
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (document.querySelector(`.r${i}.c${j}`).firstElementChild.classList[1] === player.color) {
                let directions = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                for (let direction of directions) {
                    if (fakeMove(currentState, previousState, player, opponent, i, j, direction).valid) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function getAllMoves(currentBoard, previousBoard, player, opponent){
    const moves = []
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (currentBoard[i][j] === player.color) {
                let directions = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                for (let direction of directions) {
                    let results = fakeMove(currentBoard, previousBoard, player, opponent, i, j, direction)
                    if (results.valid) {
                        moves.push({row: i, column: j, direction: direction, results: results})
                    }
                }
            }
        }
    }
    return moves;
}



function updateStats() {
    // Updates the current turn and captured marbles on the UI. If a winner has been declared,
    // winner popup will appear
    if (winner) {
        document.querySelector('.winnermarble').className = 'minimarble winnermarble ' + winner.name;
        document.querySelector('.winnertext').innerHTML = winner.reason;
        document.querySelector('.gameover').classList.toggle('hidden');
    }
    if (currentTurn.color == 'black') {
        document.querySelector('.turntext').firstChild.nodeValue = 'Your Turn ';
    } else {
        document.querySelector('.turntext').firstChild.nodeValue = 'CPU\'s Turn ';
    }
    document.querySelector('.turnmarble').className = 'minimarble turnmarble ' + currentTurn.color;
    document.querySelector(`.${currentTurn.color}captured`).innerHTML = currentTurn.redMarbles;
    document.querySelector(`.${currentOpp.color}captured`).innerHTML = currentOpp.redMarbles;
}

function fakeMove(currentBoard, previousBoard, player, opponent, row, column, direction, notify = false) {
    // Attempts to make move the piece at the given row and column in the given direction.
    // Returns an object with boolean properties reflecting if the move is valid, if it
    // will result in a red marble captured, or if it will result in an opponent marble knocked off
    const copyBoard = JSON.parse(JSON.stringify(currentBoard));
    const copyPrevious = JSON.parse(JSON.stringify(previousBoard));
    const result = { valid: true, capturedRed: false, knockedOffOpp: false, newBoard: null};
    let rowModifier = null;
    let columnModifier = null;
    let edgeRow = row;
    let edgeColumn = column;
    let containsEmpty = false;
    if (direction === 'ArrowLeft') {
        rowModifier = 0
        columnModifier = -1
        edgeColumn = 0
        if (column !== 6 && copyBoard[row][column + 1] !== 'empty') {
            if (notify === true) alert('There is no space behind the marble');
            result.valid = false
            return result;
        }
        for (let i = 0; i < column; i++) {
            if (copyBoard[row][i] === 'empty') {
                containsEmpty = true;
            }
        }
    } else if (direction === 'ArrowRight') {
        rowModifier = 0
        columnModifier = 1
        edgeColumn = 6
        if (column !== 0 && copyBoard[row][column - 1] !== 'empty') {
            if (notify === true) alert('There is no space behind the marble');
            result.valid = false
            return result;
        }
        for (let i = column + 1; i < 7; i++) {
            if (copyBoard[row][i] === 'empty') {
                containsEmpty = true;
            }
        }
    } else if (direction === 'ArrowUp') {
        rowModifier = -1
        columnModifier = 0
        edgeRow = 0
        if (row !== 6 && copyBoard[row + 1][column] !== 'empty') {
            if (notify === true) alert('There is no space behind the marble');
            result.valid = false
            return result;
        }
        for (let i = 0; i < row; i++) {
            if (copyBoard[i][column] === 'empty') {
                containsEmpty = true;
            }
        }
    } else if (direction === 'ArrowDown') {
        rowModifier = 1
        columnModifier = 0
        edgeRow = 6
        if (row !== 0 && copyBoard[row - 1][column] !== 'empty') {
            if (notify === true) alert('There is no space behind the marble');
            result.valid = false
            return result;
        }
        for (let i = row + 1; i < 7; i++) {
            if (copyBoard[i][column] === 'empty') {
                containsEmpty = true;
            }
        }
    }

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
    let prev = 'empty';
    do {
        let current = copyBoard[row][column];
        copyBoard[row][column] = prev;
        prev = current;
        column += columnModifier;
        row += rowModifier
    } while (prev !== 'empty');

    if (JSON.stringify(copyBoard) === JSON.stringify(copyPrevious)) {
        if (notify === true) alert('You cannot return to the previous board position');
        result.valid = false
        return result;
    }
    result.newBoard = copyBoard
    return result;
}

async function makeMove(row, column, direction) {
    // Executes a move on screen by modifying the DOM
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
        movingClass = 'moving-left'
        axis = document.querySelectorAll(`.r${row}`);
        for (let i = 0; i < column; i++) {
            if (axis[i].firstElementChild.classList[1] === 'empty') containsEmpty = true;
        }
    } else if (direction === 'ArrowRight') {
        edgeIndex = 6;
        rowModifier = 0;
        columnModifier = 1;
        movingClass = 'moving-right'
        axis = document.querySelectorAll(`.r${row}`);
        for (let i = column + 1; i < 7; i++) {
            if (axis[i].firstElementChild.classList[1] === 'empty') containsEmpty = true;
        }
    } else if (direction === 'ArrowUp') {
        edgeIndex = 0;
        rowModifier = -1;
        columnModifier = 0;
        movingClass = 'moving-up'
        axis = document.querySelectorAll(`.c${column}`);
        for (let i = 0; i < row; i++) {
            if (axis[i].firstElementChild.classList[1] === 'empty') containsEmpty = true;
        }
    } else if (direction === 'ArrowDown') {
        edgeIndex = 6;
        rowModifier = 1;
        columnModifier = 0;
        movingClass = 'moving-back'
        axis = document.querySelectorAll(`.c${column}`);
        for (let i = row + 1; i < 7; i++) {
            if (axis[i].firstElementChild.classList[1] === 'empty') containsEmpty = true;
        }
    }

    if (containsEmpty === false) {
        let edgeColor = axis[edgeIndex].firstElementChild.classList[1]
        if (edgeColor === 'red') {
            capturedRed = true;
        } else if (edgeColor === currentOpp.color) {
            knockedOffOpp = true;
        }
        axis[edgeIndex].firstElementChild.classList.remove(edgeColor);
        axis[edgeIndex].firstElementChild.classList.add('empty');
    }
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


    await new Promise(resolve => setTimeout(resolve, 500));

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

    if (capturedRed === true) {
        currentTurn.addRed();
    } else if (knockedOffOpp === false) {
        [currentTurn, currentOpp] = [currentOpp, currentTurn];
    }
    previousState = currentState;
    currentState = toArray();
}


async function checkMove(direction, square) {
    let player = currentTurn;
    let opponent = currentOpp;
    let row = parseInt(square.classList[0][1]);
    let column = parseInt(square.classList[1][1]);
    let validMove = fakeMove(currentState, previousState, player, opponent, row, column, direction, true)
    if (validMove.valid === false) {
        moving = false;
        return;
    }
    await makeMove(row, column, direction);
    updateWinner(player, opponent);
    updateStats();
    while (!winner && currentTurn.color === 'white') {
        await new Promise(resolve => setTimeout(resolve, 1));
        await cpuMove(currentState, previousState, currentTurn, currentOpp);
    }
    moving = false;

}

async function cpuMove(currentState, previousState, currentTurn, currentOpp){
    let bestMove = aiMove(currentState, previousState, currentTurn, currentOpp)
    await makeMove(bestMove.row, bestMove.column, bestMove.direction)
    updateWinner(currentTurn, currentOpp);
    updateStats();
}

// EVENT LISTENERS

const cells = document.querySelectorAll('td');

for (const cell of cells) {
    cell.addEventListener('click', function (e) {
        // adds click event to each td for selecting a marble
        e.stopPropagation();
        if (moving === true) {
            return;
        } else if (this.firstElementChild.classList[1] !== 'black') {
            if (selected !== null) {
                selected.classList.remove('selected');
                selected = null;
            }
        } else if (selected === null) {
            this.classList.add('selected')
            selected = this;
        } else if (selected === this) {
            this.classList.remove('selected');
            selected = null;
        } else if (selected !== null) {
            selected.classList.remove('selected');
            selected = this;
            this.classList.add('selected');
        }
    })
}

document.addEventListener('click', function () {
    // adds click event to whole document to deselect a marble
    if (selected !== null) {
        selected.classList.remove('selected');
        selected = null;
    }
})

document.addEventListener('keydown', function (e) {
    // adds key event for moving marble
    if (selected === null || moving === true) {
        return;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        moving = true;
        selected.classList.remove('selected');
        let square = selected;
        selected = null;
        checkMove(e.key, square);
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



function aiMove(currentState, previousState, currentTurn, currentOpp) {
    let aiMarbles = getMarbles(currentState, currentTurn)
    let humanMarbles = getMarbles(currentState, currentOpp)
    let startingAiScore = getScore(currentTurn, currentOpp, aiMarbles, humanMarbles)
    let startingHumanScore = getScore(currentOpp, currentTurn, humanMarbles, aiMarbles)
    return minimax(currentState, previousState, currentTurn, currentOpp, startingAiScore, startingHumanScore, 3)

}


function minimax(currentBoard, previousBoard, player, opponent, startingPlayerScore, startingOpponentScore, depth) {

    const availableMoves = getAllMoves(currentBoard, previousBoard, player, opponent);
    const opponentMarbles = getMarbles(currentBoard, opponent)
    if (checkIfWinner(availableMoves, opponentMarbles, player)){
        if (player.color === 'black'){
            return {score: -100}
        } else {
            return {score: 100}
        }
    } else if (depth === 0) {
        const playerMarbles = getMarbles(currentBoard, player)
        let playerScore = getScore(player, opponent, playerMarbles, opponentMarbles)
        let opponentScore = getScore(opponent, player, opponentMarbles, playerMarbles)
        if (player.color === 'black'){
            return {score: -((playerScore - startingPlayerScore) - (opponentScore - startingOpponentScore))}
        } else {
            return {score: (playerScore - startingPlayerScore) - (opponentScore - startingOpponentScore)}
        }
        
    }

    const testMoves = []
    const oldBoard = JSON.parse(JSON.stringify(currentBoard));
    for (let i=0; i<availableMoves.length; i++){
        let moveInfo = {}
        moveInfo.row = availableMoves[i].row
        moveInfo.column = availableMoves[i].column
        moveInfo.direction = availableMoves[i].direction
        let fakeResults = availableMoves[i].results
        let newPlayer = new Player(player.color)
        let newOpp = new Player(opponent.color)
        newPlayer.redMarbles = player.redMarbles
        newOpp.redMarbles = opponent.redMarbles

        if (fakeResults.capturedRed) {
            newPlayer.redMarbles++;
        }

        if (fakeResults.knockedOffOpp || fakeResults.capturedRed) {
            const result = minimax(fakeResults.newBoard, oldBoard, newPlayer, newOpp, startingPlayerScore, startingOpponentScore, depth-1)
            moveInfo.score = result.score
        } else {
            const result = minimax(fakeResults.newBoard, oldBoard, newOpp, newPlayer, startingOpponentScore, startingPlayerScore, depth-1)
            moveInfo.score = result.score
        }
        testMoves.push(moveInfo)
    }

    let bestMove = null;

    console.log(testMoves)

    if (testMoves.every((val, i, arr) => val.score === arr[0].score)){
        let rand = Math.floor(Math.random() * testMoves.length);
        return testMoves[rand]
    }

    if (player.color === 'white') {
        let bestScore = -Infinity
        for (let i=0; i< testMoves.length; i++){
            if (testMoves[i].score > bestScore){
                bestScore = testMoves[i].score
                bestMove = i
            }
        }
    } else {
        let bestScore = Infinity
        for (let i=0; i< testMoves.length; i++){
            if (testMoves[i].score < bestScore){
                bestScore = testMoves[i].score
                bestMove = i
            }
        }

    }
    return testMoves[bestMove]
}



function getScore(player, opponent, playerMarbles, opponentMarbles) {
    let playerKnockoffs = 8 - opponentMarbles + player.redMarbles
    let opponentKnockoffs = 8 - playerMarbles + opponent.redMarbles 
    return playerKnockoffs - opponentKnockoffs
}






