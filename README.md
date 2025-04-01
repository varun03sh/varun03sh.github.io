# Routing Game

A Python implementation of the Routing Game using Tkinter for the GUI. The game challenges players to find the shortest path from start to end in a grid while collecting points along the way.

## Features

- Grid-based gameplay with customizable grid sizes (6x6 to 9x9)
- Random point values (100-800) assigned to each cell
- Knight movement option for advanced gameplay
- Hover assistance to show possible moves
- Hint system with free and purchasable hints
- Leaderboard system to track high scores
- Multiple levels with increasing difficulty

## Requirements

- Python 3.x
- Tkinter (usually comes with Python)

## Installation

1. Clone this repository or download the source files
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## How to Play

1. Run the game:
   ```bash
   python routing_game.py
   ```

2. Enter your name and select a grid size on the login screen
3. Click "Start Game" to begin
4. Navigate from the start (S) to the end (E) cell
5. Collect points by passing through cells with numbers
6. Use hints and special movement options to help you find the optimal path
7. Try to find the shortest path for bonus points!

## Controls

- Click on cells to move
- Use the "Get Hint" button for free hints
- Buy additional hints with RoutingCoins
- Toggle Knight Movement before starting
- Enable/disable Hover Assistance
- Exit game to save progress

## Scoring System

- Base points for finding a valid path
- Bonus points for finding the shortest path
- Additional points from cells in your path
- Grid size multipliers for higher difficulty levels

## Leaderboard

The game maintains a leaderboard of the top 10 players, sorted by total RoutingCoins earned. The leaderboard is automatically saved and loaded between sessions. 