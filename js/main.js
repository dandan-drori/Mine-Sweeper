const MINE = '<img src="img/mine.png" alt="flag">'
const EMPTY = ''
const FLAG = '<img src="img/flag.png" alt="flag">'

var gBoard
var gLevel
var gGame
var gIsFirstClick
var gTimeInterval
var gIsUsingHint
var gIsManualMode

function init() {
	handleReRender(4, 2)
}

function buildBoard(size) {
	var board = []
	for (var i = 0; i < size; i++) {
		board[i] = []
		for (var j = 0; j < size; j++) {
			board[i][j] = {
				minesAround: 0,
				isShown: false,
				isMine: false,
				isMarked: false,
				isVisited: false,
			}
		}
	}
	return board
}

function renderBoard(board) {
	var strHtml = ''

	for (var i = 0; i < board.length; i++) {
		strHtml += `\t<tr>\n`

		for (var j = 0; j < board[0].length; j++) {
			var className = getClassName(i, j)
			strHtml += `\t\t<td class="cell ${className}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j});return false;"></td>`
		}

		strHtml += `\t</tr>\n`
	}

	document.querySelector('.board').innerHTML = strHtml
}

function getClassName(i, j) {
	return `cell-${i}-${j}`
}

function setMinesNegsCount() {
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var cell = gBoard[i][j]
			cell.minesAround = countNeighbors(i, j)
			var className = getClassName(i, j)
			var elCell = document.querySelector(`.${className}`)
			renderCell(elCell, cell)
		}
	}
}

function countNeighbors(rowIdx, colIdx) {
	var neighborsCount = 0
	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i > gBoard.length - 1) continue
		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (j < 0 || j > gBoard[0].length - 1) continue
			if (i === rowIdx && j === colIdx) continue
			if (gBoard[i][j].isMine) neighborsCount++
		}
	}
	return neighborsCount
}

function cellClicked(elCell, i, j) {
	if (!gGame.isOn) return
	var cell = gBoard[i][j]
	if (cell.isShown) return
	console.log('gIsManualMode', gIsManualMode)
	console.log('gLevel.PLACED_MINES', gLevel.PLACED_MINES)
	console.log('gLevel.MINES', gLevel.MINES)
	if (gIsManualMode && gLevel.PLACED_MINES < gLevel.MINES) {
		debugger
		useManualMode(elCell, i, j)
		gLevel.PLACED_MINES++
		return
	}
	if (gIsManualMode && gLevel.PLACED_MINES === gLevel.MINES) {
		startTime()
		setMinesNegsCount()
		gIsManualMode = false
	}
	if (gIsFirstClick && !gIsManualMode) {
		startTime()
		placeMines()
		setMinesNegsCount()
	}
	if (gIsUsingHint) {
		useHint(i, j)
		return
	}
	if (cell.isMine) mineClicked(elCell, cell)
	if (cell.isMarked) return
	if (!cell.minesAround && !cell.isMine) expandShown(i, j)

	cell.isShown = true
	gGame.shownCount++
	updateScore(1)
	renderCell(elCell, cell)
	var victoryStatus = isVictory()
	if (victoryStatus) gameOver(true)
}

function renderCell(elCell, cell) {
	var strHtml = ''
	if (cell.isShown) {
		if (cell.isMine) {
			strHtml = MINE
		} else if (!cell.minesAround) {
			strHtml = EMPTY
			elCell.style.backgroundColor = '#888'
		} else if (cell.minesAround) {
			strHtml = cell.minesAround
			elCell.style.backgroundColor = '#888'
			switch (cell.minesAround) {
				case 1:
					elCell.style.color = 'blue'
					break
				case 2:
					elCell.style.color = 'green'
					break
				case 3:
					elCell.style.color = 'red'
					break
				case 4:
					elCell.style.color = 'black'
					break
			}
		}
	} else {
		elCell.style.backgroundColor = '#aaa'
	}
	elCell.innerHTML = strHtml
}

function cellMarked(elCell, i, j) {
	if (!gGame.isOn) return
	var cell = gBoard[i][j]
	if (cell.isShown) return
	cell.isMarked = !cell.isMarked
	var strHtml
	if (!cell.isMarked) {
		strHtml = ''
		gGame.markedCount--
	} else {
		strHtml = FLAG
		gGame.markedCount++
	}
	elCell.innerHTML = strHtml
	return false // avoid right click context menu
}

