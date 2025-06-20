#!/bin/bash

# Kill any running process on the Vite port
lsof -t -i:5173 | xargs kill -9

# Start the proxy server
./proxy/index.js &

# Start the main application server
pnpm dev
