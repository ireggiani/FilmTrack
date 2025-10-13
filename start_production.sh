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

# Start the backend server in the background
echo "Starting backend server..."
cd "$SCRIPT_DIR/backend"
npm start &
cd "$SCRIPT_DIR"

# Serve the production build of the frontend in the background
echo "Serving production frontend..."
# The default port for 'serve' is 3000
npx serve -s "$SCRIPT_DIR/frontend/dist" &

# Wait a few seconds to ensure the servers have time to start
echo "Waiting for servers to initialize..."
sleep 5

FRONTEND_URL="http://localhost:3000"

echo "Opening application at $FRONTEND_URL"
xdg-open "$FRONTEND_URL"

# Wait for all background processes to complete
wait
