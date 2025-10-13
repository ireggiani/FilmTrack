#!/bin/bash

# This script stops the production backend and frontend servers.

echo "Stopping FilmTrack production servers..."

# --- Stop Backend Server ---
echo "Attempting to stop the backend server..."
pkill -f "node /home/overpower/Biblioteca/Proyectos/React/FilmTrack/backend/server.js"
BACKEND_STOP_STATUS=$?

if [ $BACKEND_STOP_STATUS -eq 0 ]; then
    echo "Backend server process terminated."
else
    echo "Backend server process not found."
fi

# --- Stop Frontend Server ---
# The production frontend is served with "npx serve -s frontend/dist"
echo "Attempting to stop the frontend server..."
pkill -f "serve -s /home/overover/Biblioteca/Proyectos/React/FilmTrack/frontend/dist"
FRONTEND_STOP_STATUS=$?

if [ $FRONTEND_STOP_STATUS -eq 0 ]; then
    echo "Frontend server process terminated."
else
    echo "Frontend server process not found."
fi

if [ $BACKEND_STOP_STATUS -eq 0 ] || [ $FRONTEND_STOP_STATUS -eq 0 ]; then
    echo "FilmTrack production shutdown process is complete."
else
    echo "No running FilmTrack production processes were found."
fi
