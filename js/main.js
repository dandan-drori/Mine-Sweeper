const MINE = '<img src="img/mine.png" alt="flag">'
const EMPTY = ''
const FLAG = '<img src="img/flag.png" alt="flag">'

var gBoard
// Cell:
// minesAround: 4
//isShown: true
//isMine: false
//isMarked: true
var gLevel
var gGame
var gIsFirstClick
var gTimeInterval

function init() {
	clearInterval(gTimeInterval)
	handleReRender(4, 2)
}

function buildBoard(size) {
	var board = []
	for (var i = 0; i < size; i++) {
		board[i] = []
		for (var j = 0; j < size; j++) {
			board[i][j] = { minesAround: 0, isShown: false, isMine: false, isMarked: false }
		}
	}
	var minesCount = 0
	while (minesCount < gLevel.MINES) {
		var randRow = getRandomInt(0, size)
		var randCol = getRandomInt(0, size)
		board[randRow][randCol] = { minesAround: 0, isShown: false, isMine: true, isMarked: false }
		minesCount++
	}
	return board
}

function renderBoard(board) {
	var strHtml = ''

	for (var i = 0; i < board.length; i++) {
		strHtml += `\t<tr>\n`

		for (var j = 0; j < board[0].length; j++) {
			var cell = board[i][j]
			var cellHtml = ''
			cell.minesAround = setMinesNegsCount(board, i, j)

			if (cell.isShown) {
				if (cell.isMine) {
					cellHtml = MINE
				} else if (!cell.minesAround) {
					cellHtml = ''
				} else if (cell.minesAround) {
					cellHtml = cell.minesAround
				}
			}
			var className = getClassName(i, j)
			strHtml += `\t\t<td class="cell ${className}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j});return false;">${cellHtml}</td>`
		}

		strHtml += `\t</tr>\n`
	}

	document.querySelector('.board').innerHTML = strHtml
}

function getLocation(selector) {
	var splited = selector.split('-')
	console.log('splited', splited)
}

function getClassName(i, j) {
	return `cell-${i}-${j}`
}

function setMinesNegsCount(board, rowIdx, colIdx) {
	var neighborsCount = 0
	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i > board.length - 1) continue
		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (j < 0 || j > board[0].length - 1) continue
			if (i === rowIdx && j === colIdx) continue
			if (board[i][j].isMine) neighborsCount++
		}
	}
	return neighborsCount
}

function countNeighbors(board, rowIdx, colIdx) {
	var neighborsCount = 0
	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i > board.length - 1) continue
		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (j < 0 || j > board[0].length - 1) continue
			if (i === rowIdx && j === colIdx) continue
			if (board[i][j].isMine) neighborsCount++
		}
	}
	return neighborsCount
}

function cellClicked(elCell, i, j) {
	if (gIsFirstClick) startTime()
	if (!gGame.isOn) return
	var cell = gBoard[i][j]
	if (cell.isMine) {
		elCell.style.backgroundColor = 'red'
		gameOver(false)
	}
	if (cell.isMarked) return
	if (!cell.minesAround && !cell.isMine) expandShown(i, j)

	cell.isShown = true
	renderCell(elCell, cell)
	var victoryStatus = isVictory()
	if (victoryStatus) gameOver(true)
}

function renderCell(elCell, cell) {
	var strHtml
	if (cell.isMine) {
		strHtml = MINE
	} else if (!cell.minesAround) {
		strHtml = EMPTY
		elCell.style.backgroundColor = '#888'
	} else {
		strHtml = cell.minesAround
	}
	elCell.innerHTML = strHtml
}

function cellMarked(elCell, i, j) {
	if (!gGame.isOn) return
	var cell = gBoard[i][j]
	cell.isMarked = !cell.isMarked
	var strHtml
	if (!cell.isMarked) {
		strHtml = ''
	} else {
		strHtml = FLAG
	}
	elCell.innerHTML = strHtml
	return false // avoid right click context menu
}

function expandShown(rowIdx, colIdx) {
	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i > gBoard.length - 1) continue
		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (j < 0 || j > gBoard[0].length - 1) continue
			if (i === rowIdx && j === colIdx) continue
			var cell = gBoard[i][j]
			cell.isShown = true
			var className = getClassName(i, j)
			var elCell = document.querySelector(`.${className}`)
			renderCell(elCell, cell)
			// if (!cell.minesAround) expandShown(i, j)
		}
	}
}

function gameOver(isWin) {
	clearInterval(gTimeInterval)
	if (isWin) {
		gGame.isOn = false
		alert('you won')
	} else {
		showMines()
		gGame.isOn = false
	}
}

function tick(start) {
	var now = Date.now()
	gGame.secsPassed = Math.floor((now - start) / 1000)
	document.querySelector('.time span').innerText = gGame.secsPassed
}

function startTime() {
	var start = Date.now()
	gTimeInterval = setInterval(() => tick(start), 1000)
	gIsFirstClick = false
}

function showMines() {
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var cell = gBoard[i][j]
			if (cell.isMine) {
				cell.isShown = true
				var className = getClassName(i, j)
				var elCell = document.querySelector(`.${className}`)
				renderCell(elCell, cell)
			}
		}
	}
}

function isVictory() {
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard.length; j++) {
			var cell = gBoard[i][j]
			// all the mines are flagged,and all the other cells are shown
			// if theres a mine that is not flagged, or a cell that is not shown
			if (cell.isMine && !cell.isMarked) return false
			else {
				if (!cell.isShown && !cell.isMine) return false
			}
		}
	}
	return true
}

function changeLevel(elBtn) {
	if (elBtn.classList.contains('size-4')) {
		handleReRender(4, 2)
	} else if (elBtn.classList.contains('size-8')) {
		handleReRender(8, 12)
	} else if (elBtn.classList.contains('size-12')) {
		handleReRender(12, 30)
	}
}

function handleReRender(size, mines) {
	clearInterval(gTimeInterval)
	gLevel = {
		SIZE: size,
		MINES: mines,
	}
	gGame = {
		isOn: true,
		shownCount: 0,
		markedCount: 0,
		secsPassed: 0,
	}
	gIsFirstClick = true
	gBoard = buildBoard(gLevel.SIZE)
	setMinesNegsCount(gBoard)
	renderBoard(gBoard)
}
