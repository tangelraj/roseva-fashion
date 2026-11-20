
#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput

python manage.py migrate --noinput

if [ "$IMPORT_INITIAL_DATA" = "true" ]; then
    python manage.py import_production_data
fi
