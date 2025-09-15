#!/bin/bash

# This script starts the backend and frontend servers for the FilmTrack application.

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Function to clean up background processes when the script exits
cleanup() {
    echo "Shutting down servers..."
    # Kill all child processes started by this script
    pkill -P $$
    echo "Cleanup complete."
}

# Set a trap to call the cleanup function on script exit
trap cleanup EXIT

# Start the backend server in the background
echo "Starting backend server..."
cd "$SCRIPT_DIR/backend"
npm start &

# Start the frontend server in the background
echo "Starting frontend server..."
cd "$SCRIPT_DIR/frontend"
npm run dev &

# Wait a few seconds to ensure the servers have time to start
echo "Waiting for servers to initialize..."
sleep 5

# The default Vite port is 5173. If you have configured a different port,
# change the URL below.
FRONTEND_URL="http://localhost:5173"

echo "Opening application at $FRONTEND_URL"
xdg-open "$FRONTEND_URL"

# Wait for all background processes to complete (which they won't, until the script is terminated)
wait
