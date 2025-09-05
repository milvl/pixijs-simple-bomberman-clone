#! /bin/bash

if [ ! -d "dist" ]; then
  echo "Error: dist folder does not exist. Please build the project first."
  exit 1
fi

npx http-server dist -P http://localhost:8080?