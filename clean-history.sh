#!/bin/bash

# Create a new branch for the clean history
git checkout --orphan temp_branch

# Add all files to the new branch
git add .

# Commit the changes
git commit -m "Initial commit with clean history"

# Delete the main branch
git branch -D main

# Rename the current branch to main
git branch -m main

# Force push to remote
git push -f origin main

echo "Git history has been cleaned and force pushed to remote."
