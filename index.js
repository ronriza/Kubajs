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
let previousState = null;
let currentState = toArray();
let moving = false;
let selected = null;


// GAME LOGIC


function getMarbleCount(color) {
    let count = 0;
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (document.querySelector(`.r${i}.c${j}`).firstElementChild.classList[1] === color) {
                count++;
            }
        }
    }
    return count;
}

function checkWin(player, opponent) {
    if (player.redMarbles === 7) {
        winner = { name: player.color, reason: `${player.color.charAt(0).toUpperCase() + player.color.slice(1)} collected 7 red marbles!` };
    } else if (getMarbleCount(opponent.color) === 0) {
        winner = { name: player.color, reason: `No more ${currentOpp.color} marbles!` };
    } else if (checkRemainingMoves(currentTurn) === false) {
        winner = { name: currentOpp.color, reason: `${player.color.charAt(0).toUpperCase() + player.color.slice(1)} has no more moves` };
    }
}

async function cpuMove(player, opponent) {
    let moves = [];
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (document.querySelector(`.r${i}.c${j}`).firstElementChild.classList[1] === 'white') {
                let directions = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                for (let direction of directions) {
                    let result = fakeMove(player, i, j, direction)
                    if (result.valid) {
                        if (result.capturedRed || result.knockedOffOpp) {
                            await makeMove(i, j, direction);
                            checkWin(player, opponent);
                            updateStats();
                            return;
                        }
                        moves.push({ row: i, columm: j, direction: direction });
                    }
                }
            }
        }
    }
    let rand = Math.floor(Math.random() * moves.length);
    let move = moves[rand];
    await makeMove(move.row, move.columm, move.direction);
    checkWin(player, opponent);
    updateStats();
}

function checkRemainingMoves(player) {
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (document.querySelector(`.r${i}.c${j}`).firstElementChild.classList[1] === player.color) {
                let directions = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                for (let direction of directions) {
                    if (fakeMove(player, i, j, direction).valid) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function updateStats() {
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

function fakeMove(player, row, column, direction, notify = false) {
    const result = { valid: true, capturedRed: false, knockedOffOpp: false };
    const copy_board = JSON.parse(JSON.stringify(currentState));
    let rowModifier = null;
    let columnModifier = null;
    let edgeRow = row;
    let edgeColumn = column;
    let containsEmpty = false;
    if (direction === 'ArrowLeft') {
        rowModifier = 0
        columnModifier = -1
        edgeColumn = 0
        if (column !== 6 && copy_board[row][column + 1] !== 'empty') {
            if (notify === true) alert('There is no space behind the marble');
            result.valid = false
            return result;
        }
        for (let i = 0; i < column; i++) {
            if (copy_board[row][i] === 'empty') {
                containsEmpty = true;
            }
        }
    } else if (direction === 'ArrowRight') {
        rowModifier = 0
        columnModifier = 1
        edgeColumn = 6
        if (column !== 0 && copy_board[row][column - 1] !== 'empty') {
            if (notify === true) alert('There is no space behind the marble');
            result.valid = false
            return result;
        }
        for (let i = column + 1; i < 7; i++) {
            if (copy_board[row][i] === 'empty') {
                containsEmpty = true;
            }
        }
    } else if (direction === 'ArrowUp') {
        rowModifier = -1
        columnModifier = 0
        edgeRow = 0
        if (row !== 6 && copy_board[row + 1][column] !== 'empty') {
            if (notify === true) alert('There is no space behind the marble');
            result.valid = false
            return result;
        }
        for (let i = 0; i < row; i++) {
            if (copy_board[i][column] === 'empty') {
                containsEmpty = true;
            }
        }
    } else if (direction === 'ArrowDown') {
        rowModifier = 1
        columnModifier = 0
        edgeRow = 6
        if (row !== 0 && copy_board[row - 1][column] !== 'empty') {
            if (notify === true) alert('There is no space behind the marble');
            result.valid = false
            return result;
        }
        for (let i = row + 1; i < 7; i++) {
            if (copy_board[i][column] === 'empty') {
                containsEmpty = true;
            }
        }
    }

    if (containsEmpty === false) {
        if (copy_board[edgeRow][edgeColumn] === player.color) {
            if (notify === true) alert('You cannot knock of your own marble');
            result.valid = false;
            return result;
        } else if (copy_board[edgeRow][edgeColumn] === 'red') {
            result.capturedRed = true;
        } else if (copy_board[edgeRow][edgeColumn] === currentOpp.color) {
            result.knockedOffOpp = true;
        }
        copy_board[edgeRow][edgeColumn] = 'empty';
    }
    let prev = 'empty';
    do {
        let current = copy_board[row][column];
        copy_board[row][column] = prev;
        prev = current;
        column += columnModifier;
        row += rowModifier
    } while (prev !== 'empty');

    if (JSON.stringify(copy_board) === JSON.stringify(previousState)) {
        if (notify === true) alert('You cannot return to the previous board position');
        result.valid = false
        return result;
    }
    return result;
}

async function makeMove(row, column, direction) {
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
    let color = square.firstElementChild.classList[1];
    let row = parseInt(square.classList[0][1]);
    let column = parseInt(square.classList[1][1]);
    let validMove = fakeMove(player, row, column, direction, true)
    if (validMove.valid === false) {
        moving = false;
        return;
    }
    await makeMove(row, column, direction);
    checkWin(player, opponent);
    updateStats();
    while (!winner && currentTurn.color === 'white') {
        await new Promise(resolve => setTimeout(resolve, 500));
        await cpuMove(currentTurn, currentOpp);
    }
    moving = false;

}

// EVENT LISTENERS

const cells = document.querySelectorAll('td');

for (const cell of cells) {
    cell.addEventListener('click', function (e) {
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
    if (selected !== null) {
        selected.classList.remove('selected');
        selected = null;
    }
})

document.addEventListener('keydown', function (e) {
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
        location.reload();
    })
}

const rulesToggles = document.querySelectorAll('.rulestoggle')

for (const rulesToggle of rulesToggles) {
    rulesToggle.addEventListener('click', function () {
        document.querySelector('.rules').classList.toggle('hidden');
    })
}

