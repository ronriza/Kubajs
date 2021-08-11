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


async function cpuMove(player, opponent){
    let moves = []
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (document.querySelector(`.r${i}.c${j}`).firstElementChild.classList[1] === 'white') {
                let directions = ['L', 'R', 'F', 'B'];
                for (let direction of directions) {
                    if (fakeMove(player, i, j, direction).valid) {
                        moves.push({row: i, columm: j, direction: direction})
                    }
                }
            }
        }
    }
    let rand = Math.floor(Math.random() * moves.length)
    let move = moves[rand]
    await makeMove(move.row, move.columm, move.direction)
    if (player.redMarbles === 7) {
        winner = {name: player.color, reason: `${player.color.chartAt(0).toUpperCase() + player.color.slice(1)} collected 7 red marbles!`}
    } else if (getMarbleCount(opponent.color) === 0) {
        winner = {name: player.color, reason: `No more ${currentOpp.color} marbles!`}
    } else if (checkRemainingMoves(currentTurn) === false) {
        winner = {name: currentOpp.color, reason: `${player.color.chartAt(0).toUpperCase() + player.color.slice(1)} has no more moves`}
    }
    updateStats();

}

function checkRemainingMoves(player) {
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (document.querySelector(`.r${i}.c${j}`).firstElementChild.classList[1] === player.color) {
                let directions = ['L', 'R', 'F', 'B'];
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
        document.querySelector('.winnermarble').className = 'minimarble winnermarble ' + winner.name
        document.querySelector('.winnertext').innerHTML = winner.reason
        document.querySelector('.gameover').classList.toggle('hidden')
    }

    document.querySelector('.turnmarble').className = 'minimarble turnmarble ' + currentTurn.color;
    document.querySelector(`.${currentTurn.color}captured`).innerHTML = currentTurn.redMarbles
    document.querySelector(`.${currentOpp.color}captured`).innerHTML = currentOpp.redMarbles
}

function fakeMove(player, row, column, direction, notify = false) {
    const result = {valid: true, capturedRed: false, knockedOffOpp: false};
    const copy_board = JSON.parse(JSON.stringify(currentState));
    if (direction === 'L') {
        if (column === 6 || copy_board[row][column + 1] === 'empty') {
            let containsEmpty = false;
            for (let i = 0; i < column; i++) {
                if (copy_board[row][i] === 'empty') {
                    containsEmpty = true;
                }
            }
            if (containsEmpty === false) {
                if (copy_board[row][0] === player.color) {
                    if (notify === true) {
                        alert('Can\'t knock of your own marble!');
                    }
                    result.valid = false
                    return result;
                }
            }
            copy_board[row][0] = 'empty';
            let prev = 'empty';
            do {
                let current = copy_board[row][column];
                copy_board[row][column] = prev;
                prev = current;
                column--;
            } while (prev !== 'empty');
        } else {
            if (notify === true) {
                alert('No space!');
            }
            result.valid = false
            return result;
        }
    } else if (direction === 'R') {
        if (column === 0 || copy_board[row][column - 1] === 'empty') {
            let containsEmpty = false;
            for (let i = column + 1; i < 7; i++) {
                if (copy_board[row][i] === 'empty') {
                    containsEmpty = true;
                }
            }
            if (containsEmpty === false) {
                if (copy_board[row][6] === player.color) {
                    if (notify === true) {
                        alert('Can\'t knock off your own marble');
                    }
                    result.valid = false
                    return result;
                }
            }
            copy_board[row][6] = 'empty';
            let prev = 'empty';
            do {
                let current = copy_board[row][column];
                copy_board[row][column] = prev;
                prev = current;
                column++;
            } while (prev !== 'empty');

        } else {
            if (notify === true) {
                alert('No space!');
            }
            result.valid = false
            return result;
        }
    } else if (direction === 'F') {
        if (row === 6 || copy_board[row + 1][column] === 'empty') {
            let containsEmpty = false;
            for (let i = 0; i < row; i++) {
                if (copy_board[i][column] === 'empty') {
                    containsEmpty = true;
                }
            }
            if (containsEmpty === false) {
                if (copy_board[0][column] === player.color) {
                    if (notify === true) {
                        alert('Can\'t knock off your own marble');
                    }
                    result.valid = false
                    return result;
                }
            }
            copy_board[0][column] = 'empty';
            let prev = 'empty';
            do {
                let current = copy_board[row][column];
                copy_board[row][column] = prev;
                prev = current;
                row--;
            } while (prev !== 'empty');

        } else {
            if (notify === true) {
                alert('No space!');
            }
            result.valid = false
            return result;
        }
    } else if (direction === 'B') {
        if (row === 0 || copy_board[row - 1][column] === 'empty') {
            let containsEmpty = false;
            for (let i = row + 1; i < 7; i++) {
                if (copy_board[i][column] === 'empty') {
                    containsEmpty = true;
                }
            }
            if (containsEmpty === false) {
                if (copy_board[6][column] === player.color) {
                    if (notify === true) {
                        alert('Can\'t knock off your own marble');
                    }
                    result.valid = false
                    return result;
                }
            }
            copy_board[6][column] = 'empty';
            let prev = 'empty';
            do {
                let current = copy_board[row][column];
                copy_board[row][column] = prev;
                prev = current;
                row++;
            } while (prev !== 'empty');

        } else {
            if (notify === true) {
                alert('No space!');
            }
            result.valid = false
            return result;
        }
    }
    if (JSON.stringify(copy_board) === JSON.stringify(previousState)) {
        if (notify === true) {
            alert('Ko rule violated');
        }
        result.valid = false
        return result;
    }
    return result;
}

