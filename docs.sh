#!/bin/bash

# A simple wrapper for documentation commands

if [ "$1" == "serve" ]; then
    # Activate poetry environment and run the serve script
    poetry run python run_serve.py
elif [ "$1" == "build" ]; then
    # Activate poetry environment and run the build script
    poetry run python run_build.py
elif [ "$1" == "build-pdf" ]; then
    # Activate poetry environment and run the build-pdf script
    poetry run python run_build_pdf.py
elif [ "$1" == "deploy-version" ]; then
    # Activate poetry environment and run the deploy-version script
    # Pass all remaining arguments
    poetry run python run_deploy_version.py "${@:2}"
else
    echo "Unknown command: $1"
    echo "Available commands: serve, build, build-pdf, deploy-version"
    exit 1
fi 