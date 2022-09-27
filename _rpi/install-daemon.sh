#!/bin/bash

old_pwd=$(pwd)
dir="$(dirname "$0")"

cd $dir

service="como-elements-daemon.service"

echo "Registering \"$service\""

sudo cp "$service" /etc/systemd/system/

sudo systemctl enable "$service"
sudo systemctl daemon-reload
sudo systemctl start "$service"

echo "Enabled and Started \"$service\""


