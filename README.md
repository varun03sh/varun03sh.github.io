# Routing with Shortest Path

A web-based routing game where players navigate through a grid to find the shortest path from start to end point.

## Features

- Grid-based routing game with configurable grid size
- Knight movement option
- Hover assistance for possible moves
- Leaderboard system
- Player login and progress tracking
- Multiple difficulty levels
- Visual path tracking
- Game over detection
- Exit functionality

## Game Rules

1. Start from the top-left corner (0,0)
2. Move to the bottom-right corner (n-1,n-1)
3. Can only move to adjacent cells (up, down, left, right)
4. Cannot move through blocked cells
5. Cannot reuse already routed cells
6. Game ends if no valid moves are available
7. Score is based on the length of the path taken

## Technical Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Local Storage for leaderboard data

## Files Structure

- `index.html` - Main game interface
- `styles.css` - Game styling
- `game.js` - Core game logic
- `leaderboard.js` - Leaderboard functionality

## Setup

1. Clone the repository
2. Open `index.html` in a web browser
3. Enter player name and select grid size
4. Click "Start Game" to begin

## Controls

- Click on cells to move
- Use arrow keys for movement (if enabled)
- Toggle knight movement and hover assistance before first move
- Use hint button for assistance
- Use erase button to undo moves
- Exit button to return to login screen

## Version History

- v1.0.0 - Initial release with core game features
- v1.1.0 - Added knight movement and hover assistance
- v1.2.0 - Added leaderboard and player login
- v1.3.0 - Added game over detection and exit functionality 