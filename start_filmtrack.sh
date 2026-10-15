#!/bin/bash

# This script starts the backend and frontend servers for the FilmTrack application.

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Keep the window open on failure when launched from the .desktop file,
# so errors stay readable instead of the terminal vanishing
pause_if_terminal() {
    [ -t 0 ] && read -rp "Press Enter to close this window..."
}

# Node is installed via nvm, which is only loaded by ~/.bashrc in interactive
# shells; load it here so the script also works when launched from the desktop
if ! command -v npm &> /dev/null; then
    export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
fi
if ! command -v npm &> /dev/null; then
    echo "Error: npm not found. Is Node.js installed?"
    pause_if_terminal
    exit 1
fi

# Function to clean up background processes when the script exits
cleanup() {
    trap - EXIT INT HUP
    trap "" TERM  # so the group kill below does not cut this function short
    echo "Shutting down servers..."
    # Kill the whole process group, not just direct children: npm spawns
    # node/nodemon/vite as grandchildren, which pkill -P would leave orphaned
    kill -- -$$ 2>/dev/null
    echo "Cleanup complete."
}

# Run cleanup on normal exit, Ctrl+C, kill, or the terminal window being closed
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP

# Start the backend server in the background
echo "Starting backend server..."
cd "$SCRIPT_DIR/backend"
npm start &

# Start the frontend server in the background
echo "Starting frontend server..."
cd "$SCRIPT_DIR/frontend"
npm run dev &

echo
echo "FilmTrack dev servers running - close this window or press Ctrl+C to stop."
echo

# Wait for all background processes to complete (which they won't, until the script is terminated)
wait

# Only reached if both servers exited on their own (e.g. a crash on startup)
echo
echo "Both servers have stopped."
pause_if_terminal
