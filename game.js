class RoutingGame {
    constructor() {
        // this.leaderboard = new Leaderboard();
        this.playerName = '';
        this.gridSize = 6;
        this.setupLoginScreen();
        this.cellPoints = []; // Array to store points for each cell
        this.totalPoints = 0; // Total points collected in current path
    }

    setupLoginScreen() {
        const loginScreen = document.getElementById('login-screen');
        const gameScreen = document.getElementById('game-screen');
        const startButton = document.getElementById('start-game');
        const playerNameInput = document.getElementById('player-name');
        const gridSizeSelect = document.getElementById('grid-size');

        // Show leaderboard
        // this.leaderboard.renderLeaderboard();

        startButton.addEventListener('click', () => {
            const name = playerNameInput.value.trim();
            if (!name) {
                alert('Please enter your name!');
                return;
            }

            // Reset all game state
            this.playerName = name;
            this.gridSize = parseInt(gridSizeSelect.value);
            this.currentLevel = 1;
            this.routingCoins = 2000;
            this.hintsLeft = 4;
            this.path = [[0, 0]];
            this.playerPosition = [0, 0];
            this.hasStartedMoving = false;
            this.totalPoints = 0;
            
            // Set CSS variable for grid size
            document.documentElement.style.setProperty('--grid-size', this.gridSize);
            
            // Initialize game with selected grid size
            this.initializeGameState();
            
            // Hide login screen and show game screen
            loginScreen.style.display = 'none';
            gameScreen.style.display = 'block';
            
            // Update player display
            document.getElementById('player-display').textContent = this.playerName;
            
            // Reset and enable controls
            this.hintBtn.disabled = false;
            this.hintBtn.textContent = 'Get Hint (Free: 4 left)';
            this.nextLevelBtn.disabled = true;
            this.knightMovementToggle.disabled = false;
            this.hoverAssistanceToggle.disabled = false;
            this.knightMovementToggle.checked = false;
            this.hoverAssistanceToggle.checked = true;
            
            // Reset UI elements
            this.updateUI();
            this.updateScore();
            this.updateStepHistory();
            
            // Generate new grid and render
            this.generateGrid();
            this.findShortestPath();
            this.renderGrid();
        });
    }

    setupGameScreen() {
        const gameScreen = document.getElementById('game-screen');
        const loginScreen = document.getElementById('login-screen');
        const exitButton = document.getElementById('exit-game');
        const nextLevelButton = document.getElementById('next-level');
        const hintButton = document.getElementById('hint');
        const knightMovementToggle = document.getElementById('knight-movement');
        const hoverAssistanceToggle = document.getElementById('hover-assistance');
        const resetButton = document.getElementById('reset-game');
        // const refreshLeaderboardBtn = document.getElementById('refresh-leaderboard');
        // const resetLeaderboardBtn = document.getElementById('reset-leaderboard');

        // Initialize UI elements
        this.nextLevelBtn = nextLevelButton;
        this.hintBtn = hintButton;
        this.knightMovementToggle = knightMovementToggle;
        this.hoverAssistanceToggle = hoverAssistanceToggle;
        this.scoreDisplay = document.getElementById('score-display');
        this.stepHistory = document.getElementById('step-history');
        // this.refreshLeaderboardBtn = refreshLeaderboardBtn;
        // this.resetLeaderboardBtn = resetLeaderboardBtn;

        // Exit game button
        exitButton.addEventListener('click', () => {
            // Reset game state
            this.initializeGameState();
            
            // Reset player name and clear input
            this.playerName = '';
            document.getElementById('player-name').value = '';
            
            // Reset UI elements
            this.updateUI();
            this.updateScore();
            this.updateStepHistory();
            
            // Hide game screen and show login screen
            gameScreen.style.display = 'none';
            loginScreen.style.display = 'block';
            
            // Reset leaderboard display
            // this.leaderboard.renderLeaderboard();
        });
    }

    initializeGameState() {
        this.grid = [];
        this.shortestPath = [];
        this.shortestPathLength = 0;
        this.isErasing = false;
        this.gameGrid = document.getElementById('game-grid');
        this.currentLevelElement = document.getElementById('current-level');
        this.routingCoinsElement = document.getElementById('routing-coins');
        this.hintsLeftElement = document.getElementById('hints-left');
        this.pathLengthElement = document.getElementById('path-length');
        this.scoreDisplay = document.getElementById('score-display');
        this.stepList = document.getElementById('step-list');
        this.hintBtn = document.getElementById('hint-btn');
        this.buyHintBtn = document.getElementById('buy-hint-btn');
        this.nextLevelBtn = document.getElementById('next-level-btn');
        this.exitGameBtn = document.getElementById('exit-game-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.lastRoutedCell = null;
        this.possibleMovesTimeout = null;
        this.knightMovementEnabled = false;
        this.knightMovementToggle = document.getElementById('knight-movement');
        this.hoverAssistanceEnabled = true;
        this.hoverAssistanceToggle = document.getElementById('hover-assistance');
        this.hasStartedMoving = false;
        this.totalPoints = 0;
        // this.resetLeaderboardBtn = document.getElementById('reset-leaderboard');

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
        this.grid = [];
        this.cellPoints = [];
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            this.cellPoints[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                if (i === 0 && j === 0) {
                    this.grid[i][j] = 1;
                    this.cellPoints[i][j] = 0;
                } else if (i === this.gridSize - 1 && j === this.gridSize - 1) {
                    this.grid[i][j] = 1;
                    this.cellPoints[i][j] = 0;
                } else {
                    this.grid[i][j] = Math.random() > 0.2 ? 1 : 0;
                    if (this.grid[i][j] === 1) {
                        // Generate random number between -300 and 300
                        this.cellPoints[i][j] = Math.floor(Math.random() * 601) - 300;
                    } else {
                        this.cellPoints[i][j] = 0;
                    }
                }
            }
        }
        
        // Ensure valid paths exist
        while (!this.hasValidPaths()) {
            this.generateGrid();
        }
    }

    hasValidPaths() {
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
        this.restartBtn.addEventListener('click', () => this.restartLevel());
        
        // Add right-click and shift key listeners for erasing
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
            this.renderGrid();
        });

        // Add exit game button listener
        this.exitGameBtn.addEventListener('click', () => this.exitGame());
        // this.resetLeaderboardBtn.addEventListener('click', () => this.resetLeaderboard());
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
    }

    renderGrid() {
        this.gameGrid.innerHTML = '';
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = i;
                cell.dataset.y = j;

                // Display cell points for routable cells
                if (this.grid[i][j] === 1 && this.cellPoints[i][j] !== 0) {
                    cell.textContent = this.cellPoints[i][j];
                    cell.dataset.points = this.cellPoints[i][j];
                }

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

    handleErase() {
        if (this.path.length > 1) {
            const lastCell = this.path.pop();
            this.playerPosition = this.path[this.path.length - 1];
            
            // Subtract points from the erased cell
            this.totalPoints -= this.cellPoints[lastCell[0]][lastCell[1]];
            
            this.renderGrid();
            this.updateScore();
            this.updateStepHistory();
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
            
            // Add points from the cell to total points
            this.totalPoints += this.cellPoints[x][y];
            
            this.renderGrid();
            this.updateUI();
            this.updateScore();
            this.updateStepHistory();

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
        let virtualCoins = 0;
        let penalty = 0;

        // Calculate virtual coins from cell points
        this.path.forEach(([x, y]) => {
            if (this.grid[x][y] === 1) {
                virtualCoins += this.cellPoints[x][y];
            }
        });

        // Calculate penalty for steps beyond twice the shortest path
        if (pathLength > this.shortestPathLength * 2) {
            penalty = (pathLength - (this.shortestPathLength * 2)) * 75;
            virtualCoins -= penalty;
        }

        if (pathLength === this.shortestPathLength) {
            const basePoints = this.hoverAssistanceEnabled ? 200 : 800;
            const multipliers = { 6: 1.0, 7: 1.1, 8: 1.2, 9: 1.3 };
            bonus = Math.floor(basePoints * multipliers[this.gridSize]);
            alert(`Congratulations! You found the shortest path!\n\n` +
                  `Base Bonus: +${bonus} RoutingCoins\n` +
                  `Virtual Coins from Path: +${virtualCoins + penalty}\n` +
                  `Penalty for Extra Steps: -${penalty}\n` +
                  `Total Virtual Coins: ${bonus + virtualCoins}`);
        } else {
            bonus = 100;
            alert(`Good job! You found a valid path.\n\n` +
                  `Base Bonus: +${bonus} RoutingCoins\n` +
                  `Virtual Coins from Path: +${virtualCoins + penalty}\n` +
                  `Penalty for Extra Steps: -${penalty}\n` +
                  `Total Virtual Coins: ${bonus + virtualCoins}`);
        }

        this.routingCoins += bonus;
        // this.leaderboard.addPlayer(this.playerName, this.gridSize, this.routingCoins);
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
        // Reset game state while keeping the same grid configuration
        this.path = [[0, 0]];
        this.playerPosition = [0, 0];
        this.hasStartedMoving = false;
        this.knightMovementToggle.disabled = false;
        this.hoverAssistanceToggle.disabled = false;
        this.totalPoints = 0;
        this.nextLevelBtn.disabled = true;
        this.hintBtn.disabled = false;
        this.hintBtn.textContent = 'Get Hint (Free: 4 left)';
        
        // Update UI and render grid
        this.updateUI();
        this.updateScore();
        this.updateStepHistory();
        this.renderGrid();
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
            // this.leaderboard.addPlayer(this.playerName, this.gridSize, this.routingCoins);
            // this.leaderboard.renderLeaderboard();

            // Show login screen and hide game screen
            document.getElementById('login-screen').style.display = 'flex';
            document.getElementById('game-screen').style.display = 'none';

            // Reset form fields
            document.getElementById('player-name').value = '';
            document.getElementById('grid-size').value = '6';
        }
    }

    updateScore() {
        const pathLength = this.path.length - 1;
        const pathScore = (this.shortestPathLength / pathLength) * 100;
        this.scoreDisplay.textContent = `Score: ${Math.floor(pathScore)} (Path Length: ${pathLength})`;
    }

    resetLeaderboard() {
        // Leaderboard functionality disabled
        alert('Leaderboard functionality is currently disabled.');
    }

    updateStepHistory() {
        this.stepList.innerHTML = '';
        this.path.forEach((step, index) => {
            const stepItem = document.createElement('div');
            stepItem.className = 'step-item';
            
            const stepNumber = document.createElement('span');
            stepNumber.className = 'step-number';
            stepNumber.textContent = `Step ${index + 1}`;
            
            const coordinates = document.createElement('span');
            coordinates.className = 'step-coordinates';
            coordinates.textContent = `(${step[0]}, ${step[1]})`;
            
            const points = document.createElement('span');
            
            if (index === 0) {
                points.className = 'step-points';
                points.textContent = 'Start';
            } else if (index === this.path.length - 1 && step[0] === this.gridSize - 1 && step[1] === this.gridSize - 1) {
                points.className = 'step-points';
                points.textContent = 'End';
            } else {
                const cellPoints = this.cellPoints[step[0]][step[1]];
                if (cellPoints > 0) {
                    points.className = 'step-points';
                    points.textContent = `+${cellPoints} points`;
                } else if (cellPoints < 0) {
                    points.className = 'step-penalty';
                    points.textContent = `${cellPoints} points`;
                } else {
                    points.className = 'step-points';
                    points.textContent = '0 points';
                }
            }
            
            stepItem.appendChild(stepNumber);
            stepItem.appendChild(coordinates);
            stepItem.appendChild(points);
            this.stepList.appendChild(stepItem);
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RoutingGame();
}); 