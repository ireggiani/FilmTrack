#!/bin/bash

# This script builds the production version of the frontend, starts the backend
# server (which serves both the API and the built SPA), and opens it in the browser.

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

FRONTEND_URL="http://localhost:5000"

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
    echo "Shutting down server..."
    # Kill the whole process group, not just direct children: npm spawns
    # node as a grandchild, which pkill -P would leave orphaned
    kill -- -$$ 2>/dev/null
    echo "Cleanup complete."
}

# Build the frontend (Vite outputs straight into backend/public)
echo "Building frontend for production..."
if ! npm run build --prefix "$SCRIPT_DIR"; then
    echo "Frontend build failed. Aborting."
    pause_if_terminal
    exit 1
fi
echo "Frontend build successful."

# Run cleanup on normal exit, Ctrl+C, kill, or the terminal window being closed
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP

# Start the backend server which serves both API and static files
echo "Starting production server..."
cd "$SCRIPT_DIR/backend"
npm start &

# Open the browser once the server accepts connections (gives up after ~30s)
for _ in $(seq 60); do
    if (echo > /dev/tcp/127.0.0.1/5000) 2>/dev/null; then
        xdg-open "$FRONTEND_URL" &> /dev/null &
        break
    fi
    sleep 0.5
done

echo
echo "FilmTrack running at $FRONTEND_URL - close this window or press Ctrl+C to stop."
echo

# Wait for the server process (which runs until the script is terminated)
wait

# Only reached if the server exited on its own (e.g. port 5000 already in use)
echo
echo "The server has stopped."
pause_if_terminal