function expandShown(rowIdx, colIdx) {
	gBoard[rowIdx][colIdx].isVisited = true
	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i > gBoard.length - 1) continue
		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (j < 0 || j > gBoard[0].length - 1) continue
			if (i === rowIdx && j === colIdx) continue
			var cell = gBoard[i][j]
			if (!cell.isVisited && !cell.isShown && !cell.isMarked && !cell.minesAround) expandShown(i, j)
			cell.isShown = true
			var className = getClassName(i, j)
			var elCell = document.querySelector(`.${className}`)
			renderCell(elCell, cell)
		}
	}
}

function gameOver(isWin) {
	clearInterval(gTimeInterval)
	var elRestartBtn = document.querySelector('.restart-btn')
	if (isWin) {
		gGame.isOn = false
		elRestartBtn.innerText = '😎'
		showWinGif()
	} else {
		showMines()
		gGame.isOn = false
		elRestartBtn.innerText = '🤕'
		document.querySelector('.lives span').innerHTML = '💀'
	}
	handleLocalStorage()
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
			if (cell.isMine && !cell.isMarked && !cell.isShown) return false
			if (!cell.isShown && !cell.isMine) return false
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
	var highscore = getLevelHighscore(size)
	gLevel = {
		SIZE: size,
		MINES: mines,
		HIGHSCORE: highscore,
		PLACED_MINES: 0,
	}
	gGame = {
		isOn: true,
		shownCount: 0,
		markedCount: 0,
		secsPassed: 0,
		lives: 3,
		score: 0,
		hints: 3,
		safeClicks: 3,
	}
	clearInterval(gTimeInterval)
	gIsFirstClick = true
	gIsUsingHint = false
	gBoard = buildBoard(gLevel.SIZE)
	renderBoard(gBoard)

	document.querySelector('.restart-btn').innerText = '😃'

	var elLives = document.querySelector('.lives span')
	var strHtml = ''
	for (var i = 0; i < gGame.lives; i++) {
		strHtml += '❤️ '
	}
	elLives.innerHTML = strHtml

	var elScore = document.querySelector('.score span')
	elScore.innerText = gGame.score

	document.querySelector('.highscore span').innerText = gLevel.HIGHSCORE

	hideWinGif()

	var elLightbulbs = document.querySelectorAll('.lightbulb')
	for (var i = 0; i < elLightbulbs.length; i++) {
		elLightbulbs[i].src = 'img/lightbulb.png'
		elLightbulbs[i].setAttribute('onclick', `activateHint(${i + 1})`)
	}
}

function mineClicked(elCell, cell) {
	gGame.lives--
	elLives = document.querySelector('.lives span')
	var strHtml = ''
	for (var i = 0; i < gGame.lives; i++) {
		strHtml += '❤️ '
	}

	elLives.innerHTML = strHtml
	if (!gGame.lives) {
		gameOver(false)
		return
	}

	elCell.style.backgroundColor = 'red'
	cell.isShown = true
	renderCell(elCell, cell)
}

function restartGame() {
	handleReRender(gLevel.SIZE, gLevel.MINES)
}

function updateScore(diff) {
	gGame.score += diff
	document.querySelector('.score span').innerText = gGame.score
}

function placeMines() {
	var minesCount = 0

	while (minesCount < gLevel.MINES) {
		var randRow = getRandomInt(0, gLevel.SIZE)
		var randCol = getRandomInt(0, gLevel.SIZE)
		gBoard[randRow][randCol] = {
			minesAround: 0,
			isShown: false,
			isMine: true,
			isMarked: false,
			isVisited: false,
		}
		minesCount++
	}
}

