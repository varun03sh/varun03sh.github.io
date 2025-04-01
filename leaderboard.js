class Leaderboard {
    constructor() {
        this.players = this.loadLeaderboard();
    }

    loadLeaderboard() {
        const savedData = localStorage.getItem('routingGameLeaderboard');
        return savedData ? JSON.parse(savedData) : [];
    }

    saveLeaderboard() {
        localStorage.setItem('routingGameLeaderboard', JSON.stringify(this.players));
    }

    addPlayer(name, gridSize, score) {
        const existingPlayer = this.players.find(p => p.name === name);
        
        if (existingPlayer) {
            // Update existing player's score if new score is higher
            if (score > existingPlayer.score) {
                existingPlayer.score = score;
                existingPlayer.gridSize = gridSize;
                existingPlayer.lastPlayed = new Date().toISOString();
            }
        } else {
            // Add new player
            this.players.push({
                name,
                gridSize,
                score,
                lastPlayed: new Date().toISOString()
            });
        }

        // Sort players by score (descending)
        this.players.sort((a, b) => b.score - a.score);
        
        // Keep only top 10 players
        this.players = this.players.slice(0, 10);
        
        this.saveLeaderboard();
    }

    getLeaderboard() {
        return this.players;
    }

    renderLeaderboard() {
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';

        this.players.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="player-name">${index + 1}. ${player.name}</span>
                <span class="player-score">${player.score} pts (${player.gridSize}x${player.gridSize})</span>
            `;
            leaderboardList.appendChild(item);
        });
    }
} 