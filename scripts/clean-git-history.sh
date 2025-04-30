#!/bin/bash

# This script removes executables from the git history using BFG Repo-Cleaner
# It requires Java to be installed and the BFG jar file to be downloaded

set -e

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "Error: Java is required but not installed. Please install Java first."
    exit 1
fi

# Download BFG if not already present
BFG_VERSION="1.14.0"
BFG_JAR="bfg-${BFG_VERSION}.jar"
if [ ! -f "$BFG_JAR" ]; then
    echo "Downloading BFG Repo-Cleaner..."
    curl -L "https://repo1.maven.org/maven2/com/madgag/bfg/${BFG_VERSION}/bfg-${BFG_VERSION}.jar" -o "$BFG_JAR"
fi

# Create a temporary clone of the repository
echo "Creating a temporary bare clone of the repository..."
git clone --mirror $(git config --get remote.origin.url) repo-mirror.git

# Change to the temporary repository directory
cd repo-mirror.git

# Run BFG to remove executables
echo "Removing executables from git history..."
java -jar ../$BFG_JAR --delete-files "*.exe" --delete-files "statpearls-mcp*" --no-blob-protection

# Clean up and optimize the repository
echo "Cleaning up and optimizing the repository..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Return to the original directory
cd ..

# Instructions for pushing the changes
echo ""
echo "The git history has been cleaned. To apply these changes to your repository:"
echo "1. cd repo-mirror.git"
echo "2. git push --force"
echo "3. cd .."
echo "4. rm -rf repo-mirror.git"
echo ""
echo "IMPORTANT: All collaborators should reclone the repository after this operation!"
echo "This is a destructive operation that rewrites git history."