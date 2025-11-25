#!/bin/bash

echo "Building FilmTrack for production..."

# Install dependencies
echo "Installing dependencies..."
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Build frontend
echo "Building frontend..."
cd frontend && npm run build && cd ..

# Copy built frontend to backend public directory
echo "Copying frontend build to backend..."
mkdir -p backend/public
cp -r frontend/dist/* backend/public/

echo "Production build complete!"
echo "Run './start_production.sh' to start the production server"