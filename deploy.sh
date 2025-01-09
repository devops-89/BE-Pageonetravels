#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Variables
DIST_FOLDER="dist"
SERVER_USER="ubuntu"
SERVER_IP="23.23.25.108"
SERVER_PATH="/home/ubuntu/page-one-v2/backend/build"
PEM_FILE="C:\Users\91999\OneDrive\Documents\AnuKulkarni\pageonetravels.pem"

# Step 1: Run the build command to update the dist folder
npm run build:all

# Step 2: Create a tar.gz archive of the dist folder
tar -czf ${DIST_FOLDER}.tar.gz $DIST_FOLDER

# Step 3: Upload to the server
scp -i $PEM_FILE ${DIST_FOLDER}.tar.gz $SERVER_USER@$SERVER_IP:$SERVER_PATH

# Step 4: SSH into the server and deploy
ssh -i $PEM_FILE $SERVER_USER@$SERVER_IP <<EOF
  cd $SERVER_PATH

  # Remove the existing dist folder
  rm -rf $DIST_FOLDER/

  # Extract the new dist folder
  tar -xzf ${DIST_FOLDER}.tar.gz

  # Remove the tar.gz file to keep the directory clean
  rm -f ${DIST_FOLDER}.tar.gz
EOF

# Cleanup local tar.gz file
rm -rf ${DIST_FOLDER}.tar.gz

echo "Dist folder updated successfully."
