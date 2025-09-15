#!/bin/bash

# This script stops the backend and frontend servers for the FilmTrack application.

echo "Stopping FilmTrack application..."

# --- Stop Backend Server ---
# The backend is started via "npm start", which executes "node server.js".
# We use pkill -f to find and kill the process running that command.
echo "Attempting to stop the backend server..."
pkill -f "node /home/overpower/Biblioteca/Proyectos/React/FilmTrack/backend/server.js"
BACKEND_STOP_STATUS=$?

if [ $BACKEND_STOP_STATUS -eq 0 ]; then
    echo "Backend server process terminated."
else
    echo "Backend server process not found. It might have already been stopped."
fi

# --- Stop Frontend Server ---
# The frontend is started via "npm run dev", which executes "vite".
# We kill the vite process.
echo "Attempting to stop the frontend server..."
pkill -f "vite"
FRONTEND_STOP_STATUS=$?

if [ $FRONTEND_STOP_STATUS -eq 0 ]; then
    echo "Frontend server process terminated."
else
    echo "Frontend server process not found. It might have already been stopped."
fi

if [ $BACKEND_STOP_STATUS -eq 0 ] || [ $FRONTEND_STOP_STATUS -eq 0 ]; then
    echo "FilmTrack application shutdown process is complete."
else
    echo "No running FilmTrack processes were found."
fi
