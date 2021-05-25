#!/bin/bash

clean_up() {
    echo 'clean up'
    echo "$secret" | sudo killall dnsmasq
}

# double-click
cd "$( dirname "$0" )" || (echo "no dir: ${0}"; exit 1)

# debug
dnsmasq_command="$(pwd)/bin/dnsmasq --no-daemon --conf-file=./dnsmasq.conf"

# service
# command="$(pwd)/bin/dnsmasq --keep-in-foreground --conf-file=dnsmasq.conf"


echo
echo "****************************************"
echo "* Please type your password            *"
echo "****************************************"
echo

read -r -s secret

sudo -k
while (( $(echo "$secret" | sudo -S echo 1 || echo 0) == 0 )) ; do
    echo
    echo "****************************************"
    echo "* Please type your password again      *"
    echo "****************************************"
    echo
    read -r -s secret
done

echo "OK"
echo

echo "$secret" | sudo -S rm -f dnsmasq.leases

mkdir -p log

while true ; do
    log_file="log/dnsmasq_run_$(date +"%Y-%m-%d_%H-%M-%S").log"
    date | tee "$log_file"

    echo 'start dnsmasq' | tee -a "$log_file"

    echo "$secret" | sudo -S killall dnsmasq | tee "$log_file"
    echo "$secret" | sudo -S ${dnsmasq_command} | tee "$log_file"
    sleep 1
done
