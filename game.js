class RoutingGame {
    constructor() {
        this.leaderboard = new Leaderboard();
        this.playerName = '';
        this.gridSize = 6;
        this.setupLoginScreen();
    }

    setupLoginScreen() {
        const loginScreen = document.getElementById('login-screen');
        const gameScreen = document.getElementById('game-screen');
        const startButton = document.getElementById('start-game');
        const playerNameInput = document.getElementById('player-name');
        const gridSizeSelect = document.getElementById('grid-size');

        // Show leaderboard
        this.leaderboard.renderLeaderboard();

        startButton.addEventListener('click', () => {
            const name = playerNameInput.value.trim();
            if (!name) {
                alert('Please enter your name!');
                return;
            }

            this.playerName = name;
            this.gridSize = parseInt(gridSizeSelect.value);
            
            // Set CSS variable for grid size
            document.documentElement.style.setProperty('--grid-size', this.gridSize);
            
            // Initialize game with selected grid size
            this.initializeGameState();
            
            // Hide login screen and show game screen
            loginScreen.style.display = 'none';
            gameScreen.style.display = 'block';
            
            // Update player display
            document.getElementById('player-display').textContent = this.playerName;
        });
    }

    initializeGameState() {
        this.grid = [];
        this.currentLevel = 1;
        this.routingCoins = 2000;
        this.hintsLeft = 4;
        this.playerPosition = [0, 0];
        this.path = [[0, 0]];
        this.shortestPath = [];
        this.shortestPathLength = 0;
        this.isDragging = false;
        this.isErasing = false;
        this.gameGrid = document.getElementById('game-grid');
        this.currentLevelElement = document.getElementById('current-level');
        this.routingCoinsElement = document.getElementById('routing-coins');
        this.hintsLeftElement = document.getElementById('hints-left');
        this.pathLengthElement = document.getElementById('path-length');
        this.shortestPathElement = document.getElementById('shortest-path');
        this.hintBtn = document.getElementById('hint-btn');
        this.buyHintBtn = document.getElementById('buy-hint-btn');
        this.nextLevelBtn = document.getElementById('next-level-btn');
        this.exitGameBtn = document.getElementById('exit-game-btn');
        this.lastRoutedCell = null;
        this.possibleMovesTimeout = null;
        this.knightMovementEnabled = false;
        this.knightMovementToggle = document.getElementById('knight-movement');
        this.hoverAssistanceEnabled = true;
        this.hoverAssistanceToggle = document.getElementById('hover-assistance');
        this.hasStartedMoving = false;

        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.generateGrid();
        this.findShortestPath();
        this.updateUI();
        this.renderGrid();
    }

    generateGrid() {
        const density = 0.25 + (this.currentLevel * 0.02);
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(1));

        // Block cells randomly
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (Math.random() < density && !(i === 0 && j === 0) && !(i === this.gridSize - 1 && j === this.gridSize - 1)) {
                    this.grid[i][j] = 0;
                }
            }
        }

        // Ensure at least 4 valid paths exist
        while (!this.hasEnoughPaths()) {
            this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(1));
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    if (Math.random() < density && !(i === 0 && j === 0) && !(i === this.gridSize - 1 && j === this.gridSize - 1)) {
                        this.grid[i][j] = 0;
                    }
                }
            }
        }
    }

    hasEnoughPaths() {
        const paths = this.findAllPaths();
        return paths.length >= 4;
    }

    findAllPaths() {
        const paths = [];
        const visited = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(false));
        
        const dfs = (x, y, currentPath) => {
            if (x === this.gridSize - 1 && y === this.gridSize - 1) {
                paths.push([...currentPath]);
                return;
            }

            const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            for (const [dx, dy] of directions) {
                const newX = x + dx;
                const newY = y + dy;
                if (this.isValid(newX, newY) && !visited[newX][newY]) {
                    visited[newX][newY] = true;
                    currentPath.push([newX, newY]);
                    dfs(newX, newY, currentPath);
                    currentPath.pop();
                    visited[newX][newY] = false;
                }
            }
        };

        dfs(0, 0, [[0, 0]]);
        return paths;
    }

    findShortestPath() {
        const queue = [[0, 0]];
        const visited = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(false));
        const parent = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
        const distance = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(Infinity));
        visited[0][0] = true;
        distance[0][0] = 0;

        while (queue.length > 0) {
            const [x, y] = queue.shift();
            if (x === this.gridSize - 1 && y === this.gridSize - 1) break;

            const moves = this.getPossibleMoves(x, y);
            for (const [newX, newY] of moves) {
                if (!visited[newX][newY]) {
                    visited[newX][newY] = true;
                    parent[newX][newY] = [x, y];
                    distance[newX][newY] = distance[x][y] + 1;
                    queue.push([newX, newY]);
                }
            }
        }

        // Reconstruct path
        this.shortestPath = [];
        let current = [this.gridSize - 1, this.gridSize - 1];
        while (current) {
            this.shortestPath.unshift(current);
            current = parent[current[0]][current[1]];
        }
        this.shortestPathLength = this.shortestPath.length - 1;
    }

    isValid(x, y) {
        return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize && this.grid[x][y] === 1;
    }

    setupEventListeners() {
        this.hintBtn.addEventListener('click', () => this.getHint());
        this.buyHintBtn.addEventListener('click', () => this.buyHint());
        this.nextLevelBtn.addEventListener('click', () => this.nextLevel());
        
        // Add drag event listeners
        this.gameGrid.addEventListener('mousedown', (e) => this.handleDragStart(e));
        this.gameGrid.addEventListener('mousemove', (e) => this.handleDragMove(e));
        this.gameGrid.addEventListener('mouseup', () => this.handleDragEnd());
        this.gameGrid.addEventListener('mouseleave', () => this.handleDragEnd());
        
        // Add right-click and shift key listeners
        this.gameGrid.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleErase();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.shiftKey) {
                this.isErasing = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (!e.shiftKey) {
                this.isErasing = false;
            }
        });

        // Modify knight movement toggle listener
        this.knightMovementToggle.addEventListener('change', () => {
            if (this.hasStartedMoving) {
                this.knightMovementToggle.checked = this.knightMovementEnabled;
                alert('Knight movement can only be enabled before taking the first step!');
                return;
            }
            
            this.knightMovementEnabled = this.knightMovementToggle.checked;
            this.initializeGame(); // Reinitialize game to update shortest path with new movement rules
        });

        // Modify hover assistance toggle listener
        this.hoverAssistanceToggle.addEventListener('change', () => {
            if (this.hasStartedMoving) {
                this.hoverAssistanceToggle.checked = this.hoverAssistanceEnabled;
                alert('Hover assistance can only be changed before taking the first step!');
                return;
            }
            
            this.hoverAssistanceEnabled = this.hoverAssistanceToggle.checked;
            
            // Update event listeners for the last routed cell
            const lastCell = this.path[this.path.length - 1];
            if (lastCell) {
                const cell = document.querySelector(`[data-x="${lastCell[0]}"][data-y="${lastCell[1]}"]`);
                if (cell) {
                    // Remove existing event listeners
                    const newCell = cell.cloneNode(true);
                    cell.parentNode.replaceChild(newCell, cell);
                    
                    // Add new event listeners if hover assistance is enabled
                    if (this.hoverAssistanceEnabled) {
                        newCell.addEventListener('mouseenter', () => this.showPossibleMoves(lastCell[0], lastCell[1]));
                        newCell.addEventListener('mouseleave', () => this.clearPossibleMoves());
                    }
                    
                    // Add click event listener
                    newCell.addEventListener('click', () => this.handleCellClick(lastCell[0], lastCell[1]));
                }
            }
        });

        // Add exit game button listener
        this.exitGameBtn.addEventListener('click', () => this.exitGame());
    }

    getHint() {
        if (this.hintsLeft > 0) {
            this.showHint();
            this.hintsLeft--;
            this.updateUI();
            // Disable hint button if no hints left
            if (this.hintsLeft === 0) {
                this.hintBtn.disabled = true;
                this.hintBtn.textContent = 'No Hints Left';
            }
        } else {
            alert('No free hints left! Buy more hints with RoutingCoins.');
        }
    }

    buyHint() {
        if (this.routingCoins >= 400) {
            this.routingCoins -= 400;
            this.showHint();
            this.updateUI();
        } else {
            alert('Not enough RoutingCoins!');
        }
    }

    showHint() {
        const currentIndex = this.path.length - 1;
        if (currentIndex < this.shortestPath.length - 1) {
            const nextCell = this.shortestPath[currentIndex + 1];
            const cell = document.querySelector(`[data-x="${nextCell[0]}"][data-y="${nextCell[1]}"]`);
            cell.classList.add('hint');
            setTimeout(() => cell.classList.remove('hint'), 2000);
        }
    }

    nextLevel() {
        if (this.currentLevel < 10) {
            this.currentLevel++;
            this.hintsLeft = 4;
            this.path = [[0, 0]];
            this.playerPosition = [0, 0];
            this.hasStartedMoving = false;
            this.knightMovementToggle.disabled = false;
            this.hoverAssistanceToggle.disabled = false;
            this.initializeGame();
            this.nextLevelBtn.disabled = true;
            this.hintBtn.disabled = false;
            this.hintBtn.textContent = 'Get Hint (Free: 4 left)';
        }
    }

    updateUI() {
        this.currentLevelElement.textContent = this.currentLevel;
        this.routingCoinsElement.textContent = this.routingCoins;
        this.hintsLeftElement.textContent = this.hintsLeft;
        this.pathLengthElement.textContent = this.path.length - 1;
        this.shortestPathElement.textContent = this.shortestPathLength;
    }

    renderGrid() {
        this.gameGrid.innerHTML = '';
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = i;
                cell.dataset.y = j;

                if (i === 0 && j === 0) {
                    cell.classList.add('start');
                } else if (i === this.gridSize - 1 && j === this.gridSize - 1) {
                    cell.classList.add('end');
                } else if (this.grid[i][j] === 0) {
                    cell.classList.add('blocked');
                } else {
                    cell.classList.add('routable');
                }

                if (i === this.playerPosition[0] && j === this.playerPosition[1]) {
                    cell.classList.add('player');
                    if (this.knightMovementEnabled) {
                        cell.classList.add('knight');
                    }
                }

                if (this.path.some(([x, y]) => x === i && y === j)) {
                    cell.classList.add('path');
                }

                // Add hover event for last routed cell only if hover assistance is enabled
                if (this.isLastRoutedCell(i, j)) {
                    if (this.hoverAssistanceEnabled) {
                        cell.addEventListener('mouseenter', () => this.showPossibleMoves(i, j));
                        cell.addEventListener('mouseleave', () => this.clearPossibleMoves());
                    }
                }

                cell.addEventListener('click', () => this.handleCellClick(i, j));
                this.gameGrid.appendChild(cell);
            }
        }
    }

    handleDragStart(e) {
        const cell = e.target.closest('.cell');
        if (!cell) return;

        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);

        if (this.isValid(x, y)) {
            this.isDragging = true;
            if (this.isErasing) {
                this.handleErase();
            } else {
                this.handleCellClick(x, y);
            }
        }
    }

    handleDragMove(e) {
        if (!this.isDragging) return;

        const cell = e.target.closest('.cell');
        if (!cell) return;

        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);

        if (this.isValid(x, y)) {
            if (this.isErasing) {
                this.handleErase();
            } else {
                this.handleCellClick(x, y);
            }
        }
    }

    handleDragEnd() {
        this.isDragging = false;
    }

    handleErase() {
        if (this.path.length > 1) {
            // Remove the last position from the path
            this.path.pop();
            // Update player position to the new last position
            this.playerPosition = [...this.path[this.path.length - 1]];
            this.renderGrid();
            this.updateUI();

            // Check if we're in a dead end after erasing
            if (!this.hasValidMoves()) {
                this.handleGameOver();
            }
        }
    }

    handleCellClick(x, y) {
        if (!this.isValid(x, y)) return;
        
        // Clear any existing possible moves
        this.clearPossibleMoves();
        
        // If clicking on the last routed cell and hover assistance is enabled, show possible moves
        if (this.isLastRoutedCell(x, y)) {
            if (this.hoverAssistanceEnabled) {
                this.showPossibleMoves(x, y);
            }
            return;
        }
        
        // Silently prevent reusing routed cells
        if (this.isCellRouted(x, y)) {
            return;
        }

        const [currentX, currentY] = this.playerPosition;
        const possibleMoves = this.getPossibleMoves(currentX, currentY);
        
        // Check if the clicked cell is a valid move
        if (possibleMoves.some(([moveX, moveY]) => moveX === x && moveY === y)) {
            // Mark that the player has started moving
            if (!this.hasStartedMoving) {
                this.hasStartedMoving = true;
                this.knightMovementToggle.disabled = true;
                this.hoverAssistanceToggle.disabled = true;
            }

            this.playerPosition = [x, y];
            this.path.push([x, y]);
            this.renderGrid();
            this.updateUI();

            if (x === this.gridSize - 1 && y === this.gridSize - 1) {
                this.handleWin();
            } else if (!this.hasValidMoves()) {
                this.handleGameOver();
            }
        }
    }

    handleWin() {
        const pathLength = this.path.length - 1;
        let bonus = 0;
        
        if (pathLength === this.shortestPathLength) {
            // Base points for shortest path
            const basePoints = this.hoverAssistanceEnabled ? 1000 : 2500;
            
            // Apply grid size multiplier
            const multipliers = {
                6: 1.0,
                7: 1.1,
                8: 1.2,
                9: 1.3
            };
            
            bonus = Math.round(basePoints * multipliers[this.gridSize]);
            this.routingCoins += bonus;
            alert(`Congratulations! You found the shortest path! +${bonus} RoutingCoins`);
        } else {
            bonus = 400;
            this.routingCoins += bonus;
            alert('Good job! You found a valid path. +400 RoutingCoins');
        }

        // Update leaderboard
        this.leaderboard.addPlayer(this.playerName, this.gridSize, this.routingCoins);
        this.leaderboard.renderLeaderboard();

        this.nextLevelBtn.disabled = false;
    }

    hasValidMoves() {
        return this.getPossibleMoves(this.playerPosition[0], this.playerPosition[1]).length > 0;
    }

    isCellRouted(x, y) {
        return this.path.some(([px, py]) => px === x && py === y);
    }

    handleGameOver() {
        alert('Game Over! No valid moves available. Would you like to restart this level?');
        if (confirm('Restart level?')) {
            this.restartLevel();
        }
    }

    restartLevel() {
        this.path = [[0, 0]];
        this.playerPosition = [0, 0];
        this.hasStartedMoving = false;
        this.knightMovementToggle.disabled = false;
        this.hoverAssistanceToggle.disabled = false;
        this.initializeGame();
        this.nextLevelBtn.disabled = true;
        this.hintBtn.disabled = false;
        this.hintBtn.textContent = 'Get Hint (Free: 4 left)';
    }

    getPossibleMoves(x, y) {
        const moves = [];
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        
        // Add regular moves
        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            if (this.isValid(newX, newY) && !this.isCellRouted(newX, newY)) {
                moves.push([newX, newY]);
            }
        }

        // Add knight moves if enabled
        if (this.knightMovementEnabled) {
            const knightMoves = [
                // 2 horizontal + 1 vertical
                [2, 1], [2, -1], [-2, 1], [-2, -1],
                // 2 vertical + 1 horizontal
                [1, 2], [1, -2], [-1, 2], [-1, -2]
            ];

            for (const [dx, dy] of knightMoves) {
                const newX = x + dx;
                const newY = y + dy;
                if (this.isValid(newX, newY) && !this.isCellRouted(newX, newY)) {
                    moves.push([newX, newY]);
                }
            }
        }

        return moves;
    }

    showPossibleMoves(x, y) {
        // Clear previous possible moves
        this.clearPossibleMoves();
        
        // Get and show new possible moves
        const moves = this.getPossibleMoves(x, y);
        moves.forEach(([moveX, moveY]) => {
            const cell = document.querySelector(`[data-x="${moveX}"][data-y="${moveY}"]`);
            if (cell) {
                cell.classList.add('possible-move');
            }
        });
    }

    clearPossibleMoves() {
        const cells = document.querySelectorAll('.possible-move');
        cells.forEach(cell => cell.classList.remove('possible-move'));
    }

    isLastRoutedCell(x, y) {
        const lastCell = this.path[this.path.length - 1];
        return lastCell[0] === x && lastCell[1] === y;
    }

    exitGame() {
        if (confirm('Are you sure you want to exit? Your current progress will be saved.')) {
            // Update leaderboard with current score
            this.leaderboard.addPlayer(this.playerName, this.gridSize, this.routingCoins);
            this.leaderboard.renderLeaderboard();

            // Show login screen and hide game screen
            document.getElementById('login-screen').style.display = 'flex';
            document.getElementById('game-screen').style.display = 'none';

            // Reset form fields
            document.getElementById('player-name').value = '';
            document.getElementById('grid-size').value = '6';
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RoutingGame();
}); 