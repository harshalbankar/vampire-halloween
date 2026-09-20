#!/bin/bash
# Vampire Halloween WebGL Experience Launcher
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

PORT=8080
# Check if port is already in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
  echo "Server already running on port $PORT."
else
  echo "Starting local HTTP server on http://localhost:$PORT..."
  python3 -m http.server $PORT &
  sleep 1
fi

echo "Opening Vampire Halloween experience in browser..."
open "http://localhost:$PORT"
