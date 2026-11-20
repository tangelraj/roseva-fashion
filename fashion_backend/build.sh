
#!/usr/bin/env bash

set -o errexit

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Applying database migrations..."
python manage.py migrate --noinput

if [ "$IMPORT_INITIAL_DATA" = "true" ]; then
    echo "Running initial data import..."
    python manage.py import_production_data
else
    echo "Initial data import disabled."
fi

echo "Build completed successfully."
