#!/bin/bash

echo "Setting up MsituMum - Forest Restoration Intelligence System"
echo "=============================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "Node.js found: $(node --version)"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env file..."
    cp .env.example .env
    echo ".env file created"
fi

# Initialize database
echo ""
echo "Initializing database..."
npm run init-db

echo ""
echo "Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev      # Start both frontend and backend"
echo ""
echo "Or start them separately:"
echo "  npm run server   # Start backend API server"
echo "  npm run client   # Start frontend dev server"
echo ""
echo "Default credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "API will be available at: http://localhost:5000"
echo "Frontend will be available at: http://localhost:3000"
echo ""