async function makeMove(row, column, direction) {
    let capturedRed = false;
    let knockedOffOpp = false;
    if (direction === 'L') {
        let fullRow = document.querySelectorAll(`.r${row}`);
        let containsEmpty = false;
        for (let i = 0; i < column; i++) {
            if (fullRow[i].firstElementChild.classList[1] === 'empty') {
                containsEmpty = true;
            }
        }
        if (containsEmpty === false) {
            let edgeColor = fullRow[0].firstElementChild.classList[1]
            if (edgeColor === 'red') {
                capturedRed = true;
            } else if (edgeColor === currentOpp.color) {
                knockedOffOpp = true;
            }
            fullRow[0].firstElementChild.classList.remove(edgeColor);
            fullRow[0].firstElementChild.classList.add('empty');
        }
        let current = 'empty';
        let tempRow = row;
        let tempCol = column;
        do {
            current = document.querySelector(`.r${tempRow}.c${tempCol}`).firstElementChild.classList[1];
            if (current !== 'empty') {
                document.querySelector(`.r${tempRow}.c${tempCol}`).firstElementChild.classList.add('moving-left');
            }
            tempCol--;
        }
        while (current !== 'empty');
        await new Promise(resolve => setTimeout(resolve, 500));
        let prev = 'empty';
        do {
            let current = document.querySelector(`.r${row}.c${column}`).firstElementChild.classList[1];
            document.querySelector(`.r${row}.c${column}`).firstElementChild.classList.remove(current);
            document.querySelector(`.r${row}.c${column}`).firstElementChild.classList.add(prev);
            if (current != 'empty') {
                document.querySelector(`.r${row}.c${column}`).firstElementChild.classList.remove('moving-left');
            }
            prev = current;
            column--;
        } while (prev !== 'empty');
    } else if (direction === 'R') {
        let fullRow = document.querySelectorAll(`.r${row}`);
        let containsEmpty = false;
        for (let i = column + 1; i < 7; i++) {
            if (fullRow[i].firstElementChild.classList[1] === 'empty') {
                containsEmpty = true;
            }
        }
        if (containsEmpty === false) {
            let edgeColor = fullRow[6].firstElementChild.classList[1]
            if (edgeColor === 'red') {
                capturedRed = true;
            } else if (edgeColor === currentOpp.color) {
                knockedOffOpp = true;
            }
            fullRow[6].firstElementChild.classList.remove(edgeColor);
            fullRow[6].firstElementChild.classList.add('empty');
        }
        let current = 'empty';
        let tempRow = row;
        let tempCol = column;
        do {
            current = document.querySelector(`.r${tempRow}.c${tempCol}`).firstElementChild.classList[1];
            if (current !== 'empty') {

                document.querySelector(`.r${tempRow}.c${tempCol}`).firstElementChild.classList.add('moving-right');
            }
            tempCol++;
        } while (current !== 'empty');
        await new Promise(resolve => setTimeout(resolve, 500));
        let prev = 'empty';
        do {
            let current = document.querySelector(`.r${row}.c${column}`).firstElementChild.classList[1];
            document.querySelector(`.r${row}.c${column}`).firstElementChild.classList.remove(current);
            document.querySelector(`.r${row}.c${column}`).firstElementChild.classList.add(prev);
            if (current != 'empty') {
                document.querySelector(`.r${row}.c${column}`).firstElementChild.classList.remove('moving-right');
            }
            prev = current;
            column++;
        } while (prev !== 'empty');
    } else if (direction === 'F') {
        let fullColumn = document.querySelectorAll(`.c${column}`);
        let containsEmpty = false;
        for (let i = 0; i < row; i++) {
            if (fullColumn[i].firstElementChild.classList[1] === 'empty') {
                containsEmpty = true;
            }
        }
        if (containsEmpty === false) {
            let edgeColor = fullColumn[0].firstElementChild.classList[1]
            if (edgeColor === 'red') {
                capturedRed = true;
            } else if (edgeColor === currentOpp.color) {
                knockedOffOpp = true;
            }
            fullColumn[0].firstElementChild.classList.remove(edgeColor);
            fullColumn[0].firstElementChild.classList.add('empty');
        }
        let current = 'empty';
        let tempRow = row;
        let tempCol = column;
        do {
            current = document.querySelector(`.r${tempRow}.c${tempCol}`).firstElementChild.classList[1];
            if (current !== 'empty') {
                document.querySelector(`.r${tempRow}.c${tempCol}`).firstElementChild.classList.add('moving-up');
            }
            tempRow--;
        } while (current !== 'empty');
        await new Promise(resolve => setTimeout(resolve, 500));
        let prev = 'empty';
        do {
            let current = document.querySelector(`.r${row}.c${column}`).firstElementChild.classList[1];
            document.querySelector(`.r${row}.c${column}`).firstElementChild.classList.remove(current);
            document.querySelector(`.r${row}.c${column}`).firstElementChild.classList.add(prev);
            if (current != 'empty') {
                document.querySelector(`.r${row}.c${column}`).firstElementChild.classList.remove('moving-up');
            }
            prev = current;
            row--;;
        } while (prev !== 'empty');
    } else if (direction === 'B') {
        let fullColumn = document.querySelectorAll(`.c${column}`);
        let containsEmpty = false;
        for (let i = row + 1; i < 7; i++) {
            if (fullColumn[i].firstElementChild.classList[1] === 'empty') {
                containsEmpty = true;
            }
        }
        if (containsEmpty === false) {
            let edgeColor = fullColumn[6].firstElementChild.classList[1]
            if (edgeColor === 'red') {
                capturedRed = true;
            } else if (edgeColor === currentOpp.color) {
                knockedOffOpp = true;
            }
            fullColumn[6].firstElementChild.classList.remove(edgeColor);
            fullColumn[6].firstElementChild.classList.add('empty');
        }
        let current = 'empty';
        let tempRow = row;
        let tempCol = column;
        do {
            current = document.querySelector(`.r${tempRow}.c${tempCol}`).firstElementChild.classList[1];
            if (current !== 'empty') {
                document.querySelector(`.r${tempRow}.c${tempCol}`).firstElementChild.classList.add('moving-back');
            }
            tempRow++;
        } while (current !== 'empty');
        await new Promise(resolve => setTimeout(resolve, 500));
        let prev = 'empty';
        do {
            let current = document.querySelector(`.r${row}.c${column}`).firstElementChild.classList[1];
            document.querySelector(`.r${row}.c${column}`).firstElementChild.classList.remove(current);
            document.querySelector(`.r${row}.c${column}`).firstElementChild.classList.add(prev);
            if (current != 'empty') {
                document.querySelector(`.r${row}.c${column}`).firstElementChild.classList.remove('moving-back');
            }
            prev = current;
            row++;
        } while (prev !== 'empty');
    }

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
    if (color !== currentTurn.color) {
        alert('Not your marble!');
        moving = false;
        return;
    }
    let validMove = fakeMove(player, row, column, direction, true)
    if (validMove.valid === false) {
        moving = false;
        return;
    }
    await makeMove(row, column, direction)
    if (player.redMarbles === 7) {
        winner = {name: player.color, reason: `${player.color.charAt(0).toUpperCase() + player.color.slice(1)} collected 7 red marbles!`}
    } else if (getMarbleCount(opponent.color) === 0) {
        winner = {name: player.color, reason: `No more ${currentOpp.color} marbles!`}
    } else if (checkRemainingMoves(currentTurn) === false) {
        winner = {name: currentOpp.color, reason: `${player.color.charAt(0).toUpperCase() + player.color.slice(1)} has no more moves`}
    }
    updateStats();
    while (!winner && currentTurn.color === 'white'){
        await new Promise(resolve => setTimeout(resolve, 500));
        await cpuMove(currentTurn, currentOpp)
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
        } else if (this.firstElementChild.classList[1] === 'empty' || this.firstElementChild.classList[1] === 'red') {
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
    } else if (e.key === 'ArrowUp') {
        moving = true;
        selected.classList.remove('selected');
        let square = selected;
        selected = null;
        checkMove('F', square);
    } else if (e.key === 'ArrowDown') {
        moving = true;
        selected.classList.remove('selected');
        let square = selected;
        selected = null;
        checkMove('B', square);
    } else if (e.key === 'ArrowLeft') {
        moving = true;
        selected.classList.remove('selected');
        let square = selected;
        selected = null;
        checkMove('L', square);
    } else if (e.key === 'ArrowRight') {
        moving = true;
        selected.classList.remove('selected');
        let square = selected;
        selected = null;
        checkMove('R', square);
    }
})

const restartButtons = document.querySelectorAll('.restart')

for (const restartButton of restartButtons) {
    restartButton.addEventListener('click', function () {
        location.reload();
    })
}

document.querySelector('.showrules').addEventListener('click', function () {
    document.querySelector('.rules').classList.toggle('hidden')
})

document.querySelector('.hiderules').addEventListener('click', function () {
    document.querySelector('.rules').classList.toggle('hidden')
})