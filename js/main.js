// Globals

var gBoard
// Cell:
// minesAround: 4
//isShown: true
//isMine: false
//isMarked: true
var gLevel = {
	SIZE: 4,
	MINES: 2,
}
var gGame = {
	isOn: false,
	shownCount: 0,
	markedCount: 0,
	secsPassed: 0,
}

function init() {
	gBoard = buildBoard()
	renderBoard(gBoard)
}

function buildBoard() {}

function renderBoard(board) {}

function setMinesNegsCount() {}

function cellClicked(elCell, i, j) {}

function cellMarked() {}

function expandShown(board, elCell, i, j) {}
