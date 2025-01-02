#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Variables
BUILD_FOLDER="build"
SERVER_USER="ubuntu"
SERVER_IP="23.23.25.108"
SERVER_PATH="/home/ubuntu/page-one-v2/backend"
SERVICE_NAME="flight"
PEM_FILE="../"

# Step 1: Create build folder
rm -rf $BUILD_FOLDER
mkdir $BUILD_FOLDER

# Step 2: Copy package.json to build folder
cp package.json $BUILD_FOLDER

# Step 3: Run the build command
npm run build $SERVICE_NAME

# Step 4: Copy build files to the build folder
cp -R dist $BUILD_FOLDER/dist

# Step 5: Zip the build folder
zip -r ${BUILD_FOLDER}.zip $BUILD_FOLDER
# tar -czf ${BUILD_FOLDER}.tar.gz $BUILD_FOLDER


# Step 6: Upload to the server
scp -i $PEM_FILE ${BUILD_FOLDER}.zip $SERVER_USER@$SERVER_IP:$SERVER_PATH

# Step 7: SSH into the server and deploy
ssh -i $PEM_FILE $SERVER_USER@$SERVER_IP <<EOF
  cd $SERVER_PATH
  
  # Unzip the build folder
  unzip -o ${BUILD_FOLDER}.zip

  # Navigate to the build directory
  cd $BUILD_FOLDER

  # Install dependencies
  npm install

  # Manage PM2 process
  pm2 delete "$SERVICE_NAME" || true
  pm2 start dist/apps/flightmain.js --name "$SERVICE_NAME"

  cd  ..
  rm -rf ${BUILD_FOLDER}.zipc:\Users\91999\OneDrive\Documents\AnuKulkarni\builds.sh
  
EOF

# Cleanup local build files
rm -rf $BUILD_FOLDER ${BUILD_FOLDER}.zip

echo "Build and deployment completed successfully."