function handleLocalStorage() {
	var highscores = localStorage.getItem('highscores')

	if (!highscores) {
		var baseHighscores = {
			size4: 0,
			size8: 0,
			size12: 0,
		}
		baseHighscores[`size${gLevel.SIZE}`] = gGame.score
		var jsonBase = JSON.stringify(baseHighscores)
		localStorage.setItem('highscores', jsonBase)

		return
	}
	var parsedHighscores = JSON.parse(highscores)

	if (gGame.score > parsedHighscores[`size${gLevel.SIZE}`]) {
		parsedHighscores[`size${gLevel.SIZE}`] = gGame.score
		var jsonHighscores = JSON.stringify(parsedHighscores)
		localStorage.setItem('highscores', jsonHighscores)
	}
}

function getLevelHighscore(size) {
	var highscores = localStorage.getItem('highscores')
	if (!highscores) return 0

	var parsedHighscores = JSON.parse(highscores)
	var highscore = parsedHighscores[`size${size}`]
	return highscore
}

function showWinGif() {
	elWinModal = document.querySelector('.win-modal')
	elWinModal.style.display = 'block'

	setTimeout(hideWinGif, 5000)
}

function hideWinGif() {
	elWinModal = document.querySelector('.win-modal')
	elWinModal.style.display = 'none'
}

// when a cell is clicked using hint
function useHint(rowIdx, colIdx) {
	var isCellsShown = saveIsShown(rowIdx, colIdx)
	toggleCells(rowIdx, colIdx, true, isCellsShown)

	setTimeout(() => {
		toggleCells(rowIdx, colIdx, false, isCellsShown)
		gIsUsingHint = false
	}, 1000)
}

function toggleCells(rowIdx, colIdx, isToShow, isShownArr) {
	// the cell and its neighbors are revealed for *1 second*:
	var idx = 0

	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i > gBoard.length - 1) continue
		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (j < 0 || j > gBoard[0].length - 1) continue
			// reveal the cell and it's neighbors
			var cell = gBoard[i][j]
			cell.isShown = isToShow ? true : isShownArr[idx++]
			var className = getClassName(i, j)
			var elCell = document.querySelector(`.${className}`)
			renderCell(elCell, cell)
		}
	}
}

// when a lightbulb is clicked
function activateHint(imgNum) {
	// decrease number of hints left
	gGame.hints--

	// show indication that the bulb was clicked
	var className = `.lightbulb${imgNum}`
	var elImg = document.querySelector(className)
	elImg.src = 'img/darkbulb.png'
	elImg.style.cursor = 'default'

	// make the next click do something else:
	gIsUsingHint = true

	// make sure the lightbulb is not clickable anymore
	elImg.onclick = ''
}

function activateSafeClick() {
	if (gGame.safeClicks === 0) return
	// decrease safe click count in gGame
	gGame.safeClicks--
	// render the update safe click count on the block
	document.querySelector('.remaining').innerText = gGame.safeClicks
	// find all the non-mines cells
	var safeCells = []
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var cell = gBoard[i][j]
			if (!cell.isMine && !cell.isShown) {
				safeCells.push({ i, j })
			}
		}
	}
	// select a random cell from that array
	var randIdx = getRandomInt(0, safeCells.length)
	var randCell = safeCells[randIdx]
	var className = getClassName(randCell.i, randCell.j)
	var elCell = document.querySelector(`.${className}`)
	// make it blink
	elCell.classList.add('blink')

	setTimeout(() => elCell.classList.remove('blink'), 1005)
}

function useManualMode(elCell, i, j) {
	// the user first clicks on cells to place the mines there
	var cell = gBoard[i][j]
	cell.isMine = true
	cell.isShown = true
	renderCell(elCell, cell)

	setTimeout(() => {
		cell.isShown = false
		renderCell(elCell, cell)
	}, 1000)
}

function activateManualMode() {
	gIsManualMode = true
}

function saveIsShown(rowIdx, colIdx) {
	var isCellsShown = []

	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i > gBoard.length - 1) continue
		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (j < 0 || j > gBoard[0].length - 1) continue
			var cell = gBoard[i][j]
			isCellsShown.push(cell.isShown)
		}
	}

	return isCellsShown
}

function undo() {
	// undo cell properties
	// re-render cell

	// undo lives
	// undo
	gGame = {
		isOn: true,
		shownCount: 0,
		markedCount: 0,
		secsPassed: 0,
		lives: 3,
		score: 0,
		hints: 3,
		safeClicks: 3,
	}
}
