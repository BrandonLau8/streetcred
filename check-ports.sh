#!/bin/bash

echo "=== StreetCred Port Checker ==="
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    local service=$2

    if nc -z localhost $port 2>/dev/null; then
        echo "❌ Port $port ($service) is IN USE"
        echo "   Process using port $port:"
        lsof -i :$port 2>/dev/null | head -5 || echo "   (Run with sudo to see details)"
        return 1
    else
        echo "✅ Port $port ($service) is AVAILABLE"
        return 0
    fi
}

echo "Checking required ports..."
echo ""

check_port 8000 "Django Backend"
BACKEND_OK=$?
echo ""

check_port 5173 "Vite Frontend"
FRONTEND_OK=$?
echo ""

echo "=== Summary ==="
if [ $BACKEND_OK -eq 0 ] && [ $FRONTEND_OK -eq 0 ]; then
    echo "✅ All ports available! You can start your servers:"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "  cd streetcred_backend/backend/streetcred"
    echo "  uv run python manage.py runserver"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "  cd frontend"
    echo "  npm run dev"
else
    echo "⚠️ Some ports are in use. Solutions:"
    echo ""
    echo "Option 1: Kill processes using the ports"
    if [ $BACKEND_OK -ne 0 ]; then
        echo "  sudo lsof -t -i:8000 | xargs sudo kill -9"
    fi
    if [ $FRONTEND_OK -ne 0 ]; then
        echo "  sudo lsof -t -i:5173 | xargs sudo kill -9"
    fi
    echo ""
    echo "Option 2: Use different ports"
    if [ $BACKEND_OK -ne 0 ]; then
        echo "  Backend: uv run python manage.py runserver 8001"
    fi
    if [ $FRONTEND_OK -ne 0 ]; then
        echo "  Frontend: npm run dev -- --port 5174"
    fi
    echo ""
    echo "See port-management.md for detailed instructions"
fi
