#!/bin/bash

# This script builds the production version of the frontend,
# starts the backend server, and serves the static frontend.

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

# Build the frontend
echo "Building frontend for production..."
npm run build --prefix "$SCRIPT_DIR"
if [ $? -ne 0 ]; then
    echo "Frontend build failed. Aborting."
    exit 1
fi
echo "Frontend build successful."

# Start the backend server which serves both API and static files
echo "Starting production server..."
cd "$SCRIPT_DIR/backend"
npm start &
SERVER_PID=$!
cd "$SCRIPT_DIR"

# Wait a few seconds to ensure the server has time to start
echo "Waiting for server to initialize..."
sleep 5

FRONTEND_URL="http://localhost:5000"

echo "Production server started at $FRONTEND_URL"
echo "Server will continue running in background after this script exits"
echo "To stop the server, use: pkill -f 'node server.js'"

# Wait for the server process to complete
wait $SERVER_PID
