class Leaderboard {
    constructor() {
        this.leaderboards = {
            6: [], // 6x6 grid leaderboard
            7: [], // 7x7 grid leaderboard
            8: [], // 8x8 grid leaderboard
            9: []  // 9x9 grid leaderboard
        };
        this.loadLeaderboards();
    }

    loadLeaderboards() {
        // Load each grid size's leaderboard from localStorage
        for (let size in this.leaderboards) {
            const leaderboardKey = `leaderboard_${size}`;
            const storedLeaderboard = localStorage.getItem(leaderboardKey);
            if (storedLeaderboard) {
                this.leaderboards[size] = JSON.parse(storedLeaderboard);
            }
        }
    }

    saveLeaderboards() {
        // Save each grid size's leaderboard to localStorage
        for (let size in this.leaderboards) {
            const leaderboardKey = `leaderboard_${size}`;
            localStorage.setItem(leaderboardKey, JSON.stringify(this.leaderboards[size]));
        }
    }

    resetLeaderboards() {
        // Reset each grid size's leaderboard to an empty array
        for (let size in this.leaderboards) {
            this.leaderboards[size] = [];
        }
        // Save the empty leaderboards to localStorage
        this.saveLeaderboards();
    }

    addPlayer(name, score, gridSize) {
        // Check if player already exists
        const existingPlayerIndex = this.leaderboards[gridSize].findIndex(player => player.name === name);
        
        if (existingPlayerIndex !== -1) {
            // Player exists, only update if new score is higher
            if (score > this.leaderboards[gridSize][existingPlayerIndex].score) {
                this.leaderboards[gridSize][existingPlayerIndex] = {
                    name,
                    score,
                    date: new Date().toISOString()
                };
            }
        } else {
            // New player, add to leaderboard
            this.leaderboards[gridSize].push({
                name,
                score,
                date: new Date().toISOString()
            });
        }
        
        // Sort by score (descending)
        this.leaderboards[gridSize].sort((a, b) => b.score - a.score);
        
        // Keep only top 10 players
        this.leaderboards[gridSize] = this.leaderboards[gridSize].slice(0, 10);
        
        // Save to localStorage
        this.saveLeaderboards();
        
        // Update display
        this.renderLeaderboard();
    }

    renderLeaderboard() {
        const leaderboardList = document.getElementById('leaderboard-list');
        if (!leaderboardList) return;

        // Create tabs for different grid sizes
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'leaderboard-tabs';
        
        // Create tab buttons
        Object.keys(this.leaderboards).forEach(size => {
            const tab = document.createElement('button');
            tab.className = 'leaderboard-tab';
            tab.textContent = `${size}x${size} Grid`;
            tab.onclick = () => this.showGridLeaderboard(size);
            tabsContainer.appendChild(tab);
        });

        leaderboardList.innerHTML = '';
        leaderboardList.appendChild(tabsContainer);

        // Show initial leaderboard (6x6)
        this.showGridLeaderboard(6);
    }

    showGridLeaderboard(gridSize) {
        const leaderboardList = document.getElementById('leaderboard-list');
        if (!leaderboardList) return;

        // Remove existing content except tabs
        const tabsContainer = leaderboardList.querySelector('.leaderboard-tabs');
        leaderboardList.innerHTML = '';
        leaderboardList.appendChild(tabsContainer);

        // Create table for the leaderboard
        const table = document.createElement('table');
        table.className = 'leaderboard-table';

        // Add header row
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
            <th>Date</th>
        `;
        table.appendChild(headerRow);

        // Add player rows
        this.leaderboards[gridSize].forEach((player, index) => {
            const row = document.createElement('tr');
            row.className = index < 3 ? `top-${index + 1}` : '';
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${player.name}</td>
                <td>${player.score}</td>
                <td>${new Date(player.date).toLocaleString()}</td>
            `;
            table.appendChild(row);
        });

        leaderboardList.appendChild(table);
    }
} 