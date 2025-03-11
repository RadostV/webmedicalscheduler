import os
import subprocess
import sys


def serve():
    """Serve the documentation locally."""
    subprocess.run(["mkdocs", "serve"])


def build():
    """Build the documentation."""
    subprocess.run(["mkdocs", "build"])


def build_pdf():
    """Build the documentation with PDF export enabled."""
    env = os.environ.copy()
    env["ENABLE_PDF_EXPORT"] = "1"
    subprocess.run(["mkdocs", "build"], env=env)


def deploy_version():
    """Deploy a new version of the documentation.

    Usage: poetry run deploy-version [version] [message]
    Example: poetry run deploy-version 1.0.0 "Initial release"
    """
    args = sys.argv[1:]
    version = args[0] if len(args) > 0 else "latest"
    message = args[1] if len(args) > 1 else f"Deploy version {version}"

    cmd = ["mike", "deploy", "--push", "--update-aliases", version, "latest"]
    if message:
        cmd.extend(["-m", message])

    print(f"Deploying documentation version: {version}")
    print(f"Commit message: {message}")
    subprocess.run(cmd)


if __name__ == "__main__":
    # This allows direct execution of script for debugging
    command = sys.argv[1] if len(sys.argv) > 1 else "serve"

    if command == "serve":
        serve()
    elif command == "build":
        build()
    elif command == "build-pdf":
        build_pdf()
    elif command == "deploy-version":
        deploy_version()
    else:
        print(f"Unknown command: {command}")
        print("Available commands: serve, build, build-pdf, deploy-version")
        sys.exit(1)
