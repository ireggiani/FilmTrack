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

# Wait for all background processes to complete (which they won't, until the script is terminated)
wait
