FROM python:3.11-slim

WORKDIR /app

# Install dependencies for postgres adapter and dos2unix for fixing windows CRLF scripts
RUN apt-get update && apt-get install -y libpq-dev gcc dos2unix \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Ensure installing python packages works well
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Fix bash script executions just in case we are developing from windows
RUN dos2unix app_entrypoint.sh
RUN chmod +x app_entrypoint.sh

EXPOSE 8000

CMD ["./app_entrypoint.sh"]
