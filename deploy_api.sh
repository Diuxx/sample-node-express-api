#!/usr/bin/bash

deliver_path="/var/www/api.nicoblog";
repo="git@github.com:Diuxx/sample-node-express-api.git"
branch="develop"
app_name="api.nicoblog"

# Check if the directory already exists
if [ ! -d "$deliver_path" ]; then
    # If the directory doesn't exist, create it
    eval "sudo mkdir -p \"$deliver_path\""
    echo "Directory created: $deliver_path"
else
    echo "Directory already exists: $deliver_path"
fi

# position
eval "cd /home/ubuntu"

# Pm2 stop
eval "pm2 delete $app_name"

# Remove all files and subdirectories in the directory
eval "sudo rm -r \"$deliver_path\"/*"
echo "Directory contents removed: $deliver_path"

eval "git clone --branch $branch $repo $app_name"
eval "cd ./$app_name"

# Deploy
eval "sudo cp -R ./* ${deliver_path}"

# Pm2 start
eval "cd /var/www/$app_name"
eval "pm2 start index.js --name $app_name"

# Finalize
eval "cd /home/ubuntu"
echo "cleaning files..."
eval "sudo rm -rf ./$app_name"