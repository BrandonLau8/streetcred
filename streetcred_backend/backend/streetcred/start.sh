#!/bin/bash
set -e

echo "Starting StreetCred Backend..."

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn
echo "Starting Gunicorn on port $PORT..."
gunicorn streetcred.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120
